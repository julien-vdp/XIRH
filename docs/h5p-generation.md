# H5P generation notes

This project contains generated H5P e-learning packages used for manual Moodle uploads. The `.h5p` packages are valuable course artifacts, but they are intentionally ignored by Git because they are generated binary ZIP archives.

Local H5P work is organized under `_learning-lab/`:

```text
_learning-lab/scripts/          generation scripts
_learning-lab/packages/h5p/     generated course packages
_learning-lab/packages/root-h5p template/source hub packages
_learning-lab/illustrations/    generated image assets
_learning-lab/libraries/        extracted H5P libraries
_learning-lab/scorm/            generated SCORM exports
```

## What a valid `.h5p` contains

An H5P file is a ZIP archive with this shape:

```text
h5p.json
content/content.json
content/images/*.jpg
FontAwesome-4.5/
H5P.AdvancedText-1.1/
H5P.Column-1.22/
H5P.Components-1.0/
H5P.FontIcons-1.0/
H5P.Image-1.1/
H5P.InteractiveBook-1.15/
H5P.JoubelUI-1.3/
H5P.Question-1.5/
H5P.SingleChoiceSet-1.11/
H5P.Transition-1.0/
jQuery.ui-1.10/
```

`h5p.json` declares the main content type and all bundled libraries. The existing BPMN course packages use:

```json
{
  "language": "fr",
  "mainLibrary": "H5P.InteractiveBook",
  "embedTypes": ["iframe"],
  "license": "U",
  "defaultLanguage": "fr"
}
```

Important: `majorVersion` and `minorVersion` are strings in the generated packages, not numbers.

## Content patterns observed

### Interactive book

The main course packages use `H5P.InteractiveBook 1.15`.

`content/content.json` contains:

```text
showCoverPage
bookCover
chapters[]
behaviour
French localization labels
```

Each chapter is a `H5P.Column 1.22`:

```json
{
  "library": "H5P.Column 1.22",
  "params": {
    "header": "2. Definition academique",
    "content": []
  },
  "metadata": {
    "contentType": "Column",
    "license": "U",
    "title": "2. Definition academique"
  },
  "subContentId": "uuid"
}
```

### Column item wrapper

Every item inside a column follows this wrapper:

```json
{
  "content": {
    "library": "H5P.AdvancedText 1.1",
    "params": {},
    "subContentId": "uuid",
    "metadata": {
      "contentType": "AdvancedText",
      "license": "U",
      "title": "Item title"
    }
  },
  "useSeparator": "auto"
}
```

`useSeparator` should be `"auto"`, `"enabled"`, or `"disabled"`, not a boolean.

### Text item

```json
{
  "text": "<h2>Titre</h2><p>Texte HTML propre.</p>"
}
```

Keep HTML semantic and Moodle-safe. Avoid embedded `<style>` blocks and complex inline CSS.

### Image item

```json
{
  "contentName": "Image",
  "decorative": false,
  "alt": "Description",
  "file": {
    "path": "images/example.jpg",
    "mime": "image/jpeg",
    "width": 1024,
    "height": 1024,
    "copyright": {
      "license": "U"
    }
  },
  "expandImage": "Agrandir l'image",
  "minimizeImage": "Reduire l'image"
}
```

Use `.jpg` paths and `image/jpeg` MIME when the binary is JPEG. Moodle/Lumi can reject mismatched extensions and MIME values.

### Single choice quiz

The existing scripts use `H5P.SingleChoiceSet 1.11`. Answers are ordered with the correct answer first.

```json
{
  "choices": [
    {
      "question": "<p>Question?</p>",
      "answers": [
        "<p>Correct answer.</p>",
        "<p>Wrong answer.</p>"
      ],
      "subContentId": "uuid"
    }
  ],
  "behaviour": {
    "enableRetry": true,
    "enableSolutionsButton": true,
    "passPercentage": 100,
    "autoContinue": false
  }
}
```

## Build flow

The existing `_learning-lab/scripts/build_h5p*.py` scripts follow this flow:

1. Create a temporary folder such as `h5p_temp`.
2. Create `content/images`.
3. Copy generated images into `content/images`.
4. Extract required library folders from `test.h5p` and `column_hub.h5p`.
5. Write `h5p.json`.
6. Write `content/content.json`.
7. Zip the temporary folder contents into `_learning-lab/packages/h5p/<course>.h5p` or another local output folder.
8. Force ZIP paths to use `/`, not Windows `\`.
9. Delete the temporary folder.

## Git policy

Track:

- generation scripts such as `_learning-lab/scripts/build_h5p*.py`
- documentation and prompts/specifications
- small source data needed to regenerate courses

Do not track:

- generated `.h5p` files
- extracted H5P libraries
- Lumi extracted application files
- temporary folders
- generated illustrations unless deliberately chosen as source assets
- packaged `.exe` builds

Keep final `.h5p` packages in a separate archive folder or dedicated repository if long-term version history is needed.
