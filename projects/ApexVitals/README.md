# ApexVitals

**Asset and performance optimization research.** Status: offline Python prototype.

Implemented: visible-route glyph inventory (plus image alt), missing image-size detection, srcset candidate planning, gzip precompression and optional quality-11 Brotli (only if separately installed).

Run from repo root:

    python projects/ApexVitals/main.py path/to/page.html
    python projects/ApexVitals/main.py path/to/page.html --compress
    python -m unittest discover -s projects/ApexVitals -v

**Planned, not yet implemented:** actual font subsetting, AVIF encoding, smart focal point crops, build pipeline integration, CDN distribution, browser RUM/LCP benchmarks.

**Claims not verified:** sub-second global page loads, zero CLS, automatic font compilation and production quality-11 Brotli coverage. The srcset helper only names candidates; it does not create images.
