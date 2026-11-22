#!/usr/bin/env python3
"""
SoftHub - Automated Website & Tool Ingestion CLI
Automatically discovers, inspects, and appends future websites into data/tools.json.
"""

import argparse
import json
import os
import re
import sys
import urllib.parse
import urllib.request

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

DATA_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "tools.json"))

CATEGORY_KEYWORDS = {
    "AI Tools": ["ai", "gpt", "llm", "bot", "intelligence", "neural", "model", "claude", "copilot", "deep", "machine", "prompt"],
    "Video & Streaming": ["video", "stream", "movie", "tv", "watch", "broadcast", "cinema", "clip", "tube", "play"],
    "Graphic Design": ["design", "graphic", "ui", "ux", "vector", "art", "draw", "sketch", "font", "logo", "icon", "canvas", "3d"],
    "Productivity": ["productivity", "note", "task", "doc", "sheet", "calendar", "wiki", "todo", "organize", "project", "plan"],
    "Social Media": ["social", "network", "community", "feed", "post", "friends", "follow", "share", "connect", "forum"],
    "Music & Audio": ["music", "audio", "sound", "song", "listen", "podcast", "track", "radio", "beat", "voice"],
    "Communication": ["chat", "message", "call", "talk", "meet", "conference", "huddle", "discuss", "email", "inbox"],
    "Developer Tools": ["dev", "developer", "code", "git", "repo", "api", "deploy", "terminal", "host", "sdk", "database", "stack"],
    "Cloud Storage": ["cloud", "storage", "drive", "backup", "box", "sync", "file", "vault"],
    "Business Tools": ["business", "finance", "accounting", "crm", "sales", "invoice", "marketing", "analytics", "stripe"],
    "Education": ["learn", "study", "course", "academy", "degree", "teach", "school", "skill", "tutorial"],
    "Entertainment": ["game", "play", "fun", "arcade", "quiz", "comic", "anime", "esport", "steam"]
}

def infer_category(text):
    lower = text.lower()
    for cat, kws in CATEGORY_KEYWORDS.items():
        for kw in kws:
            if kw in lower:
                return cat
    return "Productivity"

def scrape_website(url):
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url

    domain = url.replace("https://", "").replace("http://", "").split("/")[0].replace("www.", "")
    derived_name = domain.split(".")[0].capitalize()

    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) SoftHub-Crawler/2.0"}
    title = derived_name
    desc = f"{derived_name} is a modern digital platform and online tool."

    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as response:
            html = response.read().decode("utf-8", errors="ignore")

        # Title
        t_match = re.search(r"<title[^>]*>(.*?)</title>", html, re.IGNORECASE | re.DOTALL)
        if t_match:
            raw_title = t_match.group(1).strip()
            title = re.sub(r"\s*[|\-–—].*$", "", raw_title).strip() or derived_name

        # Meta description
        d_match = re.search(r'<meta[^>]*name=["\']description["\'][^>]*content=["\'](.*?)["\']', html, re.IGNORECASE)
        if not d_match:
            d_match = re.search(r'<meta[^>]*property=["\']og:description["\'][^>]*content=["\'](.*?)["\']', html, re.IGNORECASE)
        if d_match:
            desc = d_match.group(1).strip()
    except Exception as e:
        print(f"[*] Note: Basic scraping timed out or blocked ({e}), proceeding with domain heuristics.")

    category = infer_category(f"{domain} {title} {desc}")
    icon_url = f"https://www.google.com/s2/favicons?domain={domain}&sz=128"

    tool_entry = {
        "id": derived_name.lower().replace(" ", "") + "_" + os.urandom(2).hex(),
        "name": title,
        "slug": derived_name.lower().replace(" ", "-"),
        "category": category,
        "description": desc,
        "longDescription": f"{title} is an online web application operating at {url}. Verified and added to SoftHub.",
        "url": url,
        "color": "#3B82F6",
        "icon": f'<img src="{icon_url}" alt="{title} logo" class="w-full h-full object-contain rounded-lg p-1"/>',
        "features": [
            "Official Cloud Portal Access",
            "Cross-Platform Browser Experience",
            "Real-Time Capabilities"
        ],
        "tags": [derived_name.lower(), category.lower().replace(" ", "-"), "online-tool"],
        "isPopular": False,
        "isFeatured": False,
        "rating": 4.8,
        "views": 100,
        "createdAt": "2026-11-22"
    }
    return tool_entry

def add_tool_to_database(tool):
    if not os.path.exists(DATA_FILE):
        data = []
    else:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)

    # Check for duplicate
    for existing in data:
        if existing.get("url") == tool["url"] or existing.get("name").lower() == tool["name"].lower():
            print(f"[!] Warning: '{tool['name']}' ({tool['url']}) is already in {DATA_FILE}")
            return False

    data.append(tool)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"[✓] Successfully ingested '{tool['name']}' into category '{tool['category']}'!")
    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SoftHub Auto-Ingestion CLI")
    parser.add_argument("--url", help="Website URL to ingest into SoftHub")
    parser.add_argument("--trending", action="store_true", help="Ingest a batch of trending platforms")

    args = parser.parse_args()

    if args.url:
        print(f"[*] Inspecting website: {args.url} ...")
        tool = scrape_website(args.url)
        add_tool_to_database(tool)
    elif args.trending:
        trending_list = [
            "https://linear.app",
            "https://perplexity.ai",
            "https://cursor.com",
            "https://supabase.com"
        ]
        for url in trending_list:
            print(f"[*] Ingesting {url} ...")
            tool = scrape_website(url)
            add_tool_to_database(tool)
    else:
        print("Usage:")
        print("  python scripts/auto_fetcher.py --url https://example.com")
        print("  python scripts/auto_fetcher.py --trending")
