# A Little Christmas, A Little Love

A winter journey and letter-writing experience for **Everyday with Afrin**.

## What's inside
- **Welcome:** a lavender dusk with an aurora, a moon, and a snowy village with warm windows.
- **A note from Afrin:** a cabin by the fire, with the personal note on a letter card.
- **The little tree:** a glowing particle tree you can turn by dragging or with the arrow keys. Tap an ornament to read its note, make a wish on the star, light the tree, or switch between Aurora, Ember and Midnight moods.
- **Write a letter:** a live postcard that takes shape as you type. Choose Kraft, Aurora or Ember paper, a handwritten, classic or italic lettering, an occasion, and optional soft music (gentle bells or a soft pad).
- **Opening:** a wrapped box, an envelope, and a letter. You can skip the sequence, replay it, and mute the music.
- **Keep it:** download the postcard as a PNG, or share the letter on WhatsApp.
- **Accessibility:** keyboard-operable, labelled controls, visible focus, a focus-trapped reveal, and full reduced-motion support.

## The home page now includes
- **The Christmas story (curtain):** velvet curtains part as you scroll, then seven scenes tell the nativity in the words of the King James Version (public domain), from the angel's news to the gifts of the wise travellers. Buttons let you move through the story without scrolling.
- **Send a letter as a link:** write your own letter, or start from the Christmas message (Luke 2:10–11, 14). Copy the link, share it on WhatsApp, or open it yourself to see what the recipient sees.

## The story page (`story.html`)
- **3D hero:** stacked gift cubes, an orbiting ring of baubles, and a spinning star, built with CSS 3D.
- **Five chapters:** a 3D diorama (tree, cabin, ground) turns as you scroll through the story.
- **How sharing works:** four tilting cards that float and respond to the pointer.
- **Make a link:** write a letter, create a link, copy it, share it on WhatsApp, or open it as the recipient.

### How the gift link works
The letter is packed into the link after the `#`, for example `story.html#letter=...`. Browsers never send the part after `#` to the web host, so the link works on GitHub Pages without a server. The letter is stored only in the link itself: there is no database, no tracking, and no record of who opened it. Anyone with the link can read the letter, and links are limited by the 420-character message limit.

## Run locally
Open `index.html` in a modern browser, or run a local server:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy to GitHub Pages
1. Create a public repository, for example `christmas-magic`.
2. Upload the contents of this folder to the repository root (not the folder itself).
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch `main` and folder `/ (root)`, then save.
6. Open the published Pages URL once it's live.

## Add to Blogger
Add a button or link on your Blogger site pointing to the GitHub Pages URL. Nothing else on the blog needs to change.

## Notes
- Frontend only. Letters stay in the visitor's browser and are never uploaded.
- WhatsApp sharing sends the written letter, not a hosted page. Permanent gift links need a backend such as Firebase, which is not part of this version.
- Music is generated in the browser. No licensed tracks are included.
- Fonts come from Google Fonts (Fraunces, Caveat, Manrope). Fallbacks are used if they fail to load.

## Adding free artwork
Place licensed files in `assets/` and they can be wired into the pages. Check each licence and keep any attribution it requires. Sources that offer free use: Kenney.nl and Poly Haven (CC0), Sketchfab (filter to CC0 or CC-BY models), and Unsplash, Pexels or Openverse for photographs.
