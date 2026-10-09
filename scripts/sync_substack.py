#!/usr/bin/env python3
"""Sync all posts from the Substack archive API into assets/data/substack-posts.json.

Fetches the complete, paginated post archive (the RSS feed only carries recent
posts) and writes a small JSON index the website renders as an article hub.
Full article text stays on Substack; the site lists titles, dates and excerpts
that link out to Substack, so Substack counts the reads and GA4 counts the
visits and clicks on the site.

Run daily via .github/workflows/sync-substack.yml. Standard library only.
"""
import html
import json
import re
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

PUBLICATION_SUBDOMAIN = "masterdataengineering"
API_URL = (
    f"https://{PUBLICATION_SUBDOMAIN}.substack.com"
    "/api/v1/archive?sort=new&offset={offset}&limit=50"
)
SUBSTACK_HOME = f"https://{PUBLICATION_SUBDOMAIN}.substack.com"
OUT_PATH = Path(__file__).resolve().parent.parent / "assets" / "data" / "substack-posts.json"

WS_RE = re.compile(r"\s+")


def clean_text(value):
    if not value:
        return ""
    return WS_RE.sub(" ", html.unescape(value)).strip()


def excerpt_of(post):
    text = clean_text(post.get("description") or post.get("truncated_body_text") or "")
    if len(text) > 200:
        text = text[:200].rsplit(" ", 1)[0] + "…"
    return text


def fetch_page(offset):
    req = urllib.request.Request(
        API_URL.format(offset=offset),
        headers={"User-Agent": "datawithpreet.github.io substack sync"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main():
    posts = []
    offset = 0
    while True:
        page = fetch_page(offset)
        if not page:
            break
        posts.extend(page)
        # NOTE: the API may return fewer items than the requested limit even
        # when more pages exist, so only stop on an empty page.
        offset += len(page)

    items = []
    for post in posts:
        # Only list publicly readable posts.
        if post.get("audience") not in (None, "everyone"):
            continue
        url = post.get("canonical_url") or f"{SUBSTACK_HOME}/p/{post.get('slug')}"
        try:
            published = datetime.fromisoformat(post["post_date"].replace("Z", "+00:00"))
        except (KeyError, ValueError, TypeError):
            continue
        items.append(
            {
                "title": clean_text(post.get("title")),
                "url": url,
                "date": published.strftime("%Y-%m-%d"),
                "date_display": published.strftime("%b %d, %Y").replace(" 0", " "),
                "excerpt": excerpt_of(post),
            }
        )

    items.sort(key=lambda item: item["date"], reverse=True)

    payload = {
        "publication": "Healthcare for Data Engineers",
        "publication_url": SUBSTACK_HOME,
        "updated_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "count": len(items),
        "posts": items,
    }
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Wrote {len(items)} posts to {OUT_PATH}")


if __name__ == "__main__":
    main()
