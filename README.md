# PIN Atlas — India PIN Code & Postal Directory

A complete Next.js App Router application for an Indian postal directory with locality information and real place photographs. It includes a responsive interface, indexed SQLite search, state/district/office/PIN routes, metadata, structured data, partitioned sitemaps, data ingestion, and opt-in advertising integration.

**Included data: 24 demonstration offices and 22 unique PIN codes. This is not the complete India dataset.** The sample details are development fixtures, not verified postal advice. All 36 states/UTs appear; counts always describe loaded records. Sample pages are marked `noindex`, blocked in robots.txt, and excluded from sitemaps.

## Quick start

Requires Node.js 22.13+ and npm. Node.js 24 is the tested runtime.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

On Windows PowerShell, replace the second command with:

```powershell
Copy-Item .env.example .env.local
```

Open http://localhost:3000. The sample SQLite database is generated automatically from versioned JSON on the first dev/build run. Rebuild it if needed:

```bash
npm run data:sample
```

For a production-mode local run:

```bash
npm run build
npm start
```

## Stack

| Layer | Implementation |
| --- | --- |
| Framework | Next.js 16.3.8, App Router |
| UI | React 19.3.0, Tailwind CSS 4.3.3, Lucide icons |
| Type safety | TypeScript, strict mode |
| Database | better-sqlite3 13.0.3, SQLite FTS5 |
| Server runtime | Node.js; read-only database during requests |
| Primary deployment | Vercel, or another Node.js host |

Dependencies are pinned and a lockfile is included. Validate upgrades before changing framework versions.

## Area discovery

PIN and office detail pages now show **Discover the area**: local importance, source-backed highlights, real photographs and photo credits. Kakinada has a bundled curated profile. Other loaded offices use conservative Wikipedia/Commons matching with labelled district fallbacks and honest unavailable states. No paid API key is needed. See [AREA-GUIDES.md](docs/AREA-GUIDES.md) for coverage, source requirements and editorial overrides.

## Project structure

| File/directory | Responsibility |
| --- | --- |
| `app/layout.tsx` | Header, footer, dataset notice, ad provider, global metadata |
| `app/page.tsx` | Search, state cards, quick lookups and PIN guide |
| `app/[state]/page.tsx` | State and UT directory; district links |
| `app/[state]/[district]/page.tsx` | Filtered, paginated office directory |
| `app/[state]/[district]/[office]/page.tsx` | Office details, copy PIN, source notes and related offices |
| `app/pincode/[code]/page.tsx` | Every loaded office sharing a six-digit PIN, paginated |
| `app/search/page.tsx` | Server-rendered search results, noindex |
| `app/api/search/route.ts` | Bounded autocomplete JSON endpoint |
| `app/sitemap-index.xml/route.ts` | Sitemap index |
| `app/sitemaps/[chunk]/route.ts` | Chunk handler, publicly rewritten to `/sitemap-N.xml` |
| `app/robots.ts` | Environment-aware robots.txt |
| `app/opengraph-image.tsx` | Generated 1200 × 630 social card |
| `app/ads.txt/route.ts` | Publisher ID-based ads.txt |
| `app/about`, `app/privacy`, `app/terms` | Source explanation and starter policy pages |
| `app/error.tsx`, `app/not-found.tsx` | Recovery and missing-record states |
| `app/globals.css` | Responsive visual system and Tailwind entrypoint |
| `components/area-section.tsx`, `components/area-explorer.tsx` | Source-backed local profiles, area selector and photo gallery |
| `lib/areas/`, `data/area-guides.json` | Curated lookup, Wikipedia provider, location and image validation |
| `app/api/area/route.ts` | Existing-office-only area discovery with bounded external requests |
| `tests/areas.test.ts` | Place matching, scope, image attribution and source-failure checks |
| `components/search.tsx` | Debounce, cancellation, keyboard navigation and result states |
| `components/state-grid.tsx` | State/UT tabs and name filtering |
| `components/office-table.tsx` | Server-rendered office table and pagination |
| `components/copy-pin.tsx` | Clipboard interaction and feedback |
| `components/breadcrumbs.tsx` | Visible breadcrumbs plus BreadcrumbList |
| `components/structured-data.tsx` | Safely serialized JSON-LD |
| `components/ads.tsx` | Ad slots, placeholders and basic ad preferences |
| `lib/db.ts` | Read-only connection and parameterized queries |
| `lib/schema.sql` | Tables, FTS5 and indexes |
| `lib/types.ts` | Shared postal record and directory types |
| `lib/states.ts` | 28 states, 8 UTs and conservative state aliases |
| `lib/seo.ts` | Canonicals, indexing controls, OpenGraph and XML escaping |
| `lib/params.ts` | Query parameter normalization |
| `scripts/import-data.ts` | CSV/JSON validation, normalization, deduplication and atomic import |
| `scripts/prepare-data.ts` | Optional build-time download of a checksummed dataset snapshot |
| `scripts/check-deployment.ts` | Prevent indexing sample data or using a placeholder production origin |
| `scripts/benchmark.ts` | Reproducible synthetic 160,000-record benchmark |
| `data/sample.json` | Demonstration input; SQLite database generated locally/build-time |
| `tests/data.test.ts` | Importer integrity and error handling tests |
| `tests/sitemaps.test.ts` | Production sitemap chunk boundaries and URL completeness |
| `tests/http.test.ts` | Production HTTP, metadata and noindex checks |
| `tests/browser/directory.spec.ts` | Desktop/mobile UI tests |
| `docs/DEPLOYMENT.md` | Vercel launch, source snapshots and hosting limitations |
| `docs/DATA.md` | Input schema and data-quality rules |
| `docs/SEO-ADS.md` | SEO and advertising configuration |
| `docs/VALIDATION.md` | Verification results and benchmark scope |

## Load your complete dataset

Get a current, licensed CSV/JSON snapshot from the [Government of India open data catalog](https://data.gov.in/catalog/all-india-pincode-directory-through-webservice). Downloads or API access may require a data.gov.in account/API key. Review the source date, attribution and reuse terms. No key or full national dataset is bundled.

The importer accepts common official headers such as `OfficeName`, `Pincode`, `OfficeType`, `Delivery`, `District`, `StateName`, `CircleName`, `RegionName` and `DivisionName`. Header punctuation, case and whitespace are normalized.

```bash
npm run data:import -- --input /path/to/india-post.csv --kind production --source "Department of Posts via data.gov.in" --source-url "https://data.gov.in/catalog/all-india-pincode-directory-through-webservice" --as-of YYYY-MM-DD
```

Replace `YYYY-MM-DD` with the actual source snapshot date. `--kind production` records your explicit classification; it does not verify completeness or currency. Verify state coverage, office counts and sample records against the source before enabling indexing.

A single invalid or conflicting record fails the entire import and leaves the previous database untouched. The error includes up to 100 row-level reasons. Exact duplicate rows are removed; distinct offices sharing a PIN remain separate. Restart the development server or redeploy after changing the database.

See [DATA.md](docs/DATA.md) for input mappings and boundary limitations.

## Search and performance

- 180 ms debounce; starts after three letters/digits.
- AbortController cancels stale requests.
- PIN prefixes use a B-tree range; area tokens use FTS5 prefix search.
- Autocomplete returns at most eight offices. The browser never downloads the national dataset.
- The API constrains query length to 80 characters, token count to six and result count to 50 internally.
- Results pages return 50 offices per page with ordinary crawlable links.
- State and district counts are materialized during import.
- The database is opened once per server process in read-only mode.
- Home/state pages are generated at build time; office pages use on-demand generation with daily revalidation. Filtered district and PIN pages render on request.
- Search responses carry CDN caching headers. Apply host-level rate limiting/WAF rules for public high-volume traffic; an in-process counter is not a distributed rate limiter.

Search is token-prefix based, not fuzzy spelling correction or arbitrary substring search. Matching works across office names, districts and states. A query such as `Kaki` finds Kakinada; `nada` is not a suffix search. Non-English names are searchable when present in the imported records; the application does not invent translations.

## SEO and monetization

Metadata and canonical URLs are generated per route. Office pages include `PostOffice` (a LocalBusiness subtype), nested `PostalAddress`, optional `GeoCoordinates`, and `BreadcrumbList`. No fabricated phone numbers, hours, reviews or ratings are published.

`/sitemap-index.xml` lists `/sitemap-1.xml`, `/sitemap-2.xml`, etc., with 10,000 URLs per chunk. A materialized URL table makes chunk retrieval bounded. Empty states, internal search results, query-filter variants, preview deployments and sample data are excluded from indexing. Query-filter variants use noindex; ordinary paginated district/PIN pages use self-canonicals.

Set these after loading and reviewing production data:

```dotenv
NEXT_PUBLIC_SITE_URL=https://your-real-domain.in
ENABLE_INDEXING=true
NEXT_PUBLIC_ADS_MODE=off
```

Advertising supports `off`, `placeholder` and `live`. Placeholder is the default when the variable is absent. `<AdSlot isDev={true} />` forces a labelled preview. Production live mobile anchors are provided by AdSense Auto ads, configured in your AdSense account; manually pinned ad units are not used. See [SEO-ADS.md](docs/SEO-ADS.md) before turning on live ads.

## Deployment

The included implementation targets Vercel's **Node.js runtime**, subject to importing your production data and setting your domain. It is not a Cloudflare Workers drop-in: Workers cannot load the native `better-sqlite3` addon. A Cloudflare port would require an async D1/KV repository and OpenNext configuration. That adapter is not included or claimed as tested.

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for a concrete Vercel workflow, build-time dataset downloads and database bundle limits. Nothing is deployed to a hosting account by this source package.

## Verification

```bash
npm test
npm run build
npm run typecheck
npm run test:http
npx playwright install chromium
npm run test:e2e
npm run benchmark
```

`test:http` and browser tests assume the bundled sample dataset and disabled indexing. Tests are fixtures, not validation of Indian postal facts. Benchmark records are generated in an OS temporary directory, labelled synthetic, and deleted at completion. They are never mixed into the shipped database.

## Before public launch

Import the national dataset; confirm coverage and source rights; set a production domain; review operator/privacy/contact details; configure hosting limits and abuse controls; check real-device performance; then enable indexing. Add AdSense only after site approval and appropriate consent configuration. Code and schema alone do not guarantee search indexing, rich results, AdSense approval or revenue.
