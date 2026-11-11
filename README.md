# Zoey & Christian's wedding

A static wedding website for GitHub Pages. Open `index.html` locally or serve this directory with a static server. All paths are relative for a project Pages URL.

The countdown reaches zero at midnight in London at the start of 19 February 2027, rather than assuming a ceremony start time. Run `node --test tests/countdown.test.js` to check its arithmetic. The entrance can be skipped, respects reduced-motion preferences and does not require JavaScript to access the page.

## Decisions to ask the couple

- RSVP deadline and whether any response cutoff or invitation-specific access is needed.
- Email and SMS provider, sender identity, reminder timing, guest contact details, consent and opt-out approach.
- Who should monitor the invitation-only guestbook and remove inappropriate messages. Messages appear immediately to invited guests and each invitation can post once.
- Gift payment option and destination (Monzo pot or Stripe link/QR), and wording.
- The Google account email addresses for Tasha and Sianne, who will view responses, and the support email address Firebase can display for sign-in. Confirm whether they also need exports or editing.
- Confirm when to take the site offline after the wedding and what to retain or delete, including guest data. No automatic shutdown or deletion is configured.

The reference address, 1 Brixton Hill, London SW2 1RW, was confirmed by the user over the conflicting address in the specification. The latest specification supplies the timetable.

## RSVP and Firebase

Firebase project `zoey-and-christian-wedding` has Firestore in London (`europe-west2`). The static form sends replies directly to Firestore. The deployed rules allow RSVP reads only for the shared organiser account, deny client updates and deletions, and allow a validated, one-time response only when the private invitation document exists. Guestbook messages are readable only after a valid invitation code has been verified; invitation proofs remain private. The project owner can review responses in Firebase Console → Firestore → Data → `rsvps`. Guest responses include potentially sensitive dietary/accessibility details; restrict console access appropriately.

No guest invitation codes have been issued yet. To issue a code, generate 16 cryptographically random bytes as 32 lowercase hexadecimal characters (e.g. `openssl rand -hex 16`), add a document under `invitations` with that value as the document ID and a private label field, then share the code securely with the invited household. Do not commit codes or guest information to GitHub. Each code supports one response and cannot be used to edit it; organisers can handle corrections in the console. The code is a bearer credential: anyone who receives it can submit once. Decide the guest list and delivery method before issuing codes. A labelled test invitation and response are separate from guest replies.

Email/SMS reminders are not active. The invitation-only message board uses the same invitation codes, with one message per invitation. Messages appear immediately without moderation; organisers can remove inappropriate messages from the `messages` collection in Firebase Console. Messages do not contain invitation codes or RSVP details. The project is on Spark; no payment service or automated shutdown is configured. Before sending real invitations, agree on response deadline, contact/consent, access and retention arrangements and test the process with the couple.

## Organiser area

The password sign-in page is at `admin/dashboard/view/` and asks search engines not to index it. It uses the shared Firebase account `dashboard@wedding.invalid`. The account UID in `firestore.rules` restricts RSVP reads to that account; this rule is published. RSVP records remain inaccessible to other clients, and no client can edit or delete them. The couple's names were chosen as the shared password despite their being public and easily guessed; anyone with that password can access private guest details. The older `organiser.html` is an inactive setup page. Firebase Console project owner access is separate from dashboard access.

## GitHub Pages

GitHub Pages publishes `main` from the repository root. Changes pushed to `main` are public. Run the tests before publishing.

For guestbook rule tests, use the Firebase Local Emulator Suite with `@firebase/rules-unit-testing` and `firebase` installed; point `WEDDING_RULES_FILE` at `firestore.rules` and run `tests/guestbook.rules.cjs` against a Firestore emulator. The test uses a demo project and synthetic data.

## Venue images and maps

Lambeth Town Hall photo by Mahlum, [public domain](https://commons.wikimedia.org/wiki/File:Lambeth_town_hall_London.jpg), displayed uncropped. Maps use OpenStreetMap with attribution. The Bensham Hall marker uses the venue coordinates from HallMatch (51.3961538, -0.1056812), corroborated to within several metres by Hitched; another venue directory gives a conflicting location. Confirm the exact entrance with the venue if needed. Bensham Hall exterior photo is displayed directly from the [Hitched venue listing](https://www.hitched.co.uk/wedding-venues/bensham-hall_149434.htm) at the user’s request. A reuse licence has not been established; it is hosted by the source and may become unavailable.
