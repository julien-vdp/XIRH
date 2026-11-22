<?php
// XIRH BPMN question type. GNU GPL v3 or later.
namespace qtype_xirhbpmn;
defined('MOODLE_INTERNAL') || die();

#[\PHPUnit\Framework\Attributes\CoversClass(diagram::class)]
final class diagram_test extends \basic_testcase {
    private function fixture(): string {
        return file_get_contents(__DIR__ . '/fixtures/process.bpmn');
    }

    public function test_counts_and_labels(): void {
        $diagram = diagram::inspect($this->fixture());
        $this->assertSame(3, $diagram['shapes']);
        $this->assertSame(2, $diagram['flows']);
        $this->assertContains('Dossier reçu', $diagram['labels']);
    }

    public function test_empty_and_malformed_documents(): void {
        foreach (['', '<invalid', '<svg xmlns="http://www.w3.org/2000/svg"/>',
                str_repeat('x', diagram::MAX_BYTES + 1)] as $xml) {
            $this->assertNull(diagram::inspect($xml));
        }
    }

    public function test_rejects_entities_and_foreign_markup(): void {
        $xml = $this->fixture();
        $this->assertNull(diagram::inspect(str_replace('<?xml version="1.0" encoding="UTF-8"?>',
            '<!DOCTYPE x [<!ENTITY leak SYSTEM "file:///etc/passwd">]>', $xml)));
        $this->assertNull(diagram::inspect(str_replace('<bpmn:task ', '<bpmn:scriptTask ',
            str_replace('</bpmn:task>', '</bpmn:scriptTask>', $xml))));
        $this->assertNull(diagram::inspect(str_replace('name="Traiter la demande"',
            'onclick="alert(1)"', $xml)));
        $this->assertNull(diagram::inspect(str_replace('<bpmn:task ',
            '<script xmlns="http://www.w3.org/1999/xhtml"/><bpmn:task ', $xml)));
    }

    public function test_rejects_dangling_flows_and_duplicate_ids(): void {
        $xml = $this->fixture();
        $this->assertNull(diagram::inspect(str_replace('targetRef="Task_1"', 'targetRef="Missing"', $xml)));
        $this->assertNull(diagram::inspect(str_replace('id="Task_1"', 'id="Start_1"', $xml)));
        $this->assertNull(diagram::inspect(str_replace('x="150"', 'x="NaN"', $xml)));
    }

    public function test_plain_text_labels_are_data(): void {
        $diagram = diagram::inspect(str_replace('Traiter la demande', '&lt;img src=x onerror=alert(1)&gt;', $this->fixture()));
        $this->assertNotNull($diagram);
        $this->assertContains('<img src=x onerror=alert(1)>', $diagram['labels']);
    }

    public function test_shape_limit(): void {
        $tasks = '';
        for ($i = 0; $i < 151; $i++) {
            $tasks .= '<bpmn:task id="Extra_' . $i . '"/>';
        }
        $this->assertNull(diagram::inspect(str_replace('</bpmn:process>', $tasks . '</bpmn:process>', $this->fixture())));
    }
}
