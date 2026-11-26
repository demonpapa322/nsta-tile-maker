# Performance improvements

- [x] Reduce global rendering work while preserving the existing fades.
- [x] Defer editor code until its tool is opened.
- [x] Prevent outdated resize previews from replacing newer settings.
- [x] Verify navigation and image workflows in the preview.

## Full-image grid fitting

- [x] Match the complete image to the chosen grid ratio without cropping or stretching.
- [x] Keep grid preview and downloaded tiles aligned to the same fitted canvas.
- [x] Remove the upload-time JPEG/downscale pass and fill ratio gaps without white borders.
- [x] Verify exact 3:1, mismatched ratios, and full-resolution source handling.