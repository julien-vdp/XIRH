<?php
// XIRH BPMN question type. GNU GPL v3 or later.
namespace qtype_xirhbpmn;
defined('MOODLE_INTERNAL') || die();

/** Bounded, non-executable subset of BPMN 2.0. Never interpret submitted XML as HTML/SVG. */
final class diagram {
    public const MAX_BYTES = 1048576;
    private const BPMN = 'http://www.omg.org/spec/BPMN/20100524/MODEL';
    private const ELEMENTS = [
        self::BPMN => ['definitions', 'process', 'startEvent', 'endEvent', 'task', 'exclusiveGateway',
            'sequenceFlow', 'incoming', 'outgoing'],
        'http://www.omg.org/spec/BPMN/20100524/DI' => ['BPMNDiagram', 'BPMNPlane', 'BPMNShape', 'BPMNEdge', 'BPMNLabel'],
        'http://www.omg.org/spec/DD/20100524/DC' => ['Bounds'],
        'http://www.omg.org/spec/DD/20100524/DI' => ['waypoint'],
    ];
    private const ATTRIBUTES = ['id', 'name', 'targetNamespace', 'exporter', 'exporterVersion', 'isExecutable',
        'sourceRef', 'targetRef', 'bpmnElement', 'isHorizontal', 'isMarkerVisible', 'x', 'y', 'width', 'height'];

    /** @return array|null Counts/labels on success, null for unsafe or unsupported documents. */
    public static function inspect(string $xml): ?array {
        if ($xml === '' || strlen($xml) > self::MAX_BYTES || preg_match('/<!DOCTYPE|<!ENTITY/i', $xml)) {
            return null;
        }
        $previous = libxml_use_internal_errors(true);
        try {
            $doc = new \DOMDocument();
            if (!$doc->loadXML($xml, LIBXML_NONET) || $doc->doctype ||
                    $doc->documentElement->namespaceURI !== self::BPMN ||
                    $doc->documentElement->localName !== 'definitions') {
                return null;
            }
            $result = ['shapes' => 0, 'flows' => 0, 'labels' => []];
            $ids = [];
            $nodes = [];
            $flows = [];
            $elements = $doc->getElementsByTagName('*');
            if ($elements->length > 3500) {
                return null;
            }
            foreach ($elements as $element) {
                $kind = $element->localName;
                if (!in_array($kind, self::ELEMENTS[$element->namespaceURI] ?? [], true)) {
                    return null;
                }
                foreach ($element->attributes as $attribute) {
                    if ($attribute->namespaceURI || !in_array($attribute->name, self::ATTRIBUTES, true) ||
                            strlen($attribute->value) > 2000) {
                        return null;
                    }
                    if (in_array($attribute->name, ['x', 'y', 'width', 'height'], true) &&
                            (!is_numeric($attribute->value) || abs((float)$attribute->value) > 1000000)) {
                        return null;
                    }
                }
                if ($element->hasAttribute('id')) {
                    $id = $element->getAttribute('id');
                    if (!preg_match('/^[A-Za-z_][A-Za-z0-9_.-]{0,127}$/D', $id) || isset($ids[$id])) {
                        return null;
                    }
                    $ids[$id] = true;
                }
                if ($element->namespaceURI === self::BPMN) {
                    if (in_array($kind, ['startEvent', 'endEvent', 'task', 'exclusiveGateway'], true)) {
                        $nodes[$element->getAttribute('id')] = true;
                        $result['shapes']++;
                    } else if ($kind === 'sequenceFlow') {
                        $flows[] = [$element->getAttribute('sourceRef'), $element->getAttribute('targetRef')];
                        $result['flows']++;
                    }
                    if ($element->hasAttribute('name')) {
                        $result['labels'][] = mb_substr($element->getAttribute('name'), 0, 120);
                    }
                }
            }
            foreach ($flows as [$source, $target]) {
                if (!isset($nodes[$source], $nodes[$target])) {
                    return null;
                }
            }
            if ($result['shapes'] > 150 || $result['flows'] > 300) {
                return null;
            }
            $result['labels'] = array_slice($result['labels'], 0, 30);
            return $result;
        } catch (\Throwable $e) {
            return null;
        } finally {
            libxml_clear_errors();
            libxml_use_internal_errors($previous);
        }
    }
}
