# IMMERSE prototype

Static, dependency-free HTML, CSS, and JavaScript prototype based on the supplied desktop/mobile wireframe. Open `index.html` in a browser; no build step or account is required.

## Screens

The hash-based prototype includes the landing page, sign-in, sign-up, dashboard, video player, vocabulary, add-video flow, flashcards, language settings, plans, and the post-video completion screen. Use the navigation and calls to action to move between them.

## Mersi assets

Transparent WebP versions in `assets/mersi/` were converted locally from the supplied transparent character crops. They preserve the original poses and expressions without redrawing Mersi. The hero, benefits, steps, introduction, closing call to action, and chat each use their corresponding pose or expression.

## Visual system and motion

The display type uses Bricolage Grotesque and the interface uses Figtree. The dashboard video preview is composed from labeled playback UI rather than abstract gradient shapes. Buttons and navigation retain the warm hairline borders; the Mersi chat opens from its launcher and includes a short local thinking state before its guide response. Reduced-motion preferences keep the character still and remove movement effects.

## Prototype boundaries

There is no authentication, video processing, transcript service, payment flow, or AI API connected. Demo form submissions remain local, and the Mersi chat only answers questions about visible prototype navigation; other questions receive an explicit handoff to `halo@immerse.id`. The API integration point is marked in `app.js`.

The language choices, lesson cards, and plan names illustrate the wireframe, not confirmed service entitlements or prices. Replace these with approved product details before launch.
