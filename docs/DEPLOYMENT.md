# Vercel deployment

## 1. Run locally

Use Node.js 24 and `npm ci`. Verify `npm run build` and `npm run test:http`. The sample database is generated from data/sample.json during the first build, without external data access.

## 2. Create a GitHub repository

Upload the project contents, including the lockfile, configuration, source and data/sample.json. Exclude node_modules, .next, environment files and test-results. The project root is the directory containing package.json.

For a large production database, prefer a build-time source snapshot instead of committing a large generated SQLite binary. Do not commit credentials or signed dataset URLs.

## 3. Import the repository in Vercel

Select Next.js, Node.js 24, install command `npm ci`, build command `npm run build`. Keep the standard Next.js output setting. `next.config.ts` externalizes better-sqlite3 and explicitly includes `data/postal.sqlite` in traced server functions.

Use a production HTTPS origin in `NEXT_PUBLIC_SITE_URL`. Set it without a path or query string. Configure `ENABLE_INDEXING=false` initially and `NEXT_PUBLIC_ADS_MODE=off` until launch review is complete. Environment changes require a rebuild. Vercel preview deployments remain noindex even if the production indexing flag is inherited.

## 4. Supply production data

Use the included reproducible build-time download flow, or import a reviewed snapshot locally to data/postal.sqlite and explicitly include that generated file in your deployment. Generated SQLite files are gitignored by default.

For the build-time flow, store an immutable CSV/JSON snapshot in storage you control. Set:

| Variable | Value |
| --- | --- |
| POSTAL_DATA_URL | HTTPS download URL to the exact snapshot (keep private URLs server-side) |
| POSTAL_DATA_SHA256 | SHA-256 hex digest of the downloaded bytes |
| POSTAL_DATA_FORMAT | csv or json |
| POSTAL_SOURCE_NAME | Dataset/publisher name |
| POSTAL_SOURCE_URL | Public provenance page, not a signed storage URL |
| POSTAL_SOURCE_DATE | Verified snapshot date as YYYY-MM-DD |

Compute the checksum with `sha256sum india-post.csv` on Linux, `shasum -a 256 india-post.csv` on macOS, or `Get-FileHash india-post.csv -Algorithm SHA256` in PowerShell. The build verifies the checksum, imports production data atomically, deletes the downloaded input, validates deployment settings, then runs Next.js. A failed download, checksum or import fails the build rather than falling back silently to sample data.

Do not download the dataset in a server request or write to the deployed filesystem. The production database is an immutable deployment artifact. Updates require a new import and redeployment.

## 5. Review a deployed preview, then launch

Check source counts and coverage, autocomplete, office pages, copy controls, real 404 responses and mobile layouts. With reviewed production data and your real domain set, use `ENABLE_INDEXING=true` in the Production environment and redeploy. Inspect `/robots.txt`, `/sitemap-index.xml`, `/sitemap-1.xml` and canonical URLs. Submit the sitemap index in Search Console.

Ads require publisher approval and IDs; see SEO-ADS.md.

## Capacity and operations

The synthetic 160,000-record database measured about 122 MiB, including URL and FTS indexes. Your real dataset may differ. Vercel's standard uncompressed function limit is documented as 250 MB; check the full traced deployment bundle and the current plan/platform limits. Avoid bundling raw input data into server functions. Large-function offerings, if available to your account, have separate requirements.

The API constrains per-request work and allows CDN caching; configure edge rate limiting and bot protection for sustained abusive traffic. Measure real cold starts, field Core Web Vitals, cache hit rates and hosting costs. Benchmark numbers here are not a traffic-capacity guarantee.

Keep only public postal records in the data file. The service is read-only and has no administrative upload endpoint or application accounts. Dataset imports belong in trusted CI or a developer workstation.

## Cloudflare

This package targets Vercel/Node, one of the requested hosting choices. Do not deploy its native SQLite runtime directly to Workers. A Cloudflare version needs:

1. OpenNext's Cloudflare adapter and Wrangler bindings.
2. A D1/KV data adapter replacing the synchronous better-sqlite3 repository.
3. Async server data access and migration/import scripts suitable for D1 limits.
4. Verification of FTS and query performance against the selected database version.
5. Worker caching, rate limiting, environment bindings and production preview checks.

Those changes are not included. Cloudflare can also front a separately hosted Node origin, but that is not a native Workers deployment.

## Official references

- https://nextjs.org/docs/app/api-reference/config/next-config-js/output
- https://vercel.com/docs/functions/limitations
- https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/
