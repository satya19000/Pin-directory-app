import {test} from 'node:test';
import assert from 'node:assert/strict';
import {commonsFileName,localityName,matchesPlace,photoFromCommons,safeUrl} from '../lib/areas/validation';
import {loadWikipediaGuide,type Fetcher} from '../lib/areas/provider';
import {getLocalGuide} from '../lib/areas/catalog';
import type {AreaOffice,WikiSummary} from '../lib/areas/types';
const office:AreaOffice={id:'123456789abc',name:'Kakinada H.O',pincode:'533001',state:'Andhra Pradesh',stateSlug:'andhra-pradesh',district:'Kakinada',districtSlug:'kakinada',latitude:null,longitude:null};
const summary:WikiSummary={type:'standard',title:'Kakinada',description:'City in Andhra Pradesh, India',extract:'Kakinada is a city in Andhra Pradesh, India.',originalimage:{source:'https://upload.wikimedia.org/wikipedia/commons/a/ab/City.jpg'},content_urls:{desktop:{page:'https://en.wikipedia.org/wiki/Kakinada'}}};
const photo={thumburl:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/City.jpg/960px-City.jpg',descriptionurl:'https://commons.wikimedia.org/wiki/File:City.jpg',thumbwidth:960,thumbheight:600,extmetadata:{Artist:{value:'<a href="javascript:evil()">Photographer</a>'},LicenseShortName:{value:'CC BY-SA 4.0'},LicenseUrl:{value:'https://creativecommons.org/licenses/by-sa/4.0/'}}};
test('Curated profiles distinguish exact locality from wider district, never using the same-name wrong state',()=>{assert.equal(getLocalGuide(office)?.scope,'locality');assert.equal(getLocalGuide({...office,name:'Jagannaickpur S.O'})?.scope,'district');assert.equal(getLocalGuide({...office,stateSlug:'telangana'}),null);assert.equal(getLocalGuide(office)?.photos.length,3);});
test('Locality normalization and Wikimedia original filenames handle all office types and thumbnails',()=>{assert.equal(localityName('Kakinada H.O'),'Kakinada');assert.equal(localityName('Mumbai G.P.O.'),'Mumbai');assert.equal(localityName('Village B.O'),'Village');assert.equal(commonsFileName('https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/My_photo.jpg/960px-My_photo.jpg'),'My_photo.jpg');assert.equal(commonsFileName('https://evil.example/wikipedia/commons/a/ab/My_photo.jpg'),null);});
test('Place matching rejects disambiguation, wrong-state and non-place summaries',()=>{assert.ok(matchesPlace(summary,'Kakinada',office,'locality'));assert.equal(matchesPlace({...summary,type:'disambiguation'},'Kakinada',office,'locality'),false);assert.equal(matchesPlace({...summary,description:'Town in Telangana, India',extract:'Kakinada is a town in Telangana.'},'Kakinada',office,'locality'),false);assert.equal(matchesPlace({...summary,description:'Politician from Andhra Pradesh, India'},'Kakinada',office,'locality'),false);});
test('Photo rendering requires an allowed licence, original credit and trusted URLs; metadata stays plain text',()=>{assert.equal(photoFromCommons(photo,'View')?.author,'Photographer');assert.equal(photoFromCommons({...photo,thumburl:'https://evil.example/pixel.jpg'},'View'),null);assert.equal(photoFromCommons({...photo,extmetadata:{}},'View'),null);assert.equal(safeUrl('javascript:alert(1)',['commons.wikimedia.org']),null);});
test('External discovery returns licensed imagery and tolerates source outages without inventing details',async()=>{
 const fetcher:Fetcher=async url=>new Response(JSON.stringify(url.includes('commons.wikimedia')?{query:{pages:[{imageinfo:[photo]}]}}:summary),{status:200,headers:{'Content-Type':'application/json'}});
 const guide=await loadWikipediaGuide(office,fetcher);assert.equal(guide?.scope,'locality');assert.equal(guide?.photos.length,1);assert.equal(guide?.provenance,'wikipedia');
 const down:Fetcher=async()=>new Response('',{status:503});assert.equal(await loadWikipediaGuide(office,down),null);
});
test('District fallback is explicitly marked and survives unavailable image credits',async()=>{
 const fetcher:Fetcher=async url=>{if(url.includes('commons.wikimedia'))return new Response('{}');if(url.includes('Kakinada%20district'))return new Response(JSON.stringify({...summary,title:'Kakinada district',description:'District in Andhra Pradesh, India'}));return new Response('',{status:404});};
 const guide=await loadWikipediaGuide({...office,name:'Unmapped B.O'},fetcher);assert.equal(guide?.scope,'district');assert.equal(guide?.photos.length,0);
});
