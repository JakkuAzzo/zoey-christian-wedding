# Zoey & Christian's wedding

A static wedding website for GitHub Pages. Open `index.html` locally or serve this directory with a static server. All paths are relative for a project Pages URL.

The countdown reaches zero at midnight in London at the start of 19 February 2027, rather than assuming a ceremony start time. Run `node --test tests/countdown.test.js` to check its arithmetic. The entrance can be skipped, respects reduced-motion preferences and does not require JavaScript to access the page.

## Decisions to ask the couple

- RSVP deadline and whether any response cutoff or invitation-specific access is needed.
- Email and SMS provider, sender identity, reminder timing, guest contact details, consent and opt-out approach.
- Whether to include a public guestbook, including moderation and removal arrangements.
- Gift payment option and destination (Monzo pot or Stripe link/QR), and wording.
- Who should access the private RSVP records and how they will review or export them.
- Confirm when to take the site offline after the wedding and what to retain or delete, including guest data. No automatic shutdown or deletion is configured.

The reference address, 1 Brixton Hill, London SW2 1RW, was confirmed by the user over the conflicting address in the specification. The latest specification supplies the timetable.

## RSVP and Firebase

RSVP collection and reminders are not yet active. Never put guest information or service credentials in this public repository. Before opening responses, establish secure storage and access controls for names, children’s ages, allergies and accessibility requests, and test the full submission and retrieval flow. An open public database or client-side hiding is not sufficient. Do not collect live responses until this work is complete.

## GitHub Pages

GitHub Pages publishes `main` from the repository root. Changes pushed to `main` are public. Run the tests before publishing.
