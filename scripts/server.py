#!/usr/bin/env python3
"""
SoftHub - Local Development Server with Metadata Ingestion API
Serves static assets and provides a lightweight proxy endpoint to scrape future websites.
"""

import http.server
import socketserver
import urllib.parse
import urllib.request
import re
import json
import os

PORT = 8000
DIRECTORY = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

class SoftHubHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/scrape":
            self.handle_scrape(parsed)
            return
        super().do_GET()

    def handle_scrape(self, parsed_url):
        params = urllib.parse.parse_qs(parsed_url.query)
        target_url = params.get("url", [None])[0]

        if not target_url:
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Missing 'url' query parameter"}).encode("utf-8"))
            return

        try:
            if not target_url.startswith("http://") and not target_url.startswith("https://"):
                target_url = "https://" + target_url

            req = urllib.request.Request(
                target_url,
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) SoftHub-Crawler/2.0"}
            )
            with urllib.request.urlopen(req, timeout=4) as response:
                html = response.read().decode("utf-8", errors="ignore")

            # Extract title
            title_match = re.search(r"<title[^>]*>(.*?)</title>", html, re.IGNORECASE | re.DOTALL)
            title = title_match.group(1).strip() if title_match else ""
            # Clean title
            title = re.sub(r"\s*[|\-–—].*$", "", title).strip()

            # Extract description
            desc_match = re.search(r'<meta[^>]*name=["\']description["\'][^>]*content=["\'](.*?)["\']', html, re.IGNORECASE)
            if not desc_match:
                desc_match = re.search(r'<meta[^>]*property=["\']og:description["\'][^>]*content=["\'](.*?)["\']', html, re.IGNORECASE)
            description = desc_match.group(1).strip() if desc_match else ""

            result = {
                "url": target_url,
                "title": title or target_url.split("//")[-1].split("/")[0],
                "description": description or f"Online platform and web service at {target_url}"
            }

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(result).encode("utf-8"))

        except Exception as e:
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            domain = target_url.replace("https://", "").replace("http://", "").split("/")[0]
            fallback = {
                "url": target_url,
                "title": domain.capitalize(),
                "description": f"Official portal for {domain}."
            }
            self.wfile.write(json.dumps(fallback).encode("utf-8"))

import sys

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), SoftHubHandler) as httpd:
        print(f"[SoftHub] Local Server running at: http://localhost:{PORT}")
        print("Press Ctrl+C to stop the server.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer shutting down.")

