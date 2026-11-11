# Zoey & Christian's wedding

A static wedding website for GitHub Pages. Open `index.html` locally or serve this directory with a static server. All paths are relative for a project Pages URL.

The countdown reaches zero at midnight in London at the start of 19 February 2027, rather than assuming a ceremony start time. Run `node --test tests/countdown.test.js` to check its arithmetic. The entrance can be skipped, respects reduced-motion preferences and does not require JavaScript to access the page.

## Decisions to ask the couple

- RSVP deadline and whether any response cutoff or invitation-specific access is needed.
- Email and SMS provider, sender identity, reminder timing, guest contact details, consent and opt-out approach.
- Whether to include a public guestbook, including moderation and removal arrangements.
- Gift payment option and destination (Monzo pot or Stripe link/QR), and wording.
- The Google account email addresses for Tasha and Sianne, who will view responses, and the support email address Firebase can display for sign-in. Confirm whether they also need exports or editing.
- Confirm when to take the site offline after the wedding and what to retain or delete, including guest data. No automatic shutdown or deletion is configured.

The reference address, 1 Brixton Hill, London SW2 1RW, was confirmed by the user over the conflicting address in the specification. The latest specification supplies the timetable.

## RSVP and Firebase

Firebase project `zoey-and-christian-wedding` has Firestore in London (`europe-west2`). The static form sends replies directly to Firestore. Published rules in `firestore.rules` deny all client reads, updates and deletions and allow a validated, one-time response only when the private invitation document exists. The project owner can review responses in Firebase Console → Firestore → Data → `rsvps`. Guest responses include potentially sensitive dietary/accessibility details; restrict console access appropriately.

No guest invitation codes have been issued yet. To issue a code, generate 16 cryptographically random bytes as 32 lowercase hexadecimal characters (e.g. `openssl rand -hex 16`), add a document under `invitations` with that value as the document ID and a private label field, then share the code securely with the invited household. Do not commit codes or guest information to GitHub. Each code supports one response and cannot be used to edit it; organisers can handle corrections in the console. The code is a bearer credential: anyone who receives it can submit once. Decide the guest list and delivery method before issuing codes. A labelled test invitation and response are separate from guest replies.

Email/SMS reminders and guestbook are not active. The project is on Spark; no payment service or automated shutdown is configured. Before sending real invitations, agree on response deadline, contact/consent, access and retention arrangements and test the process with the couple.

## Organiser area (not active yet)

`organiser.html` contains a prepared read-only response dashboard. Google sign-in is not enabled and the page displays a setup message. Do not enable `READY` in `organiser.js` until Google sign-in is configured, the support email and GitHub Pages authorised domain are set, the two exact Google accounts are approved, and security rules have been tested and published. The example rules in `organiser-firestore.rules.example` are a draft, not currently deployed. They allow reads only to verified Google accounts with a matching private `organisers/{email}` document; all guest writes remain subject to the existing rules. Never put organiser email addresses in this public repository. Grant and test the two accounts separately, verify all other accounts cannot read, and test an invitation submission remains possible before marking the dashboard active. Access can be revoked by removing the corresponding organiser document. Firebase Console project owner access is separate from dashboard access.

## GitHub Pages

GitHub Pages publishes `main` from the repository root. Changes pushed to `main` are public. Run the tests before publishing.
