# MatchMaker — Version 1
SDK: 58. Keep this SDK until the phone’s Expo Go changes.
AI model: gpt-5.6-luna

## Run
From this MatchMaker folder, run `node scripts/configure.mjs`, then `node helper/server.mjs`.
In a second terminal, run `cd phone` then `npx expo start --lan --port 8081`.
Keep the laptop awake and both processes running. No CI=1; live reload stays enabled.
Phone and laptop must share the same Wi-Fi. An Expo tunnel does not tunnel the helper; use LAN or separately configure an authenticated HTTPS helper.
Current Expo link: exp://192.168.0.212:8081
Current helper: http://192.168.0.212:8787
QR code: .runtime/MatchMaker-QR.png (local only).

## AI and privacy
The AI key comes only from server-side getKey() in helper/get-key.mjs. MindDo settings KEYGEN_URL and KEYGEN_TOKEN are read from ignored .env; never put them in the phone app. Keys are cached until expiry, with at most one renewal for an invalid key. The local pairing token is separate and ignored by Git.
helper/ask-ai.mjs reads this model and the AI instructions in BRIEF.md on every request. It sends only saved clothing names, types, colors and selected style when Make an outfit for me is pressed. No photos leave the device. Thinking… disables the button while waiting. MindDo messages are shown safely; other failures give connection guidance.
The app accepts only owned clothing IDs, never arbitrary AI answers. Outfit pictures and clothing names appear on a labeled 2D mannequin layout. This is not realistic try-on or a guarantee of taste, fit or safety. No open-ended chat in V1. Mannequin is the default to satisfy the safety plan; personal photos are deferred.
Wardrobe data and pictures save on the phone. Clearing app data or uninstalling can remove them; this is not a cloud backup.

## Done and checks
Existing SDK 58 blank-template project reused, not replaced. November 21: expo install --fix updated compatible SDK 58 patches; expo-doctor passed 20/20. Helper health and Expo status are healthy. Revised user brief saved on November 21. Native iOS and Android bundles exported; type checks, lint, and seven helper/API tests passed. Live web AI succeeded in earlier testing; current phone camera, persistence and end-to-end AI need a real-phone check. No generation is triggered just by opening the app.

## Next
Scan the QR code with Expo Go SDK 58, add a top and bottom, and press Make an outfit for me. Test closing/reopening the app. The competition dates and research statement in BRIEF.md are user-supplied and not independently verified.

## Maybe Later
- The user can choose a mannequin instead of using their own photo.
- The user can note where each piece of clothing is stored.
- The user can tell the AI the weather or event to match the outfit.
- The user can mark an outfit as worn so the AI suggests forgotten clothes.
- The user can save outfits they like to a favorites list.
- The user can reject an outfit and get a new AI pairing.
- The user can delete their photos from the app at any time.
- The user can see which clothes they have not worn in a month.

## Existing web version
Web support remains available with `cd phone` then `npx expo start --web`. Vercel: repository root, Framework Other, Node 24.x, KEYGEN_URL and KEYGEN_TOKEN as server environment variables. vercel.json sets build/output; api/outfit.mjs shares server-only getKey(). Browser photos use local storage with optional crop controls. No Vercel deployment has been performed. The separate Thread website is a different project.

## Mobile visual refinement
MatchMaker now uses the Thread website’s sage palette, ivory mannequin asset, bordered outfit panel and two-column wardrobe cards. Style choices expand on demand. Search and category filters help browse saved clothes; tapping a card changes the preview. Clothing entry opens in a separate native modal. Existing storage and real AI connection are retained; SDK remains 58. Native photo background removal and the website’s canvas fabric shaping are not included in this visual update. Type checks, lint, iOS/Android/web export checked; physical-phone appearance still needs review.

## Blue mobile theme
Blue palette and prominent action buttons match the Thread website. Generate outfit stays in a bottom dock outside the scrolling content. Adjust fit opens a native screen with a stationary mannequin and scrollable position/size controls; changes persist with each clothing item. SDK 58 and AI request timing remain unchanged. Type checks, lint and native/web exports passed; physical-phone review remains pending.

## MVP outfit check — November 23, 2026
Status: works end to end in the local web app. Tested with an isolated test wardrobe: saved a top and bottom, refreshed, pressed Generate outfit, saw Thinking… with the button disabled, and received a real AI outfit containing only those saved items. The generated outfit also survived a refresh. Empty wardrobes show a helpful message. Test images were simple placeholders in a separate browser origin; the user’s wardrobe was not changed. No app rebuild was needed.
Checks: nine automated API/key/validation/crop tests passed; TypeScript and Expo lint passed. Physical Expo Go interaction was not tested in this check.
Try it: (1) Add at least one Top and one Bottom with photos, names and colors. (2) Press Generate outfit and wait for the saved clothing pictures and names to appear.
