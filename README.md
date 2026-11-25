# Clear Unit Plan

Storage move-out calculator for **clearunitplan.com**, operated by Mahmud Elgoueri.

## Local use

Use Node.js 22 or newer. There are no npm dependencies.

```sh
npm test
npm run build
```

Serve `dist` with a static HTTP server to preview. The main calculator compares car trips, a rental truck and a later move. Complete every transport plan, including the eventual cost of the later move. The next unpaid billing date and notice period determine estimated extra rent. A confirmed additional-rent override replaces that estimate for an individual plan. The method page documents limitations.

## Scheduled work

- `Check planner` runs on pushes, pull requests, manual requests and daily at 06:17 UTC. It tests calculations and the build, then saves a preview artifact.
- `Review operator sources` runs Mondays at 06:27 UTC and on manual requests. It produces an Actions summary and downloadable report. Missing wording and blocked requests fail the job for owner review. It never changes published factual claims automatically.
- `Publish GitHub Pages preview` runs manually. It checks the site before publishing. Enable GitHub Actions as the Pages source and configure the custom domain before using it. After edits, run it again to update the preview.

GitHub may delay scheduled jobs. Scheduled workflows in inactive public repositories can be disabled by GitHub. Review Actions availability regularly.

## Launch status and remaining work

The repository contains the working prototype, seven supporting pages, calculation checks, source checks and a manual deployment workflow. Publication, DNS, Google account setup and demand validation remain separate steps. No revenue or visitor data is connected yet. No ads are active.

Read [LAUNCH.md](LAUNCH.md) for domain and publishing steps. The source and generated site can also deploy to Cloudflare Pages using build command `npm run build` and output directory `dist`.

## Advertising and measurement

Before adding AdSense, verify the selected host permits the intended business, complete site approval, obtain the real publisher ID and configure the required consent/privacy disclosures. GitHub Pages limits running an online business and permits some monetization. Its terms do not explicitly approve this particular business model. Use the current deployment as a prototype until production hosting is resolved.

The current site has no AdSense or analytics scripts. The privacy page reflects that. Ad activation must update the page and use actual account values. Use Search Console for search discovery. Connecting automated search and earnings reports requires separately authorized account access. Visitor completion tracking has not been configured.

## Weekly owner routine

Review any failed check and the weekly source report. Check the three worked examples against current source notes. Gather usability feedback from five US storage renters and make the result easier to understand. Once Search Console is connected, prioritize actual queries and completed decisions. Publish a new example only when it answers a different useful question. Track hours and expenses in your forecast workbook.

## Budget

The owner reported a domain purchase of 180 LYD, approximately USD 20. Track the actual USD equivalent separately. Remaining pilot allowance is approximately USD 30. Hosting, Actions within included usage and this dependency-free implementation have no planned subscription charges.
