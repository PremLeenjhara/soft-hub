#!/usr/bin/env python3
"""
SoftHub - Gemini AI Tool Curator
Automatically discovers new trending digital tools, formats their metadata,
and updates both data/tools.json and js/data.js.
"""

import json
import os
import re
import sys
import urllib.parse
import urllib.request
import urllib.error

# Ensure UTF-8 output
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_FILE = os.path.join(ROOT_DIR, "data", "tools.json")
JS_DATA_FILE = os.path.join(ROOT_DIR, "js", "data.js")

CATEGORIES = [
    "AI Tools", "Video & Streaming", "Social Media", "Graphic Design",
    "Productivity", "Music & Audio", "Communication", "Business Tools",
    "Developer Tools", "Cloud Storage", "Entertainment", "Education"
]

FALLBACK_TRENDING_POOL = [
    {
        "name": "Cursor",
        "url": "https://www.cursor.com",
        "category": "Developer Tools",
        "description": "AI-first code editor built for lightning-fast pair programming and codebase querying.",
        "features": ["Full Codebase Context AI", "Inline Multi-line Edits", "Terminal Command Generator", "VS Code Extension Compatible"],
        "tags": ["ai", "coding", "editor", "developer", "ide"],
        "color": "#000000"
    },
    {
        "name": "Linear",
        "url": "https://linear.app",
        "category": "Productivity",
        "description": "Purpose-built modern tool for high-performance software teams, sprints, and issue tracking.",
        "features": ["Real-time Fast Synchronization", "Keyboard-First Navigation", "Cycles and Roadmaps", "Git Integrations"],
        "tags": ["project-management", "issues", "sprints", "engineering"],
        "color": "#5E6AD2"
    },
    {
        "name": "ElevenLabs",
        "url": "https://elevenlabs.io",
        "category": "AI Tools",
        "description": "Industry-leading generative voice AI and speech synthesis platform in hundreds of languages.",
        "features": ["Hyper-Realistic Voice Cloning", "Text-to-Speech in 29+ Languages", "Dubbing & Audio Translation", "Sound Effects Generator"],
        "tags": ["ai", "voice", "audio", "tts", "speech"],
        "color": "#000000"
    },
    {
        "name": "Supabase",
        "url": "https://supabase.com",
        "category": "Developer Tools",
        "description": "Open source Firebase alternative: Postgres database, Auth, Instant APIs, Realtime, and Storage.",
        "features": ["Full Postgres SQL Database", "Row Level Security & Auth", "Realtime Subscriptions", "Auto-Generated REST APIs"],
        "tags": ["database", "postgres", "backend", "auth", "developer"],
        "color": "#3ECF8E"
    },
    {
        "name": "Midjourney",
        "url": "https://www.midjourney.com",
        "category": "Graphic Design",
        "description": "Artistic generative visual AI exploring new mediums of thought and photorealistic imagery.",
        "features": ["Photorealistic Image Generation", "Style Reference & Tuning", "Web Editor & Canvas Inpainting", "High Dynamic Range"],
        "tags": ["ai", "art", "image-generation", "creative", "design"],
        "color": "#1E293B"
    },
    {
        "name": "Raycast",
        "url": "https://www.raycast.com",
        "category": "Productivity",
        "description": "Blazingly fast, extensible launcher for controlling tools, clipboard history, and AI shortcuts.",
        "features": ["Instant Keyboard Launcher", "Custom AI Models", "Clipboard History & Snippets", "Thousands of Extensions"],
        "tags": ["launcher", "shortcuts", "productivity", "mac", "workflow"],
        "color": "#FF6363"
    },
    {
        "name": "Duolingo",
        "url": "https://www.duolingo.com",
        "category": "Education",
        "description": "The world’s most popular language-learning platform with gamified bite-sized lessons.",
        "features": ["40+ Language Courses", "Bite-Sized Gamified Lessons", "Leaderboard Competition", "Duolingo Max AI Roleplay"],
        "tags": ["languages", "learning", "education", "gamified"],
        "color": "#58CC02"
    }
]

def load_existing_tools():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_tools(tools):
    # 1. Update data/tools.json
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(tools, f, indent=2, ensure_ascii=False)
    print(f"[✓] Successfully updated {DATA_FILE} (Total: {len(tools)} tools)")

    # 2. Sync js/data.js
    js_content = "/**\n * SoftHub - Embedded Global Seed Dataset\n * Automatically updated by Gemini AI Tool Curator\n */\nwindow.SEED_TOOLS = " + json.dumps(tools, indent=2, ensure_ascii=False) + ";\n"
    with open(JS_DATA_FILE, "w", encoding="utf-8") as f:
        f.write(js_content)
    print(f"[✓] Successfully updated {JS_DATA_FILE}")

def query_gemini_for_tools(api_key, existing_names):
    models = ["gemini-3.8-flash", "gemini-3.5-flash", "gemini-flash-latest"]
    prompt = f"""
You are the Software Catalog Curator for SoftHub, a modern platform directory.
Existing platforms already in our directory: {', '.join(sorted(list(existing_names))[:40])}

Discover 2 popular or rapidly trending digital tools/websites that are NOT currently in our list.
Choose from these exact categories: {', '.join(CATEGORIES)}.

Return ONLY valid JSON matching this exact array format, with no markdown code fences:
[
  {{
    "name": "Tool Name",
    "url": "https://official-domain.com",
    "category": "One of the allowed categories",
    "description": "One sentence summary under 140 chars.",
    "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
    "tags": ["tag1", "tag2", "tag3"],
    "color": "#HEX_BRAND_COLOR"
  }}
]
"""
    body = json.dumps({"contents": [{"parts": [{"text": prompt}]}]}).encode("utf-8")

    for model in models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"}, method="POST")
        try:
            print(f"[*] Querying Gemini API with model: {model} ...")
            with urllib.request.urlopen(req, timeout=12) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                # Clean any markdown fences if present
                clean_json = re.sub(r"^```json\s*", "", text)
                clean_json = re.sub(r"^```\s*", "", clean_json)
                clean_json = re.sub(r"\s*```$", "", clean_json).strip()
                parsed = json.loads(clean_json)
                if isinstance(parsed, list) and len(parsed) > 0:
                    print(f"[✓] Gemini returned {len(parsed)} candidate tools!")
                    return parsed
        except Exception as e:
            print(f"[!] Model {model} error: {e}")

    return None

def main():
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    tools = load_existing_tools()
    existing_names = set(t["name"].lower() for t in tools)
    existing_urls = set(t["url"].lower().rstrip("/") for t in tools)

    discovered = None
    if api_key:
        discovered = query_gemini_for_tools(api_key, existing_names)
    else:
        print("[!] Note: GEMINI_API_KEY not set in environment. Checking fallback trending pool.")

    if not discovered:
        print("[*] Using curated fallback trending pool...")
        discovered = [t for t in FALLBACK_TRENDING_POOL if t["name"].lower() not in existing_names]

    added = []
    for item in discovered[:2]:
        name = item.get("name")
        url = item.get("url", "").rstrip("/")
        if not name or not url:
            continue
        if name.lower() in existing_names or url.lower() in existing_urls:
            continue

        domain = url.replace("https://", "").replace("http://", "").split("/")[0].replace("www.", "")
        icon_url = f"https://www.google.com/s2/favicons?domain={domain}&sz=128"

        new_tool = {
            "id": name.lower().replace(" ", "").replace("-", "") + "_" + os.urandom(2).hex(),
            "name": name,
            "slug": name.lower().replace(" ", "-"),
            "category": item.get("category", "Productivity"),
            "description": item.get("description", f"{name} is an online web tool."),
            "longDescription": f"{name} is an online platform operating at {url}. Curated automatically by SoftHub Gemini Discovery Engine.",
            "url": url,
            "color": item.get("color", "#3B82F6"),
            "icon": f'<img src="{icon_url}" alt="{name} logo" class="w-full h-full object-contain rounded-lg p-1"/>',
            "features": item.get("features", ["Official Web Application", "Cloud Synced"]),
            "tags": item.get("tags", [name.lower(), "online-tool"]),
            "isPopular": False,
            "isFeatured": False,
            "rating": 4.8,
            "views": 150,
            "createdAt": "2026-11-22"
        }

        tools.append(new_tool)
        existing_names.add(name.lower())
        existing_urls.add(url.lower())
        added.append(name)
        print(f"[+] Added new tool: '{name}' ({new_tool['category']})")

    if added:
        save_tools(tools)
        print(f"[✓] Automation complete: {len(added)} new software tools added: {', '.join(added)}")
    else:
        print("[=] All candidate tools are already present in SoftHub. No changes needed.")

if __name__ == "__main__":
    main()
