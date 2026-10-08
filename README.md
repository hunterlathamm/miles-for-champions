# Miles For Champions

One-page site for Ryan Latham's Miles For Champions fundraiser for Special Olympics Massachusetts. It's plain HTML with no build step: `index.html` plus `assets/flyer.jpg`.

## Before launch, fill in these placeholders in `index.html`
- `DONATE_URL`: the donation page link (on the buttons with `data-link="DONATE_URL"`)
- `SIGNUP_URL`: the form where runners sign up for loops
- `CONTACT_EMAIL`: Ryan's contact email in the footer
- The Backyard Ultra date and location (search for "coming soon")

## Hosting (GitHub Pages)
1. Go to Settings → Pages, set Source to "Deploy from a branch", and choose `main` / `(root)`.
2. For a custom domain, enter it under Settings → Pages → Custom domain. That creates a `CNAME` file. Then add DNS records at the registrar:
   - Apex domain: `A` records pointing to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `www`: a `CNAME` record pointing to `<github-username>.github.io`
3. Turn on "Enforce HTTPS" once the certificate is issued.

## Local preview
    python3 -m http.server 4173
