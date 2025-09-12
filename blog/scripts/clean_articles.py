#!/usr/bin/env python3
import os
import re
from pathlib import Path


from typing import Optional


def extract_between(text: str, start_marker: str, end_marker: str) -> Optional[str]:
    si = text.find(start_marker)
    if si == -1:
        return None
    ei = text.find(end_marker, si)
    if ei == -1:
        return None
    return text[si:ei]


from typing import Optional, Dict


def clean_article_html(html: str) -> Optional[dict]:
    # Only process pages that look like article detail pages
    if 'class="imBlogArticle"' not in html:
        return None

    # Title
    m_title = re.search(r'<h2 class="imPgTitle"[^>]*>(.*?)</h2>', html, re.S)
    title = m_title.group(1).strip() if m_title else ''

    # Breadcrumb (author + date live here)
    m_bc = re.search(r'<div class="imBreadcrumb"[^>]*>(.*?)</div>', html, re.S)
    bc_html = m_bc.group(1) if m_bc else ''

    # Author: prefer the <strong>..</strong> inside breadcrumb
    m_author = re.search(r'<strong>(.*?)</strong>', bc_html, re.S)
    author = (m_author.group(1).strip() if m_author else '').replace('\n', ' ').strip()

    # Date: text between first and second &middot;
    m_date = re.search(r'&middot;\s*([^<&]+?)\s*&middot;', bc_html)
    date = m_date.group(1).strip() if m_date else ''

    # Body: prefer the div with id starting imBlogPost_
    body_start = html.find('<div id="imBlogPost_')
    if body_start == -1:
        # fallback: start from imBlogPostBody
        body_start = html.find('<div class="imBlogPostBody"')
        if body_start != -1:
            # advance to first closing '>'
            gt = html.find('>', body_start)
            body_start = gt + 1 if gt != -1 else body_start
    if body_start == -1:
        body_start = 0

    # Try to end before the author signature or sidebar
    end_markers = [
        '<div class="imTARight"',
        '<aside id="imBlogSidebar"',
        '<footer',
        '</main>'
    ]
    body_end = -1
    for em in end_markers:
        pos = html.find(em, body_start)
        if pos != -1 and (body_end == -1 or pos < body_end):
            body_end = pos
    if body_end == -1:
        body_end = len(html)
    body_html = html[body_start:body_end]

    return {
        'title': title,
        'author': author,
        'date': date,
        'body_html': body_html.strip()
    }


def render_minimal(doc: dict) -> str:
    title = doc['title'] or 'Articolo'
    author = doc['author'] or ''
    date = doc['date'] or ''
    body_html = doc['body_html'] or ''
    meta = ' — '.join([x for x in [author, date] if x])
    return (
        '<!DOCTYPE html>\n'
        '<html lang="it">\n'
        '<head>\n'
        '  <meta charset="utf-8">\n'
        f'  <title>{title}</title>\n'
        '  <meta name="viewport" content="width=device-width, initial-scale=1">\n'
        '  <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;max-width:820px;margin:2rem auto;padding:0 1rem;line-height:1.6}h1{line-height:1.25;margin:0 0 .25rem}p.meta{color:#555;margin:.25rem 0 1.25rem;font-size:.95rem}.content img{max-width:100%;height:auto}</style>\n'
        '</head>\n'
        '<body>\n'
        f'  <h1>{title}</h1>\n'
        f'  <p class="meta">{meta}</p>\n'
        '  <div class="content">\n'
        f'{body_html}\n'
        '  </div>\n'
        '</body>\n'
        '</html>\n'
    )


def main():
    root = Path('.')
    outdir = root / 'clean'
    outdir.mkdir(exist_ok=True)

    candidates = [p for p in root.iterdir() if p.is_file() and p.name.startswith('index.html?') and p.suffix == '.html']
    processed = 0
    skipped = 0
    for p in sorted(candidates):
        txt = p.read_text(encoding='utf-8', errors='ignore')
        doc = clean_article_html(txt)
        if not doc:
            skipped += 1
            continue
        out_html = render_minimal(doc)
        (outdir / p.name).write_text(out_html, encoding='utf-8')
        processed += 1

    print(f"Processed {processed} article pages; skipped {skipped} non-articles.")


if __name__ == '__main__':
    main()
