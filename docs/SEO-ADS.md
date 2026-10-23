# SEO and advertising

## Indexing model

`ENABLE_INDEXING=true` only works with a production-classified dataset. Build validation also requires a real HTTPS origin. Vercel previews stay noindex. Sample data is visibly labelled, noindex, blocked in robots, and has an empty sitemap index.

State and office pages use server-generated metadata. Direct PIN and district pages have descriptive titles. Every directory route has visible breadcrumbs and BreadcrumbList JSON-LD. Office records include a PostOffice schema with a nested PostalAddress; coordinates appear only if supplied.

Canonical paths include the stable office ID. District/PIN pagination has self-canonicals and linked navigation. Filter queries and internal search are noindex to avoid combinatorial search-result URLs. Invalid state, district, office, PIN and out-of-range pagination routes return not-found responses. Avoid adding a global loading.tsx that streams headers before notFound runs; this can turn an expected 404 into a streamed 200.

Sitemaps contain 10,000 canonical paths per chunk. The database's sequential URL table gives bounded range queries, and lengths stay well within ordinary sitemap entry/size limits at this chunk size. URLs are XML escaped. JSON-LD escapes `<` to prevent script-breakout from imported strings. No fabricated ratings, hours or phone numbers are emitted.

Programmatic pages still need useful, accurate data. Rich results, ranking and indexing are decisions made by search engines, not outcomes guaranteed by schema markup.

## Display slots

```tsx
<AdSlot placement="leaderboard" isDev={true} />
<AdSlot placement="content" />
<AdSlot placement="anchor" />
```

- Leaderboard below the header: responsive, reserved placeholder dimensions.
- In-content: between office detail information and related-office list.
- Mobile anchor: dismissible demonstration placeholder. In live mode this manual component returns null; AdSense Auto ads controls real anchors.

Modes: `off`, `placeholder`, `live`. The default is placeholder. Placeholder slots clearly say ADVERTISEMENT and never load ad scripts. Live ads are also disabled for the sample dataset.

Set:

```dotenv
NEXT_PUBLIC_ADS_MODE=live
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-YOUR_16_DIGIT_PUBLISHER_ID
NEXT_PUBLIC_AD_SLOT_LEADERBOARD=YOUR_SLOT_ID
NEXT_PUBLIC_AD_SLOT_CONTENT=YOUR_SLOT_ID
```

Use your actual IDs. `ads.txt` is generated from the validated publisher ID. Confirm the record shown in your own AdSense account. The script loads once after opt-in; display slots initialize near the viewport. Empty or missing configuration hides live slots.

Enable **Auto ads → Anchor ads → Bottom only** in the AdSense interface for mobile bottom anchors. Google controls rendering, sizing and dismissal. Do not add CSS that pins ordinary display ads over navigation or content. Keep ad exclusions/density settings appropriate to the directory.

## Consent and policies

The included preference panel is a basic opt-in gate, not a Google-certified CMP. It stores the choice in localStorage and loads no Google advertising script until allowed. Revoking an existing allowance reloads the page to stop further script loading. It does not erase existing Google cookies.

For traffic where Google requires a certified CMP (including EEA, UK and Switzerland under the applicable Google requirements), integrate a certified CMP and drive the ad-loading gate from it before serving ads there. The bundled panel alone is not sufficient for those requirements. Follow your publisher account's current consent instructions and test allow, decline and revoke paths with the actual CMP. Do not claim global AdSense or privacy compliance solely from this component.

Before public launch, customize About, Privacy and Terms to accurately identify the operator, contacts, actual hosting/log-retention practices and any analytics added later. Check dataset licensing and attribution. Approval, ad fill and monetization are not guaranteed by this application.

## Official references

- https://support.google.com/adsense/answer/15484692 (anchor ads)
- https://support.google.com/adsense/answer/16242705 (anchor positioning settings)
- https://support.google.com/adsense/answer/13554116 (consent platform requirements)
- https://policies.google.com/technologies/partner-sites
- https://data.gov.in/catalog/all-india-pincode-directory-through-webservice
