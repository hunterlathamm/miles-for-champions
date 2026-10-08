# Miles For Champions

Website for Ryan Latham's Miles For Champions fundraiser for Special Olympics Massachusetts. Plain HTML, CSS and JS with no build step, hosted on GitHub Pages at milesforchampions.com.

- `index.html`: home page
- `register.html`: Backyard Ultra registration (one form covering 100-Mile Solo, Relay Team, and Run a Few Loops)
- `assets/config.js`: **event settings you can edit**: date, times, location, registration deadline, event rules, waiver, links
- `apps-script/Code.gs`: the Google Apps Script that saves registrations to the "Miles For Champions" Google Sheet

## Registration setup (one time)
Registrations are saved to the **Miles For Champions** Google Sheet in Drive.

1. Open the sheet, then **Extensions → Apps Script**.
2. Delete what's in `Code.gs`, paste in the contents of `apps-script/Code.gs`, and save.
3. Pick **setup** in the function dropdown and click **Run**. Approve the permissions. This builds the Registrations, Teams, and Summary tabs.
4. Click **Deploy → New deployment**, choose type **Web app**, set *Execute as* **Me** and *Who has access* **Anyone**, then click **Deploy**.
5. Copy the **Web app URL** (ends in `/exec`) into `scriptUrl` in `assets/config.js`, then commit and push.

If you change `Code.gs` later: **Deploy → Manage deployments → Edit → Version: New version → Deploy** (the URL stays the same).

Confirmation emails are sent from the Google account that owns the script (about 100 per day on a free Gmail account). Set `SEND_CONFIRMATION_EMAILS = false` in `Code.gs` to turn them off.

## The sheet
- **Summary**: live counts: total runners, solo, relay teams and members, few-loop runners, estimated loops, fundraising interest, shirt sizes.
- **Registrations**: one row per runner, including emergency contacts and medical notes. **Keep the sheet private.** Only share it with event staff.
- **Teams**: relay teams, their captains, and how many members have registered.
- To export: **File → Download → CSV** on any tab.

## Before promoting registration
- Add the **official participant waiver** (`waiver.text` or `waiver.url` in `assets/config.js`). The form shows a placeholder until then.
- Fill in the **registration deadline** and the **event rules** in `assets/config.js`. Anything left blank shows "To be announced".
- If the event details change, update `EVENT` in `Code.gs` too (used in confirmation emails).
- Add Ryan's contact email in the `index.html` footer (`CONTACT_EMAIL`).

## Hosting (GitHub Pages)
Settings → Pages deploys from `main` / root. The custom domain is set in the `CNAME` file, and DNS is on GoDaddy (four A records to GitHub's `185.199.108–111.153`, with `www` pointing to `hunterlathamm.github.io`).

## Local preview
    python3 -m http.server 4173
