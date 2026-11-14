# MatchMaker — Version 1
SDK: 58. Do not change unless the phone’s Expo Go changes.
AI model: PENDING

## Run
1. Put the existing .env in this MatchMaker folder (outside phone/). It must contain OPENAI_API_KEY. Never put that key in EXPO_PUBLIC variables. Replace PENDING above with the model from the original NOTES.md.
2. From this folder: node scripts/configure.mjs, then node helper/server.mjs.
3. In a second terminal: cd phone, then npx expo start --lan --port 8081. Keep both running. No CI=1.
4. Phone and computer must use the same trusted Wi-Fi. Scan the Expo QR code in Expo Go SDK 58. If asked, allow local-network access. Restart configure and Expo after the computer’s Wi-Fi address changes.
5. An Expo tunnel does NOT tunnel the helper. Use the same Wi-Fi LAN, or arrange an authenticated HTTPS helper separately. Do not expose the API key or an unauthenticated helper publicly.

## Scope and safety
The default mannequin satisfies MVP #3 and the safety plan. The optional personal-photo switch is deferred. Preview is a clearly labeled 2D outfit layout, not a fit prediction or virtual try-on. No photos go to the helper or OpenAI. Only clothing descriptions, categories, colors and selected style are sent when Make an outfit for me is pressed. API responses select only owned item IDs; arbitrary answers are not displayed. No free-form chat in V1, in keeping with the brief’s instruction to show only an outfit. AI taste can be wrong; no correctness guarantee. Body judgments and safety advice are excluded.
Phone storage is local, not cloud backup. Uninstalling Expo Go/clearing app data can erase it. The helper reads the key only from .env and model from this file. Pairing token is local-only and ignored by Git. No personal photos or API key belong in the repository.

## Status
Brief saved. SDK 58 blank template created. Phone implementation complete; iOS and Android exports passed. Expo install --fix succeeded and expo-doctor passed 20/20 checks. Four helper validation tests passed. Camera and persistence still need a real-phone check. Live AI verification awaits the existing .env and model location. GitHub destination: https://github.com/SOPH-a-CAT/Soph-a-Cats_MatchMaker

## Next
Connect the existing API key and exact requested model, then verify live AI generation. Test camera and storage on a real phone. Competition claims in BRIEF.md were supplied by the user and not independently verified; registration and submission dates are still unspecified.

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
Both native bundles exported successfully. Type checking and direct ESLint passed. Expo lint wrapper rejected its own installed ESLint version, so the installed ESLint was run directly. Expo Doctor: 20/20. Helper validation: 4/4. Helper health endpoint: OK. Real-phone camera and persistence remain unverified; live AI is blocked until the existing .env and model are located. No mock AI output is substituted. GitHub upload uses the connected account because command-line Git authentication is unavailable.

## Video check (two steps each)
1. Outfit generation: add a top and bottom; press Make an outfit for me (requires AI configuration).
2. Clothing camera: press Photograph a piece; enter name/color and Save piece, then reopen to check persistence.
3. Mannequin: generate an outfit; check that its saved clothing photos appear on the labeled 2D mannequin layout.
4. Safety: press the outfit button with no top/bottom; check the friendly guidance. With helper offline, check the key/Wi-Fi/helper error. Validation rejects invented IDs and arbitrary chat, but AI correctness is not guaranteed.
