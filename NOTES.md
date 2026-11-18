# MatchMaker — Version 1
SDK: 58. Do not change unless the phone’s Expo Go changes.
AI model: gpt-5.6-luna

## Run
1. Put the existing .env in this MatchMaker folder (outside phone/). It must contain KEYGEN_URL and KEYGEN_TOKEN. Never put either secret in EXPO_PUBLIC variables. The configured model is gpt-5.6-luna (5.6 Luna).
2. From this folder: node scripts/configure.mjs, then node helper/server.mjs.
3. In a second terminal: cd phone, then npx expo start --lan --port 8081. Keep both running. No CI=1.
4. Phone and computer must use the same trusted Wi-Fi. Scan the Expo QR code in Expo Go SDK 58. If asked, allow local-network access. Restart configure and Expo after the computer’s Wi-Fi address changes.
5. An Expo tunnel does NOT tunnel the helper. Use the same Wi-Fi LAN, or arrange an authenticated HTTPS helper separately. Do not expose the API key or an unauthenticated helper publicly.

## Scope and safety
The default mannequin satisfies MVP #3 and the safety plan. The optional personal-photo switch is deferred. Preview is a clearly labeled 2D outfit layout, not a fit prediction or virtual try-on. No photos go to the helper or OpenAI. Only clothing descriptions, categories, colors and selected style are sent when Make an outfit for me is pressed. API responses select only owned item IDs; arbitrary answers are not displayed. No free-form chat in V1, in keeping with the brief’s instruction to show only an outfit. AI taste can be wrong; no correctness guarantee. Body judgments and safety advice are excluded.
Phone storage is local, not cloud backup. Uninstalling Expo Go/clearing app data can erase it. The helper reads the MindDo settings from .env, obtains the AI key through getKey(), and reads the model from this file. Pairing token is local-only and ignored by Git. No personal photos or API key belong in the repository.

## Status
Brief saved. SDK 58 blank template created. Phone implementation complete; iOS and Android exports passed. Expo install --fix succeeded and expo-doctor passed 20/20 checks. Four helper validation tests passed. Camera and persistence still need a real-phone check. The local .env key is present and the requested model is configured. Live outfit generation still needs a button-press test on the phone. GitHub destination: https://github.com/SOPH-a-CAT/Soph-a-Cats_MatchMaker

## Next
Press Make an outfit for me on the phone to verify live AI generation. Test camera and storage on a real phone. Competition claims in BRIEF.md were supplied by the user and not independently verified; registration and submission dates are still unspecified.

## Maybe Later
- The user can choose a mannequin instead of using their own photo.
- The user can note where each piece of clothing is stored.
- The user can tell the AI the weather or event to match the outfit.
- The user can mark an outfit as worn so the AI suggests forgotten clothes.
- The user can save outfits they like to a favorites list.
- The user can reject an outfit and get a new AI pairing.
- The user can delete their photos from the app at any time.
- The user can see which clothes they have not worn in a month.

## Current local session
Expo: exp://192.168.0.210:8081
Helper: http://192.168.0.210:8787
QR image: .runtime/MatchMaker-QR.png (local only). Expo and helper are running; keep the computer awake. Live reload is enabled.

## Verification
Both native bundles exported successfully. Type checking and direct ESLint passed. Expo lint wrapper rejected its own installed ESLint version, so the installed ESLint was run directly. Expo Doctor: 20/20. Helper validation: 4/4. Helper health endpoint: OK. Real-phone camera and persistence remain unverified; live AI is configured, but generation has not been tested on the phone. No mock AI output is substituted. GitHub upload uses the connected account because command-line Git authentication is unavailable.

## Video check (two steps each)
1. Outfit generation: add a top and bottom; press Make an outfit for me (requires AI configuration).
2. Clothing camera: press Photograph a piece; enter name/color and Save piece, then reopen to check persistence.
3. Mannequin: generate an outfit; check that its saved clothing photos appear on the labeled 2D mannequin layout.
4. Safety: press the outfit button with no top/bottom; check the friendly guidance. With helper offline, check the key/Wi-Fi/helper error. Validation rejects invented IDs and arbitrary chat, but AI correctness is not guaranteed.

## AI connection verified
The .env file is present locally and ignored by Git. Model gpt-5.6-luna access check returned HTTP 200. Helper and Expo health checks passed. No outfit generation was triggered automatically; the next generation runs only when the user presses Make an outfit for me.

## MindDo key setup
The AI key now comes from server-only getKey() in helper/get-key.mjs, not OPENAI_API_KEY. Keep KEYGEN_URL and KEYGEN_TOKEN in .env (already ignored by Git). Existing values are preserved; missing settings use paste-here. The helper POSTs to /api/lookup-key and caches the key in memory until expiresAt. An OpenAI 401 invalidates the key and allows exactly one refresh/retry, never a loop. Service error.message goes to the app; redacted error.fix stays in the server log. Never import getKey into phone code. Restart the helper after server code updates.

## Web and Vercel
SDK remains 58. Web wraps the unchanged phone screen in a centered frame up to 400px wide and the full window height. Narrow windows shrink the frame without horizontal page scrolling. Web photos are resized and stored locally in this browser; Expo Go keeps using phone files. Browser storage limits may prevent large wardrobes from saving, and the UI reports that.

Import SOPH-a-CAT/Soph-a-Cats_MatchMaker into Vercel. Root Directory must be the repository root (not phone). Framework preset: Other. vercel.json supplies install/build/output settings: install both package-lock files, run cd phone && npx expo export -p web --output-dir ../dist, serve dist. Node.js 24.x is declared in package.json. API requests are excluded from the single-page app fallback. Add server-only KEYGEN_URL and KEYGEN_TOKEN in Vercel Environment Variables for the deployment environments you use, then redeploy. No EXPO_PUBLIC secrets, OPENAI_API_KEY, or extra AI model variable is needed; model is read from this file. BRIEF.md and NOTES.md are bundled only with the function. .env and local connection settings are excluded from deployment.

Local web: from phone/, run npx expo start --web. Metro forwards /api/outfit directly to the same handler used by Vercel; local getKey reads the root .env. Expo Go continues using helper/server.mjs on the LAN. No need to put a token in the web app. The live site will not need your laptop running.

The public API has input limits and a small per-instance concurrency cap; this is not an account-wide spending limit. For a private school demo use Vercel Deployment Protection, and configure provider spending limits before sharing widely. These are recommended access/cost controls, not additional environment variables.

### Web verification, November 18
Web build, type checks, lint, key-cache tests and API tests passed. Live web UI test uploaded two synthetic test images, saved them, reloaded, and generated a real outfit through /api/outfit using MindDo getKey(). Frame measured 400px wide centered at 1100px viewport and 319px at 319px viewport. Exported browser JavaScript scan found no .env credentials or local helper token. Native phone testing was deferred at the user’s request. Local web preview is http://localhost:8082/ (started with npx expo start --web --port 8082). No Vercel deployment has been performed yet.

## Clothing crop (web)
New uploads automatically remove a border-connected plain background and trim empty margins locally in the browser. The preview has a transparency checkerboard. Adjust removal strength, toggle removal, use four manual edge sliders, or Restore original before Save piece. PNG storage preserves transparency on the mannequin. No photo is sent to AI. This is plain-background processing, not semantic AI segmentation: busy backgrounds, shadows and similar clothing/background colors need review or a new contrasting-background photo. Existing saved pictures are not silently changed. Native editing remains unchanged; SDK 58 stays the same.
Crop verification: pixel tests cover background transparency, retained enclosed clothing details, tight bounds and blank-photo fallback. Type checking, lint and web export passed. Interactive browser verification was blocked by the browser connection; manual slider/save behavior still needs a browser check.
