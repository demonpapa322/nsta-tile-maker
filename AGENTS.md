# Architecture rules

- Load non-home pages with route-level lazy imports so image-editing code does not slow the initial tool library.
- Share one grid-fit geometry between preview and export; render source pixels directly and fill ratio gaps without cropping or white padding.