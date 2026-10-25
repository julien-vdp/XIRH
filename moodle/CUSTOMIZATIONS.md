# XIRH Academy — Moodle Customizations

This file documents every non-standard change made to this Moodle installation.
Its purpose is to allow an AI (or developer) to re-apply these changes after a Moodle version upgrade without breaking the site.

---

## 1. Custom Theme Preset — Boost

**File:** `public/theme/boost/scss/preset/default.scss`
**Compiled output (also manually edited):** `public/theme/boost/style/moodle.css`

This is the main SCSS preset loaded by `theme_boost_get_main_scss_content()` in `public/theme/boost/lib.php`.
Moodle compiles this file with its PHP SCSSPHP compiler and caches the output in `/var/moodledata`.
**Both files must be kept in sync.** After editing `default.scss`, either:
- Run `grunt scss` (requires Node 22.x), or
- Manually replicate the compiled CSS changes in `style/moodle.css`

On every container start, `docker-entrypoint.sh` deletes the moodledata theme cache so Moodle recompiles from the SCSS.

### 1.1 Font override — Outfit (Google Fonts)

```scss
$font-family-sans-serif: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !default;
```

Load the Google Fonts stylesheet through `templates/head.mustache`. Do not reintroduce the remote `@import` in SCSS: Moodle's PHP compiler can treat it as a missing source file and fail to rebuild the theme.

### 1.2 Brand colors

```scss
$blue:    #35B4E7;   // XIRH sky blue
$cyan:    #35B4E7;
$primary: #303B4D;   // XIRH dark slate
$info:    #35B4E7;
$light:   #F4F7FA;
$dark:    #1A202C;
```

### 1.3 Navbar styling

Targets `.navbar` globally and via `.path-site` / `.pagelayout-frontpage` selectors to apply:
- White background with subtle bottom shadow
- XIRH dark slate for active links and hover states
- Hidden `#page.navbar-brand` duplicate on frontpage

### 1.4 Frontpage full-width layout

**Why:** Moodle's frontpage wraps the landing page HTML in ~8 levels of containers:
`#page.drawers > .main-inner > #page-content > #region-main-box > #region-main > div.course-content > div.sitetopic > ul.topics > li.section > div.content > div.summarytext > div.no-overflow`

Additional blockers:
- `body.limitedwidth #page.drawers .main-inner { max-width: 830px }` — Moodle always adds `limitedwidth` to the body, capping the layout at 830px
- `#page.drawers { padding-left: 3rem; padding-right: 3rem }` at ≥768px
- `span[role=main]` (not `div[role=main]`) has extra padding — Moodle renders the main landmark as a `<span>`, not a `<div>`

**Selectors used:** `.path-site, .pagelayout-frontpage, #page-site-index, .format-site`

**Changes applied:**
```scss
// Prevent horizontal scrollbar from full-bleed hero
overflow-x: hidden;

// Override body.limitedwidth max-width cap at every breakpoint
#page.drawers .main-inner {
    max-width: 100% !important;
    width: 100% !important;
    padding: 0 !important;
    background-color: transparent !important;
    box-shadow: none !important;
    border: none !important;
    margin-top: 0 !important;
}

@media (min-width: 768px) {
    #page.drawers { padding-left: 0 !important; padding-right: 0 !important; }
    #page.drawers .main-inner { max-width: 100% !important; padding: 0 !important; }
    #page.drawers span[role=main],
    #page.drawers div[role=main] { padding-left: 0 !important; padding-right: 0 !important; }
}

// Hide Moodle-generated headings and nav on frontpage
#page-header, .section h3.sectionname, .section-title, .sectionname,
.section-navigation, .activity-header { display: none !important; }

// Make region-main card transparent
#region-main-box, #region-main { background: transparent !important; border: none !important; ... }
#region-main-box .card, #region-main .card { background: transparent !important; ... }
```

### 1.5 Hero full-bleed and background carousel (`.xirh-hero`)

**Why:** Even after removing all wrappers' padding, the hero is still constrained by intermediate containers. The CSS full-bleed technique breaks out of ALL parent containers regardless of nesting depth.

The hero uses an absolute-positioned Bootstrap 5 carousel (`.xirh-hero-carousel`) as its background. The carousel items slide/fade under a semi-transparent dark blue overlay mask (`::before` styled with `z-index: 2`), keeping the overlay text card (`.container` styled with `z-index: 3`) fully legible.

```scss
.xirh-hero {
    position: relative;
    width: 100vw;
    left: 50%;
    right: 50%;
    margin-left: -50vw;
    margin-right: -50vw;
    overflow: hidden;
    border-radius: 0;
    padding: 7rem 0;
    
    &::before {
        z-index: 2; // Above carousel, below text container
    }
    
    .xirh-hero-carousel {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        
        .carousel-inner,
        .carousel-item,
        .xirh-carousel-img {
            height: 100%;
            width: 100%;
        }
        
        .xirh-carousel-img {
            background-size: cover;
            background-position: center;
        }
    }
    
    .container {
        position: relative;
        z-index: 3;
    }
}
```

### 1.6 Secondary navigation card

The `Home / Settings / Participants / ...` tab bar is styled as a floating card, inset from the screen edge:

```scss
.secondary-navigation {
    background-color: #FFFFFF !important;
    border: 1px solid #E2E8F0 !important;
    border-radius: 1rem !important;
    margin-top: 1.5rem !important;
    margin-left: 3rem !important;
    margin-right: 3rem !important;
    margin-bottom: 0 !important;
}
```

### 1.7 Landing page cards and content sections

Defined in `default.scss`: `.xirh-card`, `.xirh-value-box`, `.xirh-section-title`, `.xirh-hero-card`, `.xirh-hero-title`, `.xirh-hero-divider`, `.xirh-hero-subtitle`, `.xirh-hero-btn`.
These are pure additions with no Moodle overrides.

---

## 2. Landing Page HTML

**File:** `public/xirh_landing_page.html`

This is a Moodle "summary text" HTML block injected into the frontpage course section.
It uses Bootstrap grid classes (`container-fluid`, `container`, `col-md-4`, etc.) and the XIRH custom CSS classes above.

Structure:
```
div.container-fluid.px-0
  div.xirh-hero          ← full-bleed hero with background image + overlay
  div.container#courses  ← "Mes Domaines de Formation" (3-column cards)
  div.container          ← "Pourquoi se former" (3 value boxes)
```

---

## 3. Docker / Deployment

**File:** `Dockerfile`
**File:** `docker-entrypoint.sh`

### 3.1 Entrypoint script

On every container start, the entrypoint:
1. Deletes `/var/moodledata/localcache/theme/` and `/var/moodledata/cache/theme/`
2. Starts Apache (`apache2-foreground`)

This forces Moodle to recompile the theme from `default.scss` on next page load, ensuring CSS changes in git are always picked up after a Coolify redeploy.

**Important:** The entrypoint script must have LF (Unix) line endings.
The `Dockerfile` runs `sed -i 's/\r$//' docker-entrypoint.sh` to strip Windows CRLF automatically.
The `.gitattributes` file enforces `eol=lf` for all `*.sh` files.

### 3.2 Moodledata location

`/var/moodledata` — persistent Docker volume managed by Coolify.
This volume survives container rebuilds, which is why purging the theme cache on startup is necessary.

---

## 4. Upgrade checklist

When upgrading Moodle (e.g. 5.x → 5.y):

1. **Check `public/theme/boost/lib.php`** — verify `theme_boost_get_main_scss_content`, `theme_boost_get_precompiled_css`, `theme_boost_get_pre_scss`, and `theme_boost_get_extra_scss` still exist and work the same way.
2. **Re-apply `default.scss` changes** — the upgrade may overwrite this file. Re-add all sections from §1 above. Pay special attention to the `limitedwidth` and full-bleed sections.
3. **Rebuild `moodle.css`** — either via `grunt scss` (Node 22.x required) or by manually patching the compiled CSS as described in §1.
4. **Verify body classes on frontpage** — open DevTools and confirm the body still has `pagelayout-frontpage`, `path-site`, and `limitedwidth` classes. If class names changed, update the SCSS selectors.
5. **Check the drawers template** — `public/theme/boost/templates/drawers.mustache` — verify the DOM structure hasn't changed (new wrappers could break the full-bleed hero).
6. **Redeploy on Coolify** — the entrypoint will clear the theme cache automatically.

## 5. Shared golden Academy styling

`style/academy-platform.css` loads in `templates/head.mustache`, followed by the authored-content layer described below. The drawers layout adds `xa-shell` and, outside the homepage, `xa-inner`; the login layout adds `xa-shell xa-auth`. Embedded H5P documents, popups and maintenance layouts do not receive these classes.

The layer shares the homepage palette and typography across the catalogue, course outlines, activity navigation, dashboard, account forms and login flow. It restores the useful page headings and breadcrumbs suppressed by the older full-width homepage preset. Course descriptions remain complete; existing default course thumbnails gain branded artwork while uploaded dashboard cover images retain their own imagery.

`templates/core/login_panel.mustache` supplies the illustrated welcome panel and return link. Custom authentication instructions still render in that panel. Login fields, validation, identity providers and authentication logic remain Moodle components.

After an upgrade, preserve these layout classes, the stylesheet link and the login panel override. Check desktop/mobile widths, open and closed course drawers, menus, forms and an embedded H5P activity. To revert this presentation layer, remove its stylesheet link and restore the prior login panel template.

## 6. Moodle lessons and native H5P players

`style/academy-learning.css`, linked from the shared head, harmonizes authored course summaries, activity descriptions, Page and Book prose, tables and images. It does not rewrite stored course content or attached documents.

`classes/output/core_h5p_renderer.php` is Boost's override of `core_h5p\output\renderer`. Its `h5p_alter_styles` hook calls the parent first, then appends `style/academy-h5p.css` to the player's own iframe. The stylesheet URL includes a content hash for cache invalidation. The editor is excluded. Keep the namespace `theme_boost\output` and class name `core_h5p_renderer`: Moodle's theme renderer factory depends on them.

The H5P layer covers InteractiveBook, Column, AdvancedText and SingleChoiceSet. It replaces only the decorative book cover with the existing golden artwork; instructional illustrations and diagrams remain original. Native correctness feedback, answers, scoring and progression are retained. Palette variables live on the player as well as the root because Moodle can set its H5P branding variables inline on `<html>`.

`templates/embedded.mustache` links `style/academy-embed.css`. Its selectors apply only to `body#page-h5p-embed.h5p-embed`, removing the homepage's 60px padding and 160px banner offset from the outer embed. Other embedded layouts remain unaffected.

After an upgrade, preserve the renderer, both template links and the three CSS files. Purge Moodle caches, verify the renderer factory resolves the Boost override and the hashed CSS appears last in the inner iframe. Check a cover, chapter navigation, a diagram/table, standalone quiz and green/red answer feedback at desktop and mobile widths. Compare H5P raw-content hashes and attempt/completion records before and after styling. To revert, remove the two new links and the renderer override, then purge caches; no content reimport or database migration is needed.
