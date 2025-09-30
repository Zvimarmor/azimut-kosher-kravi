#!/usr/bin/env python3
"""
Heritage Scraper - Extract content from Hebrew Wikipedia and Yizkor memorial sites
Appends structured data to heritage_import.csv with proper Hebrew encoding
"""

import argparse
import csv
import logging
import os
import re
import time
from typing import Dict, Optional
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

CSV_FILENAME = 'heritage_import.csv'
CSV_HEADERS = ['title', 'content', 'author', 'category']

def setup_session() -> requests.Session:
    """Create a requests session with retry strategy and Hebrew support"""
    session = requests.Session()
    
    # Retry strategy for 429/5xx errors
    retry_strategy = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["HEAD", "GET", "OPTIONS"]
    )
    
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    
    # Set headers for Hebrew content - use real browser headers
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'he,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
    })
    
    return session

def fetch_page(session: requests.Session, url: str) -> Optional[BeautifulSoup]:
    """Fetch and parse a web page with Hebrew encoding"""
    try:
        # Polite delay
        time.sleep(0.5)
        
        response = session.get(url, timeout=30)
        response.raise_for_status()
        
        # Ensure UTF-8 encoding for Hebrew content
        response.encoding = 'utf-8'
        
        # Parse with lxml for better performance
        soup = BeautifulSoup(response.content, 'lxml')
        return soup
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to fetch {url}: {e}")
        return None

def clean_text(text: str) -> str:
    """Clean and normalize Hebrew text"""
    if not text:
        return ""
    
    # Remove citation markers [1], [2], etc.
    text = re.sub(r'\[\d+\]', '', text)
    
    # Remove footnote markers and superscripts
    text = re.sub(r'\u2020|\u2021|\*+', '', text)
    
    # Remove bidi control characters
    text = re.sub(r'[\u200e\u200f\u202a-\u202e]', '', text)
    
    # Normalize whitespace and newlines - keep single spaces only
    text = re.sub(r'\s+', ' ', text)
    text = text.replace('\n', ' ').replace('\r', ' ').replace('\t', ' ')
    
    # Remove any remaining problematic CSV characters
    text = text.replace('"', "'").replace('\x00', '')
    
    return text.strip()

def scrape_wikipedia(url: str) -> Dict[str, str]:
    """Extract content from Hebrew Wikipedia article"""
    session = setup_session()
    soup = fetch_page(session, url)
    
    if not soup:
        return {}
    
    # Extract title
    title_elem = soup.find('h1', {'id': 'firstHeading'})
    title = clean_text(title_elem.get_text()) if title_elem else ""
    
    if not title:
        logger.warning(f"No title found for Wikipedia article: {url}")
        return {}
    
    # Find main content area
    content_div = soup.find('div', {'id': 'mw-content-text'})
    if not content_div:
        logger.warning(f"No content div found for: {url}")
        return {}
    
    # Remove unwanted elements
    unwanted_selectors = [
        '.navbox',           # Navigation boxes
        '.infobox',          # Info boxes
        '.thumbcaption',     # Image captions
        '.reference',        # References
        '.reflist',          # Reference lists
        '.mw-editsection',   # Edit links
        'table',             # All tables
        '.ambox',            # Article message boxes
        '.hatnote',          # Hat notes
        'sup.reference'      # Reference superscripts
    ]
    
    for selector in unwanted_selectors:
        for elem in content_div.select(selector):
            elem.decompose()
    
    # Find and remove excluded sections more accurately
    excluded_headings = ["ראו גם", "קישורים חיצוניים"]
    
    # Find all heading elements with their span elements (Wikipedia structure)
    for heading in content_div.find_all(['h2', 'h3', 'h4', 'h5', 'h6']):
        # Get heading text from span.mw-headline if present, otherwise from heading itself
        headline_span = heading.find('span', class_='mw-headline')
        heading_text = clean_text(headline_span.get_text()) if headline_span else clean_text(heading.get_text())
        
        # Check if this heading should be excluded
        if any(excluded in heading_text for excluded in excluded_headings):
            current_level = int(heading.name[1])  # h2 -> 2, h3 -> 3, etc.
            
            # Remove everything from this heading until the next heading of same/higher level
            elements_to_remove = [heading]
            current_elem = heading.next_sibling
            
            while current_elem:
                # Check if this is a heading of same or higher level
                if (current_elem.name and current_elem.name.startswith('h') and 
                    len(current_elem.name) == 2 and current_elem.name[1].isdigit()):
                    next_level = int(current_elem.name[1])
                    if next_level <= current_level:
                        break
                
                elements_to_remove.append(current_elem)
                current_elem = current_elem.next_sibling
            
            # Remove all collected elements
            for elem in elements_to_remove:
                if hasattr(elem, 'decompose'):
                    elem.decompose()
    
    # Extract all remaining text content systematically
    content_parts = []
    
    # Extract content by traversing all paragraphs and sections that remain
    # after unwanted elements have been removed
    for elem in content_div.find_all(['p', 'li', 'dd', 'dt']):
        # Skip if this element is inside an excluded section or unwanted element
        if elem.find_parent(['table', 'div'], class_=['navbox', 'infobox', 'reflist', 'ambox']):
            continue
            
        text = clean_text(elem.get_text())
        if text and len(text) > 10:
            content_parts.append(text)
    
    # Also extract text from div elements that might contain article content
    # but avoid navigation and metadata divs
    for div in content_div.find_all('div'):
        # Skip divs with classes that indicate navigation/metadata
        if div.get('class'):
            div_classes = ' '.join(div.get('class', []))
            if any(skip_class in div_classes for skip_class in ['navbox', 'infobox', 'reflist', 'ambox', 'hatnote']):
                continue
        
        # Only take direct text from divs, not from child elements we've already processed
        direct_text = clean_text(''.join([str(s) for s in div.strings if s.parent == div]))
        if direct_text and len(direct_text) > 30:
            content_parts.append(direct_text)
    
    content = ' '.join(content_parts)
    
    logger.info(f"Extracted {len(content_parts)} content parts, total length: {len(content)} characters")
    
    if not content:
        logger.warning(f"No content extracted from Wikipedia article: {url}")
        return {}
    
    return {
        'title': title,
        'content': content,
        'author': 'Wikipedia contributors',
        'category': 'PastBattles'
    }

def scrape_izkor(url: str) -> Dict[str, str]:
    """Extract life story from Yizkor memorial page"""
    session = setup_session()
    soup = fetch_page(session, url)
    
    if not soup:
        return {}
    
    # Debug: log the page content
    logger.info(f"Page title tag content: {soup.find('title').get_text() if soup.find('title') else 'No title tag'}")
    logger.info(f"First 500 chars of page: {soup.get_text()[:500]}")
    
    # Extract title (soldier's name) - try multiple selectors
    title = ""
    title_selectors = [
        'h1',
        '.soldier-name', 
        '[class*="name"]',
        'h2',
        '.title'
    ]
    
    for selector in title_selectors:
        title_elem = soup.select_one(selector)
        if title_elem:
            title = clean_text(title_elem.get_text())
            if title:
                break
    
    if not title:
        # Try to extract from page title or meta tags
        title_elem = soup.find('title')
        if title_elem:
            title = clean_text(title_elem.get_text())
            # Remove common suffixes
            title = re.sub(r'\s*-\s*(יזכור|אתר יזכור).*$', '', title)
    
    if not title:
        logger.warning(f"No name/title found for Yizkor page: {url}")
        return {}
    
    # Try to find life story content using multiple strategies
    content = ""
    
    # Strategy 1: Exact XPath equivalent using CSS selectors
    xpath_selectors = [
        'app-root div:nth-child(2) worldpresentationcomponent div:nth-child(2) div:nth-child(3) div div div:nth-child(3) div:nth-child(2) world-life-story-component div div:nth-child(2)',
        'world-life-story-component div div:nth-child(2)',
        'world-life-story-component .life-story',
        '[class*="life-story"]',
        '[class*="story"]'
    ]
    
    for selector in xpath_selectors:
        story_elem = soup.select_one(selector)
        if story_elem:
            content = clean_text(story_elem.get_text())
            if content and len(content) > 50:  # Ensure meaningful content
                break
    
    # Strategy 2: Look for Hebrew keywords if XPath approach fails
    if not content:
        hebrew_keywords = ["סיפור חייו", "סיפור החיים", "קורות חיים", "ביוגרפיה"]
        
        for keyword in hebrew_keywords:
            # Find elements containing the keyword
            for elem in soup.find_all(text=lambda text: text and keyword in text):
                parent = elem.parent
                # Look for content in nearby elements
                for sibling in parent.find_next_siblings():
                    if sibling.get_text():
                        potential_content = clean_text(sibling.get_text())
                        if len(potential_content) > 100:
                            content = potential_content
                            break
                if content:
                    break
            if content:
                break
    
    # Strategy 3: Look for substantial text blocks if specific selectors fail
    if not content:
        # Find the longest text block that might be the life story
        text_blocks = []
        for elem in soup.find_all(['p', 'div'], text=True):
            text = clean_text(elem.get_text())
            if len(text) > 100:  # Only consider substantial blocks
                text_blocks.append(text)
        
        if text_blocks:
            # Take the longest text block as likely life story
            content = max(text_blocks, key=len)
    
    if not content:
        logger.warning(f"No life story content found for Yizkor page: {url}")
        return {}
    
    return {
        'title': title,
        'content': content,
        'author': 'אתר יזכור',
        'category': 'FallenSoldiers'
    }

def write_csv_row(row_dict: Dict[str, str]) -> bool:
    """Write a single row to heritage_import.csv"""
    try:
        # Check if CSV exists and has header
        file_exists = os.path.exists(CSV_FILENAME)
        needs_header = True
        
        if file_exists:
            # Check if file has content and header
            try:
                with open(CSV_FILENAME, 'r', encoding='utf-8', newline='') as f:
                    reader = csv.reader(f)
                    first_row = next(reader, None)
                    if first_row == CSV_HEADERS:
                        needs_header = False
            except:
                needs_header = True
        
        # Write to CSV
        with open(CSV_FILENAME, 'a', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=CSV_HEADERS, quoting=csv.QUOTE_ALL)
            
            if needs_header:
                writer.writeheader()
            
            writer.writerow(row_dict)
        
        return True
        
    except Exception as e:
        logger.error(f"Failed to write CSV row: {e}")
        return False

def detect_site_type(url: str) -> Optional[str]:
    """Detect site type from URL domain"""
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        
        if 'he.wikipedia.org' in domain:
            return 'wikipedia'
        elif 'izkor.gov.il' in domain:
            return 'izkor'
        else:
            return None
    except:
        return None

def process_url(url: str) -> tuple[str, str, str]:
    """Process a single URL and return (status, category, title)"""
    site_type = detect_site_type(url)
    
    if not site_type:
        return "SKIP", "unknown_domain", url
    
    try:
        if site_type == 'wikipedia':
            data = scrape_wikipedia(url)
        elif site_type == 'izkor':
            data = scrape_izkor(url)
        else:
            return "SKIP", "unsupported_type", url
        
        if not data:
            return "SKIP", "no_data_extracted", url
        
        # Validate required fields
        if not all(data.get(field) for field in ['title', 'content', 'author', 'category']):
            missing_fields = [field for field in CSV_HEADERS if not data.get(field)]
            return "SKIP", f"missing_fields_{','.join(missing_fields)}", url
        
        # Write to CSV
        if write_csv_row(data):
            return "OK", data['category'], data['title']
        else:
            return "SKIP", "csv_write_failed", url
            
    except Exception as e:
        logger.error(f"Error processing {url}: {e}")
        return "SKIP", "processing_error", url

def main():
    """Main function to process URLs from command line"""
    parser = argparse.ArgumentParser(
        description='Scrape Hebrew Wikipedia and Yizkor memorial sites to heritage_import.csv'
    )
    parser.add_argument('urls', nargs='+', help='One or more URLs to scrape')
    
    args = parser.parse_args()
    
    print(f"Processing {len(args.urls)} URLs...")
    print("-" * 60)
    
    success_count = 0
    
    for url in args.urls:
        status, category, title = process_url(url)
        
        if status == "OK":
            success_count += 1
            print(f"OK | {category} | {title}")
        else:
            print(f"SKIP | {category} | {title}")
    
    print("-" * 60)
    print(f"Completed: {success_count}/{len(args.urls)} URLs successfully processed")
    
    if success_count > 0:
        print(f"Results appended to: {CSV_FILENAME}")

if __name__ == "__main__":
    main()

# README
"""
Heritage Scraper

A Python script to extract structured content from Hebrew Wikipedia articles and 
Yizkor memorial pages, appending the data to heritage_import.csv.

Installation:
```bash
pip install requests beautifulsoup4 lxml
```

Usage:
```bash
# Single URL
python heritage_scrape.py "https://he.wikipedia.org/wiki/מלחמת_העצמאות"

# Multiple URLs
python heritage_scrape.py \
  "https://he.wikipedia.org/wiki/מלחמת_ששת_הימים" \
  "https://www.izkor.gov.il/HallenHeroes/Details/123456" \
  "https://he.wikipedia.org/wiki/מבצע_יונתן"
```

Supported Sites:
- Hebrew Wikipedia (he.wikipedia.org) - Extracts full article content
- Yizkor Memorial (izkor.gov.il) - Extracts life story sections

Output:
Creates/appends to heritage_import.csv with columns: title, content, author, category
All content is properly UTF-8 encoded for Hebrew text.
"""