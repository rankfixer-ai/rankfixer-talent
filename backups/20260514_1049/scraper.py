# scrapers/scraper.py — OnlineJobs.ph Scraper (Playwright Edition)
import json, os, re, sys, time
from playwright.sync_api import sync_playwright

BASE_URL = "https://www.onlinejobs.ph"
KEYWORD = sys.argv[1] if len(sys.argv) > 1 else "Virtual Assistant"
MAX_PAGES = int(sys.argv[2]) if len(sys.argv) > 2 else 3
WORKERS = 4

def clean(text):
    if not text:
        return ""
    # Collapse whitespace but preserve newlines
    text = text.replace("\t", " ")
    # Remove excessive newlines but keep paragraph breaks
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r' {2,}', ' ', text)
    return text.strip()

def clean_title(text):
    first_line = text.split("\n")[0].strip()
    # Stop at "Posted on"
    posted_idx = first_line.find("Posted on")
    if posted_idx > 0:
        first_line = first_line[:posted_idx].strip()
    # Remove trailing employment types and employer names
    for suffix in [" Full Time", " Part Time", " Any", " Gig"]:
        if suffix in first_line:
            idx = first_line.rfind(suffix)
            first_line = first_line[:idx].strip()
            break
    first_line = first_line.replace("\u2022", "").replace("•", "").strip()
    if first_line and len(first_line) > 3:
        return first_line[:120]
    return ""

def extract_job_id(href):
    match = re.search(r'/job/([^/]+)-(\d+)$', href)
    return match.group(2) if match else None

def extract_salary(text):
    patterns = [
        # Ranges with dollar sign: "$800 - $1100 USD" or "$26–$35/hr"
        (r'\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*[-–to]+\s*\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)', 'USD'),
        # Ranges with peso sign: "₱15,000 – ₱32,000"
        (r'₱(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*[-–to]+\s*₱?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)', 'PHP'),
        # Dollar single values: "$500/month" or "$8/hour"
        (r'\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:USD|per\s*month|/month|/mo|/hr|/hour|a month|a year)', 'USD'),
        # Peso single values: "₱28,000"
        (r'₱(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)', 'PHP'),
        # "Up to 150,000 php" or "depends on your exp"
        (r'(?:up to|starting at|from)\s*\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)', 'USD'),
        (r'(?:up to|starting at|from)\s*₱?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)', 'PHP'),
    ]
    for pattern, currency in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            groups = match.groups()
            if len(groups) == 2 and groups[1]:
                mn, mx = parse_num(groups[0]), parse_num(groups[1])
                if mn is not None and mx is not None and mn > mx:
                    mn, mx = mx, mn
                return {"min": mn, "max": mx, "currency": currency}
            elif groups[0]:
                val = parse_num(groups[0])
                return {"min": None, "max": val, "currency": currency}
    return {"min": None, "max": None, "currency": "UNKNOWN"}

def parse_num(s):
    try: return int(s.replace(",", ""))
    except: return None

def parse_salary(raw):
    return raw if isinstance(raw, dict) else extract_salary(str(raw))

def scrape_detail(page, job):
    try:
        page.goto(job["job_url"], timeout=15000)
        page.wait_for_load_state("domcontentloaded")
        page.wait_for_timeout(1000)
        selectors = [
            ".job-overview", ".overview", ".job-description", 
            ".desc", "#job-description", "[class*='description']",
            "[class*='job-overview']", "article", ".post-body",
            ".job-body", ".job-details"
        ]
        description = ""
        for sel in selectors:
            desc_el = page.query_selector(sel)
            if desc_el:
                text = clean(desc_el.inner_text())
                if len(text) > 100:
                    description = text
                    break
        # Preserve paragraph breaks
        description = re.sub(r'\n{3,}', '\n\n', description)  # Collapse 3+ newlines to 2
        description = description.strip()
        job["description"] = description[:2500] if description else ""
    except Exception as e:
        job["description"] = ""
    return job

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        script_dir = os.path.dirname(os.path.abspath(__file__))
        auth_path = os.path.join(script_dir, "auth.json")
        context = browser.new_context(storage_state=auth_path)
        list_page = context.new_page()
        workers = [context.new_page() for _ in range(WORKERS)]
        all_jobs = []
        seen_ids = set()

        for page_num in range(MAX_PAGES):
            offset = page_num * 30
            url = BASE_URL + "/jobseekers/jobsearch/" + str(offset) + "?jobkeyword=" + KEYWORD + "&fullTime=on&partTime=on&Freelance=on"
            list_page.goto(url)
            if "login" in list_page.url:
                print("SESSION_EXPIRED")
                return
            try:
                list_page.wait_for_selector("div.jobpost-cat-box", timeout=10000)
            except:
                break

            cards = list_page.query_selector_all("div.jobpost-cat-box")
            jobs_batch = []
            for card in cards:
                try:
                    link = card.query_selector("a[href*='/job/']")
                    if not link: continue
                    href = link.get_attribute("href")
                    job_id = extract_job_id(href)
                    if not job_id or job_id in seen_ids: continue
                    seen_ids.add(job_id)
                    text = clean(card.inner_text())
                    title = clean_title(text)

                    # Extract employer: find what's between title+type and "Posted on"
                    employer = ""
                    posted_pos = text.find("Posted on")
                    if posted_pos > 0 and title:
                        # Find the title in the text
                        title_pos = text.find(title)
                        if title_pos >= 0:
                            after_title = text[title_pos + len(title):posted_pos].strip()
                            # Remove employment type keywords
                            for w in ["Full Time", "Part Time", "Any", "Gig"]:
                                after_title = after_title.replace(w, "")
                            after_title = after_title.strip().rstrip("•").strip()

                            after_title = after_title.strip()
                            if after_title and len(after_title) > 1 and len(after_title) < 50:
                                employer = after_title

                    salary_raw = extract_salary(text)
                    jobs_batch.append({
                        "job_id": job_id, "title": title,
                        "company": employer, "job_url": BASE_URL + href,
                        "salary_raw": salary_raw
                    })
                except: continue

            for i in range(0, len(jobs_batch), WORKERS):
                chunk = jobs_batch[i:i + WORKERS]
                for worker, job in zip(workers, chunk):
                    all_jobs.append(scrape_detail(worker, job))
                time.sleep(0.5)

        browser.close()
        cleaned = []
        for job in all_jobs:
            cleaned.append({
                "title": job["title"],
                "company": job.get("company", ""),
                "job_url": job["job_url"],
                "job_id": job["job_id"],
                "description": job.get("description", ""),
                "salary": parse_salary(job.get("salary_raw", ""))
            })
        print("ONLINEJOBS_RESULT:" + json.dumps(cleaned, ensure_ascii=False))

if __name__ == "__main__":
    run()