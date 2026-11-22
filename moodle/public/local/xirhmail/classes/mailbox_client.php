<?php
namespace local_xirhmail;
defined('MOODLE_INTERNAL') || die();

/** Small bounded IMAP reader for the dedicated OVH mailbox; no mutation commands. */
class mailbox_client {
    protected $socket;
    private int $sequence = 0;

    public function connect(string $username, string $password): int {
        if (preg_match('/[\x00-\x1f\x7f]/', $username . $password)) {
            throw new \moodle_exception('syncfailed', 'local_xirhmail');
        }
        $context = stream_context_create(['ssl' => ['verify_peer' => true, 'verify_peer_name' => true,
            'peer_name' => 'ssl0.ovh.net', 'allow_self_signed' => false]]);
        $this->socket = @stream_socket_client('tls://ssl0.ovh.net:993', $errno, $error, 15,
            STREAM_CLIENT_CONNECT, $context);
        if (!$this->socket) {
            throw new \moodle_exception('syncfailed', 'local_xirhmail');
        }
        stream_set_timeout($this->socket, 15);
        if (!preg_match('/^\* OK\b/i', (string)fgets($this->socket, 8192))) {
            throw new \moodle_exception('syncfailed', 'local_xirhmail');
        }
        $quote = static fn($value) => '"' . addcslashes($value, '\\"') . '"';
        $this->command('LOGIN ' . $quote($username) . ' ' . $quote($password));
        $reply = $this->command('EXAMINE INBOX');
        if (!preg_match('/\[UIDVALIDITY (\d+)\]/i', $reply['lines'], $m)) {
            throw new \moodle_exception('syncfailed', 'local_xirhmail');
        }
        return (int)$m[1];
    }

    public function search(int $after): array {
        $reply = $this->command('UID SEARCH UID ' . ($after + 1) . ':*');
        if (!preg_match('/^\* SEARCH([^\r\n]*)/m', $reply['lines'], $m)) {
            throw new \moodle_exception('syncfailed', 'local_xirhmail');
        }
        $ids = array_filter(array_map('intval', preg_split('/\s+/', trim($m[1]))), static fn($id) => $id > $after);
        sort($ids, SORT_NUMERIC);
        return array_slice(array_unique($ids), 0, 50);
    }

    public function message(int $uid): array {
        $reply = $this->command('UID FETCH ' . $uid . ' (INTERNALDATE RFC822.SIZE BODY.PEEK[]<0.' . dsn_parser::MAX_BYTES . '>)');
        if (!preg_match('/\bUID ' . $uid . '\b/i', $reply['lines']) ||
                !preg_match('/RFC822.SIZE (\d+)/i', $reply['lines'], $size)) {
            throw new \moodle_exception('syncfailed', 'local_xirhmail');
        }
        preg_match('/INTERNALDATE "([^"]+)"/i', $reply['lines'], $date);
        if ((int)$size[1] <= dsn_parser::MAX_BYTES && !isset($reply['literals'][0])) {
            throw new \moodle_exception('syncfailed', 'local_xirhmail');
        }
        return ['raw' => ((int)$size[1] > dsn_parser::MAX_BYTES) ? '' : ($reply['literals'][0] ?? ''),
            'oversize' => (int)$size[1] > dsn_parser::MAX_BYTES,
            'received' => min(time(), strtotime($date[1] ?? '') ?: time())];
    }

    protected function command(string $command): array {
        $tag = 'X' . ++$this->sequence;
        $request = $tag . ' ' . $command . "\r\n";
        $offset = 0;
        while ($offset < strlen($request)) {
            $written = fwrite($this->socket, substr($request, $offset));
            if (!$written) {
                throw new \moodle_exception('syncfailed', 'local_xirhmail');
            }
            $offset += $written;
        }
        return $this->read_reply($tag);
    }

    /** Parse literals by byte count, not by line or MIME content. Never expose server replies in errors. */
    protected function read_reply(string $tag): array {
        $lines = '';
        $literals = [];
        $bytes = 0;
        while (($line = fgets($this->socket, 8192)) !== false) {
            $bytes += strlen($line);
            if ($bytes > dsn_parser::MAX_BYTES + 65536 || count($literals) > 2) {
                throw new \moodle_exception('syncfailed', 'local_xirhmail');
            }
            $lines .= $line;
            if (preg_match('/\{(\d+)\}\r\n$/', $line, $m)) {
                $length = (int)$m[1];
                if ($length > dsn_parser::MAX_BYTES) {
                    throw new \moodle_exception('syncfailed', 'local_xirhmail');
                }
                $literal = '';
                while (strlen($literal) < $length) {
                    $chunk = fread($this->socket, min(8192, $length - strlen($literal)));
                    if ($chunk === false || $chunk === '') {
                        throw new \moodle_exception('syncfailed', 'local_xirhmail');
                    }
                    $literal .= $chunk;
                }
                $bytes += $length;
                $literals[] = $literal;
            }
            if (str_starts_with($line, $tag . ' ')) {
                if (!str_starts_with($line, $tag . ' OK')) {
                    throw new \moodle_exception('syncfailed', 'local_xirhmail');
                }
                return ['lines' => $lines, 'literals' => $literals];
            }
        }
        throw new \moodle_exception('syncfailed', 'local_xirhmail');
    }

    public function close(): void {
        if (is_resource($this->socket)) {
            // Closing a read-only connection cannot expunge or mark any message as read.
            fclose($this->socket);
        }
        $this->socket = null;
    }

    public function __destruct() {
        $this->close();
    }
}
