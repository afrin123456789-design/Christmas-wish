# Development state

## Home page additions (current)
- Curtain story section: `css/curtain.css`, `js/curtain.js`. Scroll draws the curtain, then seven scenes unfold. Text is public-domain KJV (Isaiah 9:2, Luke 1:30–31, 2:4–7, 2:10–11, 2:14, Matthew 2:11).
- Link maker on the home page (`#send-link`), with a "Start from the Christmas message" preset.
- Verified in headless Chromium: curtain opens with scroll, scenes change, link created (about 575 characters with the preset), opened in a fresh browser showing the Christmas message, no sideways overflow on phone, reduced-motion buttons work.
- Free artwork: not downloaded. The build environment has no internet access for downloads, so the scenes are built from CSS and SVG. Add licensed files to `assets/` to bring them in.

## Story page (previous)
- `story.html`, `css/story.css`, `js/story-3d.js` (scroll, chapters, tilt, glitter), `js/share.js` (link encode/decode, maker, opener).
- Shared letters travel in the URL fragment. No backend.
- Verified in headless Chromium: 3D hero, chapter diorama turns with scroll, link created (about 270 characters), link opened in a fresh browser and the letter read, broken link shows a message, no sideways overflow on phone, reduced motion stops the 3D motion.
- Not verified: real phones, Safari 3D rendering, fonts (offline test).

## Rebuild (previous)
A full rebuild, using the reference screenshots for mood and palette only. No reference artwork is used.

## Files
- `index.html`: all sections and the reveal modal.
- `css/base.css`: tokens, type, buttons, motion rules, toast.
- `css/sections.css`: welcome, note, tree, studio layout, closing, footer, responsive rules.
- `css/studio.css`: postcard preview and its paper themes and lettering.
- `css/reveal.css`: reveal modal, gift box, envelope, letter, sparkles.
- `js/app.js`: shared namespace, toast, scroll reveals, snow toggle.
- `js/snow.js`: layered snowfall.
- `js/scenery.js`: seeded winter landscape and starfield.
- `js/tree.js`: particle tree (canvas): drag, ornaments, star, lights, moods, keyboard.
- `js/studio.js`: letter form, validation, live postcard.
- `js/reveal.js`: reveal state machine, generated music, focus trap, replay and skip.
- `js/export.js`: PNG postcard and WhatsApp share.

## Verified in headless Chromium
- No JavaScript errors on desktop (1440px) or phone (390px) widths.
- No horizontal overflow on either.
- Full letter flow: write, open box, open envelope, read letter, download PNG, replay, close with Escape.
- Tree: drag, ornament note, wish on the star, lighting, mood switch.
- Reduced motion: snow hidden, reveal steps instant, the tree stays still until touched.

## Not verified
- Fonts: the test environment has no internet, so Fraunces, Caveat and Manrope fell back to system serif. On a live site they should load. Check the lettering on a phone.
- Real devices: Android Chrome and iOS Safari are not tested.
- Performance: the tree draws about 2,400 needles per frame on desktop and 1,300 on low-power devices. Test on an ordinary Android phone.

## Outstanding
- Real device testing and any visual tuning.
- Optional: licensed music, Firebase-backed gift links.
