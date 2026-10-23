PRAGMA journal_mode = DELETE;
PRAGMA synchronous = NORMAL;
CREATE TABLE offices (
 id TEXT PRIMARY KEY, pincode TEXT NOT NULL CHECK(length(pincode)=6 AND pincode NOT GLOB '*[^0-9]*' AND substr(pincode,1,1) != '0'),
 name TEXT NOT NULL, officeType TEXT NOT NULL CHECK(officeType IN ('B.O','S.O','H.O')),
 delivery TEXT NOT NULL CHECK(delivery IN ('Delivery','Non-Delivery')),
 district TEXT NOT NULL, districtSlug TEXT NOT NULL, state TEXT NOT NULL, stateSlug TEXT NOT NULL,
 slug TEXT NOT NULL, taluk TEXT, circle TEXT NOT NULL, region TEXT NOT NULL, division TEXT NOT NULL,
 latitude REAL, longitude REAL, UNIQUE(stateSlug,districtSlug,slug)
);
CREATE INDEX idx_pin_name ON offices(pincode,name,id);
CREATE INDEX idx_district_name ON offices(stateSlug,districtSlug,name,id);
CREATE INDEX idx_name ON offices(name COLLATE NOCASE);
CREATE VIRTUAL TABLE office_search USING fts5(name, district, state, content='offices', content_rowid='rowid', tokenize='unicode61 remove_diacritics 2', prefix='3 4 5');
CREATE TABLE states (name TEXT NOT NULL, slug TEXT PRIMARY KEY, kind TEXT NOT NULL, offices INTEGER NOT NULL, pincodes INTEGER NOT NULL, districts INTEGER NOT NULL);
CREATE TABLE districts (name TEXT NOT NULL, slug TEXT NOT NULL, stateSlug TEXT NOT NULL, offices INTEGER NOT NULL, pincodes INTEGER NOT NULL, PRIMARY KEY(stateSlug,slug));
CREATE TABLE metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE urls (seq INTEGER PRIMARY KEY, path TEXT NOT NULL UNIQUE);
