# Area information, importance and photographs

Version 1.1 adds **Discover the area** to each post-office detail page and direct PIN lookup page. A PIN shared by several offices has an area selector; the profile never assumes every office is the same village. The postal lookup renders immediately, even when external area sources are slow or unavailable.

## What visitors see

- A locality overview, clearly distinguished from wider district context.
- Curated importance/landmark cards where an editor has supplied checked sources.
- Real place photographs with photographer, licence link and original Commons source.
- Source links, review/retrieval dates and a direct route to the original article.
- Loading, retry, no-reliable-match, missing-licensed-photo and broken-image states.

The bundled curated profile covers Kakinada and its surroundings, including Hope Island, the nearby Coringa landscape, and Samarlakota heritage. It includes three actual Commons photographs: the collectorate building, Coringa mudflats and the Kakinada coast/Hope Island satellite image. Out-of-locality attractions are explicitly labelled. None is presented as a landmark inside a specific PIN boundary merely because it is nearby.

## Lookup order

1. `lib/areas/catalog.ts` matches a curated entry from `data/area-guides.json` by both state and district. Exact listed locality names receive a locality label; all other offices receive a wider-context label.
2. Without a curated entry, the browser calls `/api/area?office=<existing-office-id>`.
3. The API derives the locality and district from the postal database, then requests a Wikipedia summary for the locality, the district article, or the district-name article, in that order.
4. A candidate must be a place, have a matching title, and identify India and the expected state. A locality also needs district context or nearby source coordinates. Disambiguation pages, people and wrong-state matches are rejected.
5. If a matched article has a Commons image, the API requests its individual credit/licence metadata. Only supported openly reusable images with credit, trusted URLs and dimensions are returned.
6. If no candidate passes, an honest no-profile state appears. There is no generated history, invented landmark or substituted stock photo.

Automated matching is conservative and not a guarantee of geographic identity. Source data can contain old district names or ambiguous place names. Editorial overrides are preferred for those cases. Wikipedia is labelled as an encyclopedia source, not an official tourism authority. Its excerpt does not necessarily contain an area's economic/cultural importance; add curated highlights when richer coverage is needed.

## Caching and latency

- The postal page does not wait on Wikipedia.
- Curated profiles render in the initial HTML, including source and photo details.
- Live profiles load progressively and are not promised to contribute to initial server HTML SEO.
- Each external request has a 2.5-second timeout. At most three article candidates and one image-credit request are tried.
- Successful source requests use Next.js daily caching; the API response has CDN caching. Negative results have a short five-minute response TTL.
- The client cancels stale requests when switching offices and reuses results in the current view.
- Remote images are lazy loaded, have explicit dimensions and expose a source link if loading fails.

No paid API key, AI key, image generation or user location permission is needed. The runtime must allow HTTPS connections to `en.wikipedia.org` and `commons.wikimedia.org`; visitor image requests use `upload.wikimedia.org` or `thumb.wikimedia.org`. Hosting rate limits/WAF rules should cover the area endpoint as well as search.

Set `AREA_DISCOVERY=off` to disable external discovery while retaining curated profiles. Curated photograph URLs still load from their source hosts. The privacy policy explains these requests separately from advertising consent.

## Adding curated coverage

Add an entry to `data/area-guides.json` with `stateSlug`, `districtSlugs`, `localities` and `guide`. Follow the `AreaGuide` type in `lib/areas/types.ts`. Give each factual highlight a source URL, record the actual review date and check administrative context. Do not assign a single district guide as an exact profile for every village.

Each image needs its URL, precise caption, original photographer, licence name/link, Commons source page, width and height. Verify the depicted location and individual reuse terms. An image's presence in search results or Wikipedia is not permission to reuse it. Do not add social-media images or a general image-search feed without checking rights.

Wikipedia text excerpts retain contributor/article attribution and CC BY-SA 4.0 links; image licences are separate. Curated descriptive text is original paraphrase grounded in the listed sources. Images are not covered by the application's MIT code licence.

## Sources used for the bundled profile

- https://kakinada.ap.gov.in/tourism/tourist-places/
- https://forests.ap.gov.in/Coringa
- https://commons.wikimedia.org/wiki/File:District_Collector_Office_building_at_Kakinada.jpg
- https://commons.wikimedia.org/wiki/File:Coringa_Wildlife_Sanctuary_1.jpg
- https://commons.wikimedia.org/wiki/File:Satellite_kkd.jpg

API references: https://www.mediawiki.org/wiki/API:Imageinfo and https://commons.wikimedia.org/wiki/Commons:Machine-readable_data.
