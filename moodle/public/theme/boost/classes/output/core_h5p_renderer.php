<?php
// This file is part of Moodle - http://moodle.org/
// Moodle is distributed under the GNU GPL v3 or later.

namespace theme_boost\output;

defined('MOODLE_INTERNAL') || die();

/**
 * Academy presentation inside H5P players, including their nested iframe.
 *
 * @package theme_boost
 * @copyright 2026 XIRH
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class core_h5p_renderer extends \core_h5p\output\renderer {
    /**
     * Append the Academy skin after native and administrator-defined styles.
     *
     * @param \stdClass[] $styles Stylesheet descriptors.
     * @param array $libraries Loaded H5P libraries.
     * @param string $embedtype Player/editor rendering mode.
     */
    public function h5p_alter_styles(&$styles, array $libraries, string $embedtype) {
        parent::h5p_alter_styles($styles, $libraries, $embedtype);

        // Keep the authoring interface native. Player previews still use iframe mode.
        $cssfile = __DIR__ . '/../../style/academy-h5p.css';
        if ($embedtype === 'editor' || !is_readable($cssfile)) {
            return;
        }

        $styles[] = (object) [
            'path' => (new \core\url('/theme/boost/style/academy-h5p.css'))->out(false),
            'version' => '?v=' . substr(hash_file('sha256', $cssfile), 0, 12),
        ];
    }
}
