# Data contract and imports

## Record fields

| Canonical field | Accepted examples | Validation / storage |
| --- | --- | --- |
| pincode | Pincode, PIN, PostalCode | Exactly six digits, first digit nonzero; stored as text |
| officeName | OfficeName, name | Required; normalized whitespace; source spelling preserved |
| officeType | OfficeType, type | BO/B.O, SO/S.O, HO/H.O normalized to B.O/S.O/H.O |
| delivery | Delivery, DeliveryStatus | Delivery or Non-Delivery; spaces and hyphens normalized |
| district | District, DistrictName | Required; source boundary/name retained |
| state | State, StateName | Matched to supported 28 states and 8 UTs |
| circle | Circle, CircleName | Required source value |
| region | Region, RegionName | Required source value |
| division | Division, DivisionName | Required source value |
| taluk | Taluk, TalukName, Taluka | Optional; SQL NULL when absent |
| latitude | latitude, lat | Optional finite number in [-90,90] |
| longitude | longitude, lon | Optional finite number in [-180,180] |

Coordinates must be supplied together. Location URLs appear only when both coordinates exist. No office coordinates are inferred from city centers.

CSV is streamed with a BOM-aware CSV parser and handles quoted commas/newlines. JSON accepts an array or an object with a `records` array; JSON input is parsed in memory. Prefer CSV for large imports. Files must be UTF-8. ZIP/XLSX sources should be converted to CSV first.

Missing required values fail the import. Do not fill unknown values with guessed facts. If a source legitimately omits a postal region/division, explicitly mark it `Not supplied by source` in an audited preprocessing step, or change the schema and renderer to nullable fields for your source. Do not label a development fixture as production merely to remove the preview notice.

## Identity and routes

Office identity uses normalized state, district, office name, PIN and type. A 12-character SHA-256 suffix protects routes from same-name collisions. Office paths follow:

```
/andhra-pradesh/kakinada/kakinada-h-o-533001-<stable-id>
```

Exact duplicates disappear; entries with the same identity but different data fail as conflicting duplicates. Hash collisions also fail safely rather than overwriting. IDs/slugs are independent of input row order. A change to identity fields changes the route: retain an old-to-new mapping and add explicit redirects in `next.config.ts` when changing names, districts or identity rules between snapshots.

## Geography

State aliases include Orissa → Odisha, Pondicherry → Puducherry, and the combined Dadra/Nagar Haveli/Daman/Diu UT. These normalize names only. They do not reassign old districts to new states/UTs. Historical Ladakh records under Jammu and Kashmir, old Andhra Pradesh records before Telangana, and reorganized civil districts need a source-grounded crosswalk or a newer source. No automatic PIN-based boundary guesses are made.

The importer expects Latin-script district names to construct slugs. Postal names retain their source text; FTS5 uses Unicode tokenization. Translated/transliterated variants require data supplied by the operator.

## Database structure

- `offices`: one normalized record per office identity; unique `(stateSlug,districtSlug,slug)`.
- `office_search`: FTS5 external-content index on office name, district and state; 3/4/5-character prefix indexes.
- `states`: all 36 regions with distinct PIN counts, office counts and district counts.
- `districts`: imported district counts keyed by `(stateSlug,slug)`.
- `metadata`: dataset kind, source, URL, source date, import time and row totals.
- `urls`: a sequential, deterministic list of canonical indexable directory paths.

PIN code count means `COUNT(DISTINCT pincode)`, not office count. One code can serve multiple offices.

## Atomic replacement

The importer builds a temporary database beside the destination, validates all input, commits, builds FTS/statistics, and vacuums. Only then does it rename the temporary file over the old database. Invalid input leaves the old file untouched. Run imports offline or during deployment, never from a public API. On Windows, stop processes holding the SQLite file before replacing it. Reopen/redeploy after each import so old read-only connections and generated pages are discarded.

`data/postal.sqlite` is the fixed runtime path used by file tracing. `--output` supports tests/benchmarks; copy or import to the fixed path for actual deployment.
