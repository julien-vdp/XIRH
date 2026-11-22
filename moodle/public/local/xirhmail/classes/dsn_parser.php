<?php
namespace local_xirhmail;
defined('MOODLE_INTERNAL') || die();

/** Parse RFC 3464 reports, never the original message body or its credentials. */
final class dsn_parser {
    public const MAX_BYTES = 1048576;

    public static function parse(string $message): array {
        if (strlen($message) > self::MAX_BYTES) {
            return [];
        }
        $reports = [];
        $original = ['messageid' => '', 'senttime' => 0];
        self::walk(str_replace("\r\n", "\n", $message), $reports, $original, 0, false);
        return array_map(static fn($report) => $report + $original, $reports);
    }

    public static function headers(string $text): array {
        $text = preg_replace('/\n[ \t]+/', ' ', $text);
        $result = [];
        foreach (explode("\n", $text) as $line) {
            if (preg_match('/^([a-z0-9-]+):[ \t]*(.*)$/i', $line, $m)) {
                $result[strtolower($m[1])] = trim($m[2]);
            }
        }
        return $result;
    }

    private static function walk(string $part, array &$reports, array &$original, int $depth, bool $inreport): void {
        if ($depth > 6) {
            return;
        }
        [$rawheaders, $body] = array_pad(explode("\n\n", ltrim($part, "\n"), 2), 2, '');
        $headers = self::headers($rawheaders);
        $type = strtolower($headers['content-type'] ?? 'text/plain');
        $inreport = $inreport || (str_starts_with($type, 'multipart/report') &&
            preg_match('/report-type\s*=\s*"?delivery-status\b/i', $type));
        if (str_starts_with($type, 'multipart/')) {
            if (preg_match('/boundary\s*=\s*(?:"([^"\r\n]+)"|([^;\s]+))/i', $headers['content-type'], $m)) {
                $boundary = $m[1] !== '' ? $m[1] : $m[2];
                $parts = preg_split('/^--' . preg_quote($boundary, '/') . '(?:--)?[ \t]*$/m', $body);
                // Ignore the preamble and the closing boundary's epilogue.
                foreach (array_slice($parts, 1, 100) as $child) {
                    self::walk($child, $reports, $original, $depth + 1, (bool)$inreport);
                }
            }
            return;
        }
        if (!$inreport) {
            return;
        }
        $encoding = strtolower($headers['content-transfer-encoding'] ?? '');
        if ($encoding === 'base64') {
            $body = base64_decode($body, true) ?: '';
        } else if ($encoding === 'quoted-printable') {
            $body = quoted_printable_decode($body);
        }
        $body = str_replace("\r\n", "\n", $body);
        if (str_starts_with($type, 'message/rfc822') || str_starts_with($type, 'text/rfc822-headers')) {
            $originalheaders = self::headers(explode("\n\n", ltrim($body, "\n"), 2)[0]);
            $original['messageid'] = substr(preg_replace('/[\x00-\x20\x7f]/', '', $originalheaders['message-id'] ?? ''), 0, 254);
            $original['senttime'] = max(0, min(time(), strtotime($originalheaders['date'] ?? '') ?: 0));
            return; // In particular, do not descend into an attached original email.
        }
        if (!str_starts_with($type, 'message/delivery-status')) {
            return;
        }
        foreach (preg_split('/\n\s*\n/', trim($body)) as $block) {
            $fields = self::headers($block);
            $recipient = $fields['final-recipient'] ?? '';
            if (!preg_match('/^rfc822;\s*(.+)$/i', $recipient, $m)) {
                continue;
            }
            $email = strtolower(trim($m[1], ' <>'));
            $action = strtolower($fields['action'] ?? '');
            $status = $fields['status'] ?? '';
            if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254 ||
                    !in_array($action, ['failed', 'delayed'], true) || !preg_match('/^[45]\.\d{1,3}\.\d{1,3}$/', $status)) {
                continue;
            }
            // Keep only a short diagnostic, not arbitrary headers or original content.
            $diagnostic = preg_replace('/[\x00-\x1f\x7f]/u', ' ', $fields['diagnostic-code'] ?? $status) ?? $status;
            $reports[] = ['email' => $email, 'action' => $action, 'status' => $status,
                'diagnostic' => \core_text::substr($diagnostic, 0, 512)];
        }
    }
}
