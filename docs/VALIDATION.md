# Validation report

Date: 2026-10-05. Tested locally with Node.js 24.19.0.

## Completed

- Production Next.js build and strict TypeScript check.
- Importer tests: shared PIN preservation, exact deduplication, stable collision-resistant slugs, missing optional fields, BOM/quoted CSV input, invalid rows and conflicting duplicate atomic rollback.
- Synthetic production sitemap test: more than 10,000 office URLs split across two chunks with no gaps or duplicates, and invalid chunk rejection.
- Production HTTP checks: home, state, district, office, PIN, repeated search parameters, policies, OpenGraph image, metadata/schema, invalid-route HTTP 404, search input limits, sample robots/sitemap guards.
- Six browser tests across desktop and a 390px mobile viewport: state filtering, autocomplete keyboard navigation, office navigation, clipboard feedback, PIN table, district filtering, no viewport overflow, search endpoint and sample indexing protections.
- Desktop and mobile screenshot inspection. Screenshots were inspected during development; generated screenshots are not part of the source repository.

Browser automation used a locally available Chromium 134 headless shell after the standard browser process could not use this environment's Unix sockets. The project tests use the installed Playwright browser by default; an optional `PLAYWRIGHT_CHROMIUM_EXECUTABLE` override is available. These checks are not a substitute for current Safari/Firefox or physical-device checks.

A streamed HTTP 200 on missing PIN URLs was detected during verification and fixed by removing the global loading boundary. Invalid record routes then passed HTTP 404 checks.

## 160,000-record synthetic benchmark

The benchmark uses generated test names and PINs, not actual postal data. Temporary records and database are deleted after the test.

| Measurement | Result |
| --- | ---: |
| Records | 160,000 |
| Database size including indexes and URL table | 122.36 MiB |
| Import, indexing, materialization and vacuum | 10.14 s |
| PIN prefix lookup p50 / p95 | 0.05 / 0.64 ms |
| FTS prefix search p50 / p95 | 12.70 / 16.51 ms |
| District page query p50 / p95 | 0.11 / 0.22 ms |
| 10,000-row sitemap range p50 / p95 | 2.44 / 3.84 ms |

These are 60 local warm-query measurements per query type. They exclude network time, serverless cold starts, full HTML rendering, real-data distributions, concurrent traffic, CDN behavior and ad loading. No Lighthouse score, national-data completeness, production throughput or revenue claim is made.

## Not exercised

- A full verified national postal snapshot: none was supplied.
- A deployment to the user's Vercel account or custom domain.
- Live AdSense, publisher approval, real ad fill or a certified CMP.
- A native Cloudflare Workers/D1 deployment.
- Sustained load, crawl-budget behavior or real-user Core Web Vitals.

## Commands

Run `npm test`, `npm run build`, `npm run typecheck`, `npm run test:http`, `npm run test:e2e`, and `npm run benchmark`. HTTP/browser tests expect the sample dataset and indexing disabled. Install Playwright Chromium before running browser tests on a new machine.

## Version 1.1 area-discovery verification — 2026-10-23

- Production build and strict type check passed after restoring/installing dependencies.
- Eleven data/sitemap/area unit tests passed (including six new area tests).
- Production HTTP test passed.
- Eight desktop/mobile browser tests passed, including selector changes, district-scope labels, credits, invalid area API requests and no page overflow.
- Three actual Wikimedia thumbnails were fetched and visually inspected. Desktop/mobile gallery screenshots were inspected using these exact downloaded images as deterministic network fixtures. The fixtures are test-only and are not shipped as site content.
- A live Node fetch to the Mumbai Wikipedia summary timed out in this workspace; the no-profile fallback behaved correctly. The external provider was verified with deterministic API responses, but outbound Wikipedia availability must also be confirmed on the deployed host. Curated Kakinada text is available without the external API; its remote image URLs still require a visitor network connection.
- Fresh-clone database setup now generates the small sample DB automatically in dev/build. The full national dataset is still not included.

The local install required providing Node headers directly to node-gyp after this workspace's filesystem rejected archive ownership changes. No environment-specific header path is included in the repository.
