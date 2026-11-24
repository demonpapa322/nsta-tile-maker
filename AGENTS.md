# Architecture rules

- Load non-home pages with route-level lazy imports so image-editing code does not slow the initial tool library.
- Share grid-fit geometry between the preview and tile export so both preserve the full image at the same grid ratio.