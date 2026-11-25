# ATS Resume Checker — free static site

Free, no-backend ATS Resume Checker for US/UK/Canada/Germany job seekers.
All checking runs in the visitor's browser. No resume is uploaded to a server.

## Files
- `index.html` — main hub: ATS Resume Checker (generic, Workday/Greenhouse/Taleo/iCIMS/Lever)
- `nurses/index.html` — ATS Checker for Nurses USA (RN, BSN, NCLEX, Epic, Cerner, ICU, BLS/ACLS, Taleo/Workday/iCIMS; average nurse score 52)
- `fresh-graduates/index.html` — ATS Checker for Fresh Graduates (internships, university projects, coursework, education-first)
- `about.html`, `privacy.html`, `contact.html` — AdSense-ready pages
- `styles.css`, `script.js` — shared design + checker logic (score 0–100, matched/missing keywords, 6 formatting checks, PDF upload via pdf.js CDN)

## Deploy to Cloudflare Pages (free)
Option A — drag & drop (simplest, no GitHub needed):
1. Go to dash.cloudflare.com → Workers & Pages → Create → Pages → Upload assets.
2. Drag this whole folder in, name the project `atsresumechecker`.
3. Live at `https://atsresumechecker.pages.dev`.

Option B — GitHub connect (recommended, so updates auto-deploy):
1. Create a GitHub repo (e.g. `ats-resume-checker`) under username `Kashifjavedkainth` and upload these files.
2. In Cloudflare Pages → Create → Connect to Git → pick the repo → Framework preset: None / static → Build command: (leave empty) → Deploy.
3. Every push to GitHub redeploys automatically.

## Later: custom domain + AdSense
1. Buy a `.com` (about $9–10/year, e.g. Cloudflare Registrar) such as `atsresumechecker.com`.
2. In Cloudflare Pages → Custom domains → Set up a custom domain → enter the domain.
3. Once the site is live on the custom domain with About/Privacy/Contact pages, apply for Google AdSense. Do NOT apply on the free `*.pages.dev` address — AdSense requires a domain you own.

## Limits
- No backend, no database, no accounts. Scores are estimates, not a guarantee of an interview.
- PDF reading needs internet for the pdf.js CDN; pasting text works offline.
- Contact email in `contact.html` is a placeholder (`contact@atsresumechecker.example`) — replace it when the real domain/email is ready.
