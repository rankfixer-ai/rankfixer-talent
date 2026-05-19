# scrapers/jobstreet_scraper.py
import sys
import json
import hashlib
import asyncio
from datetime import datetime, timezone
from playwright.async_api import async_playwright

BASE_URL = "https://ph.jobstreet.com/{keyword}-jobs"
JOB_CARD_SELECTOR = '[data-automation="normalJob"]'
TITLE_SELECTOR = '[data-automation="jobTitle"]'
COMPANY_SELECTOR = '[data-automation="jobCompany"]'
LOCATION_SELECTOR = '[data-automation="jobLocation"]'

async def scrape_page(page, keyword, page_num=1):
    url = BASE_URL.format(keyword=keyword.replace(" ", "-").lower())
    if page_num > 1:
        url += f"?page={page_num}"
    print(f"Opening {url}")
    
    await page.goto(url, wait_until="networkidle", timeout=60000)
    await page.wait_for_timeout(3000)
    
    cards = await page.query_selector_all(JOB_CARD_SELECTOR)
    print(f"  Found {len(cards)} jobs on page {page_num}")
    
    jobs = []
    for card in cards:
        try:
            title_el = await card.query_selector(TITLE_SELECTOR)
            company_el = await card.query_selector(COMPANY_SELECTOR)
            location_el = await card.query_selector(LOCATION_SELECTOR)
            link_el = await card.query_selector("a")
            
            title = (await title_el.inner_text()).strip() if title_el else ""
            company = (await company_el.inner_text()).strip() if company_el else ""
            location = (await location_el.inner_text()).strip() if location_el else ""
            href = await link_el.get_attribute("href") if link_el else ""
            
            source_job_id = hashlib.sha256(href.encode()).hexdigest()[:16] if href else hashlib.sha256(title.encode()).hexdigest()[:16]
            
            jobs.append({
                "title": title,
                "company": company,
                "location": location,
                "job_url": "https://ph.jobstreet.com" + href if href.startswith("/") else href,
                "job_id": source_job_id,
                "source_name": "JobStreet",
                "posted_at": datetime.now(timezone.utc).isoformat(),
            })
        except Exception:
            continue
    
    return jobs

async def run(keyword="it", pages=1):
    all_jobs = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        )
        
        for pg in range(1, pages + 1):
            page = await context.new_page()
            jobs = await scrape_page(page, keyword, pg)
            all_jobs.extend(jobs)
            await page.close()
        
        await browser.close()
    
    print("JOBSTREET_RESULT:" + json.dumps(all_jobs, ensure_ascii=False))

if __name__ == "__main__":
    keyword = sys.argv[1] if len(sys.argv) > 1 else "it"
    pages = int(sys.argv[2]) if len(sys.argv) > 2 else 1
    asyncio.run(run(keyword, pages))
