# Publishing clearunitplan.com

## Hosting decision

GitHub Pages can serve the prototype. GitHub's published terms limit use as a free host for running an online business while allowing some monetization. Obtain clarification for the planned AdSense business or use a suitable production host, such as Cloudflare Pages. This is unresolved. The GitHub repository remains the source in either case.

Official references

- https://docs.github.com/en/site-policy/github-terms/github-terms-for-additional-products-and-features#pages
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## GitHub Pages prototype

1. In the repository, open Settings > Pages and choose GitHub Actions as the source.
2. Verify the custom domain under account Settings > Pages using the TXT record GitHub supplies. Use GitHub's actual verification value.
3. Set the repository's Pages custom domain to `clearunitplan.com`. The built CNAME file alone does not configure an Actions-based deployment.
4. At the domain's DNS provider, point the apex `@` to these four A records. Keep unrelated email records intact.

| Type | Host | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | MahmudEG.github.io |

5. Run Actions > Publish GitHub Pages preview > Run workflow on main.
6. Wait for the deployment and DNS checks to complete. Enable Enforce HTTPS when GitHub makes it available. Verify the apex and www domains, guides, calculator and print result.

These DNS instructions apply only to GitHub Pages. Cloudflare Pages supplies its own destination during custom-domain setup. Domain registrar and existing DNS records are currently unknown. Inspect them before applying changes.

## Google and launch checks

- Add a Search Console domain property and set the exact TXT record it supplies.
- Submit `https://clearunitplan.com/sitemap.xml` after the domain serves the site over HTTPS.
- Confirm which existing account is AdSense and the status of its current site. A different site's pending review does not verify this site.
- Review the public about, privacy and method pages. Add real account identifiers and any required consent controls before enabling ads or analytics.
- Complete mobile usability testing with actual renters. Do not count the worked example as user validation.
- Record US organic visitors, users completing a comparison, site pageviews, publisher earnings, costs and hours once measurement is configured. Revenue per thousand site pageviews remains unknown until measured.
