# XIRH Academy — golden polygonal

Asset created with the built-in **imagegen** tool on 24 October 2026. The existing XIRH course cover was used as a style and mascot reference, not as an edit target.

- Reference: `_learning-lab/illustrations/general/cover.png`.
- Preserved source: `_learning-lab/illustrations/general/golden-hero-v1.png` (local generated artifact, ignored by Git).
- Website asset: `moodle/public/pix/xirh/golden-universe-v1.webp` (1672 px, about 151 KiB).
- Responsive asset: `moodle/public/pix/xirh/golden-universe-v1-960.webp` (960 px).
- Domain artwork: existing `xirh_carousel_sirh.png`, `xirh_carousel_analytics.png` and `xirh_carousel_ai.png`, encoded as optimized WebP files without changing their artwork.

## Final generation prompt

Use case: stylized-concept. Asset type: panoramic website hero artwork for XIRH Academy, a French HR/SIRH learning platform. Create a brand-new landscape illustration, 16:9 wide cinematic composition, inspired by the attached brand reference. The reference is STYLE AND MASCOT IDENTITY guidance, not an edit target. Preserve the recognizable friendly golden retriever built from crisp angular polygon facets, black bowler hat, deep ink-blue / cobalt / turquoise environment and warm honey-gold highlights. Make this feel breathtaking, playful and sophisticated: an optimistic surreal low-poly world of knowledge, glowing golden paths crossing floating faceted islands, geometric clouds and a luminous horizon. The golden retriever is the striking hero on the RIGHT 45% of the composition, seen chest-up in three-quarter view looking warmly toward the viewer, elegantly lit in radiant amber and gold; confident clever expression, no clothing except its signature black bowler hat. A few small symbolic architectural shapes suggesting connected knowledge and learning behind it, no literal charts or text. LEFT 45% must remain predominantly dark ink-blue with restrained geometric sky and atmospheric glow, sufficiently calm to carry large white/golden website headline text over it. Keep all focal details on the right, no dog cropped at the top, generous breathing space. Emphasize intentional large triangular facets, luminous gold-cyan color contrast, dimensional paper-sculpture quality, crisp editorial art direction, warm wonder and energy. Avoid the pale corporate office illustration look. Avoid generic SaaS cards, random UI panels, photorealistic fur, plastic toy look, excessive glitter, clipart, literal human hands, extra animals, extra heads, logos, letters, numbers, watermarks. NO TEXT anywhere. This must be final production artwork, not a mockup of a webpage.

## Rebuild

With the source PNG available locally:

`node _learning-lab/design/academy-refresh/prepare-golden-assets.mjs _learning-lab/illustrations/general/golden-hero-v1.png`

Then regenerate the standalone preview:

`node _learning-lab/design/academy-refresh/prepare-golden-preview.mjs`
