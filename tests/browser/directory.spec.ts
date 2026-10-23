import fs from 'node:fs';
import path from 'node:path';
import {test,expect} from '@playwright/test';
test('Homepage filters, autocomplete and office navigation',async({page})=>{await page.goto('/');await expect(page.getByRole('heading',{name:'Every place. One PIN code.'})).toBeVisible();await page.getByRole('textbox',{name:'Filter states'}).fill('Andhra');await expect(page.locator('.state-card')).toHaveCount(1);const input=page.getByRole('combobox').first();await input.fill('Kaki');await expect(page.getByRole('option').first()).toBeVisible();await input.press('ArrowDown');await input.press('Enter');await expect(page).toHaveURL(/andhra-pradesh\/kakinada\//);await expect(page.getByRole('heading',{name:'Post office information'})).toBeVisible();await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(2);});
test('PIN lookup, copy, page metadata, district filter and missing routes',async({page,context,browserName})=>{if(browserName==='chromium')await context.grantPermissions(['clipboard-read','clipboard-write']);await page.goto('/pincode/533001');await expect(page.locator('tbody tr')).toHaveCount(3);await page.getByRole('button',{name:'Copy PIN code 533001'}).first().click();await expect(page.getByText('Copied!',{exact:true}).first()).toBeVisible();await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/);await page.goto('/andhra-pradesh/kakinada?q=Sarp');await expect(page.locator('tbody tr')).toHaveCount(1);const response=await page.goto('/pincode/000000');expect(response?.status()).toBe(404);});
test('No viewport overflow, functioning search endpoint and sample sitemap protections',async({page,request},testInfo)=>{await page.goto('/');await page.screenshot({path:testInfo.outputPath('homepage.png'),fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();const r=await request.get('/api/search?q=533');expect(r.status()).toBe(200);expect((await r.json()).results.length).toBeGreaterThan(0);const bad=await request.get('/api/search?q='+ 'a'.repeat(81));expect(bad.status()).toBe(400);expect(await (await request.get('/robots.txt')).text()).toContain('Disallow: /');expect(await (await request.get('/sitemap-index.xml')).text()).not.toContain('<sitemap>');});

test('Area guide shows real-photo credits and distinguishes wider district context',async({page,request},testInfo)=>{
 if(process.env.PIN_QA_PHOTO_DIR)await page.route('https://thumb.wikimedia.org/**',async route=>{const url=route.request().url();const i=url.includes('Coringa_')?1:url.includes('Satellite_')?2:0;await route.fulfill({contentType:'image/jpeg',body:fs.readFileSync(path.join(process.env.PIN_QA_PHOTO_DIR!,`photo-${i}.jpg`))});});
 await page.goto('/pincode/533001');
 const area=page.getByRole('region',{name:'Discover the area'});
 await expect(area.getByRole('heading',{name:'What makes this area special'})).toBeVisible();
 await expect(area.locator('figure')).toHaveCount(3);
 await area.scrollIntoViewIfNeeded();
 if(process.env.PIN_QA_PHOTO_DIR)await expect.poll(()=>area.locator('img').evaluateAll(nodes=>nodes.every(n=>(n as HTMLImageElement).naturalWidth>0))).toBe(true);
 await area.screenshot({path:testInfo.outputPath('area-profile.png')});
 await expect(area.getByText('Adityamadhav83 / Wikimedia Commons')).toBeVisible();
 await area.getByLabel('Choose a post office / area').selectOption({label:'Jagannaickpur S.O · 533001'});
 await expect(area.getByText('Wider district context',{exact:true})).toBeVisible();
 await expect(area.getByText(/may be outside this post office/)).toBeVisible();
 expect((await request.get('/api/area?office=invalid')).status()).toBe(400);
 expect((await request.get('/api/area?office=000000000000')).status()).toBe(404);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
