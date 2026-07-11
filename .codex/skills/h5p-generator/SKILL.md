---
name: h5p-generator
description: Generate Moodle/Lumi-compatible H5P e-learning packages from structured course content, using the XIRH H5P conventions.
---

# H5P Generator

Use this skill when generating, repairing, auditing, or explaining H5P course packages for Moodle or Lumi.

## Repository conventions

- Generated `.h5p` archives are valuable outputs but are ignored by Git.
- Existing scripts in `_learning-lab/scripts/` are the best local examples.
- Reference notes live in `docs/h5p-generation.md`.
- Typical outputs go in `_learning-lab/packages/h5p/`.
- Temporary build folders must be deleted after packaging.

## Package anatomy

An `.h5p` is a ZIP file. A valid self-contained package normally includes:

- `h5p.json`
- `content/content.json`
- `content/images/*.jpg`
- root-level H5P library folders such as:
  - `H5P.InteractiveBook-1.15/`
  - `H5P.Column-1.22/`
  - `H5P.AdvancedText-1.1/`
  - `H5P.Image-1.1/`
  - `H5P.SingleChoiceSet-1.11/`

The XIRH packages use French localization and Moodle-safe semantic HTML.

## Required rules

1. In `h5p.json`, write dependency versions as strings:
   - good: `"majorVersion": "1"`
   - avoid: `"majorVersion": 1`
2. In ZIP archives, use forward slashes:
   - `arcname = relpath.replace("\\", "/")`
3. Use JPEG paths and MIME consistently:
   - path: `images/example.jpg`
   - MIME: `image/jpeg`
4. Wrap InteractiveBook chapters as `H5P.Column 1.22`.
5. Wrap each Column item as:
   - `content.library`
   - `content.params`
   - `content.subContentId`
   - `content.metadata`
   - `useSeparator`
6. `useSeparator` is `"auto"`, `"enabled"`, or `"disabled"`.
7. Keep text HTML simple:
   - use headings, paragraphs, lists, tables, blockquotes
   - avoid embedded CSS and scripts

## Preferred generation workflow

1. Define course outline and learning objectives.
2. Create semantic HTML text blocks.
3. Create image assets and normalize them to JPEG if needed.
4. Build content item helpers:
   - AdvancedText
   - Image
   - SingleChoiceSet
   - Column wrapper
   - InteractiveBook chapters
5. Reuse existing H5P library folders from local H5P hub packages:
  - `_learning-lab/packages/root-h5p/test.h5p`
  - `_learning-lab/packages/root-h5p/column_hub.h5p`
6. Write `h5p.json` and `content/content.json` with UTF-8.
7. Zip the temporary folder contents into `.h5p`.
8. Inspect the archive before delivery:
   - confirm `h5p.json`
   - confirm `content/content.json`
   - confirm libraries
   - confirm image paths referenced by JSON exist

## Validation checklist

- `h5p.json` exists at archive root.
- `content/content.json` exists.
- `mainLibrary` matches the top-level content shape.
- Every dependency in `preloadedDependencies` has a root library folder.
- Every referenced image exists under `content/images/`.
- No Windows backslashes appear in ZIP entry names.
- No temporary build files are included.
- The package can be imported into Lumi or Moodle.
