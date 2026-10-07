#!/usr/bin/env python3
"""Builds the static site from content/*.html partials.

Each file in content/ starts with a small front-matter block:

    <!--
    title: Page title
    description: Meta description
    out: about.html
    nav: about
    -->

followed by the page body. The shared header, footer and <head> are added here,
so edit them once in this file and run:  python3 build.py
"""
import hashlib
import pathlib
import re

ROOT = pathlib.Path(__file__).parent
CONTENT = ROOT / "content"
# Short fingerprint of the CSS + JS, added to their URLs so browsers fetch fresh copies after each change
ASSET_V = hashlib.md5(b"".join((ROOT / f).read_bytes() for f in ("assets/css/style.css", "assets/js/main.js"))).hexdigest()[:8]

SITE = {
    "name": "Jitendra Khimlani",
    # Public address of the site, used for canonical URLs, social previews and the sitemap
    "url": "https://jitendrakhimlani.com",
    # WhatsApp / registration number used across jitendrakhimlani.com
    "phone_display": "+91 97246 23424",
    "phone": "+919724623424",
    "whatsapp": "919724623424",
    # Second helpline from the September 2026 Happiness Program poster
    "helpline_display": "+91 99985 69377",
    "helpline": "+919998569377",
    "instagram": "https://www.instagram.com/jitubhaiyajgd/",
    "facebook": "https://www.facebook.com/jitubhaiyajgd",
    "x": "https://x.com/jitubhaiyajgd",
    "linkedin": "https://www.linkedin.com/in/jitendra-khimlani-8682a3185/",
    # Google Business Profile. Replace with the exact reviews link from his
    # Google Business dashboard (e.g. a https://g.page/r/.../review or maps link) when available.
    "google_reviews": "https://www.google.com/maps/search/?api=1&query=Jitendra+Khimlani+Psychological+Counselling+Therapist+and+NLP+Trainer+Vadodara",
}


def wa(text):
    """WhatsApp link with a pre-filled message, like the old site's program buttons."""
    from urllib.parse import quote
    return "https://wa.me/" + SITE["whatsapp"] + "?text=" + quote(text)


def image_url(path, base):
    """{{img:name}} -> assets/img/name.jpg, {{img:real/name}}, {{img:logos/name.png}}."""
    rel = path if "." in path.rsplit("/", 1)[-1] else path + ".jpg"
    if not (ROOT / "assets/img" / rel).exists():
        raise SystemExit(f"missing image: assets/img/{rel}")
    return f"{base}assets/img/{rel}"


NAV = [
    ("home", "index.html", "Home"),
    ("about", "about.html", "About"),
    ("programs", "programs.html", "Programs"),
    ("seva", "seva.html", "Seva"),
    ("gallery", "gallery.html", "Gallery"),
    ("blog", "blog.html", "Journal"),
]

ICONS = {
    "facebook": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 8V6.2c0-.8.2-1.2 1.4-1.2H17V2h-2.6C11.3 2 10 3.5 10 6v2H8v3h2v11h4V11h2.7l.3-3h-3z"/></svg>',
    "x": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.3L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5z"/></svg>',
    "linkedin": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.6c0-1.3 0-3-1.9-3s-2.2 1.5-2.2 2.9V21H9z"/></svg>',
    "instagram": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
    "whatsapp": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1-.7-.3-1.4-.7-2-1.2-.5-.5-1-1.1-1.4-1.7-.1-.2 0-.4.1-.5l.4-.5.3-.5v-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.6.6-.9 1.4-.9 2.2.1 1 .5 1.9 1.1 2.7 1.1 1.6 2.5 2.9 4.2 3.7.5.2.9.4 1.4.5.5.2 1 .2 1.6.1.6-.1 1.2-.5 1.5-1 .2-.4.2-.8.1-1.2l-.2-.3z"/></svg>',
}


DEFAULT_OG_IMAGE = "og/og-default.jpg"
SAME_AS = ["instagram", "facebook", "x", "linkedin"]


def page_url(out):
    path = "" if out == "index.html" else out
    return SITE["url"].rstrip("/") + "/" + path


def seo_title(title):
    """Keep titles near Google's ~60-character display limit by dropping the name suffix on long ones."""
    suffix = " — Jitendra Khimlani"
    if len(title) > 65 and title.endswith(suffix):
        return title[: -len(suffix)]
    return title


def person_schema():
    return {
        "@type": "Person",
        "@id": SITE["url"] + "/#person",
        "name": "Jitendra Khimlani",
        "alternateName": "Jitu Bhaiya",
        "url": SITE["url"] + "/",
        "image": SITE["url"] + "/assets/img/real/jitu-with-gurudev.jpg",
        "jobTitle": ["Senior Art of Living Faculty", "Motivational Speaker", "NLP Trainer",
                     "Bach Remedy Therapist", "Intuition Trainer", "Life Transformation Coach"],
        "description": "Senior Art of Living faculty, motivational speaker, NLP trainer, Bach remedy therapist and life transformation coach from Vadodara whose workshops have reached over 2,00,000 people.",
        "address": {"@type": "PostalAddress", "addressLocality": "Vadodara", "addressRegion": "Gujarat", "addressCountry": "IN"},
        "telephone": SITE["phone"],
        "knowsAbout": ["Sudarshan Kriya", "Meditation", "Happiness Program", "NLP", "Bach flower therapy",
                       "Intuition Process", "Stress management", "Life coaching"],
        "sameAs": [SITE[k] for k in SAME_AS],
    }


def json_ld(meta, out, title, description, image, body):
    import json
    url = page_url(out)
    graph = []
    if out == "index.html":
        graph.append(person_schema())
        graph.append({"@type": "WebSite", "@id": SITE["url"] + "/#website", "url": SITE["url"] + "/",
                      "name": "Jitendra Khimlani", "inLanguage": "en-IN", "publisher": {"@id": SITE["url"] + "/#person"}})
    else:
        crumbs = [("Home", SITE["url"] + "/")]
        if out.startswith("blog/"):
            crumbs.append(("Journal", page_url("blog.html")))
        crumbs.append((meta.get("crumb") or re.sub(r"\s+—.*$", "", title), url))
        graph.append({"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "name": n, "item": u} for i, (n, u) in enumerate(crumbs)]})
    if out.startswith("blog/"):
        graph.append({"@type": "BlogPosting", "headline": re.sub(r"\s+—.*$", "", title), "description": description,
                      "image": image, "url": url, "mainEntityOfPage": url, "inLanguage": "en-IN",
                      "author": {"@type": "Person", "name": "Jitendra Khimlani", "url": SITE["url"] + "/"},
                      "publisher": {"@type": "Person", "name": "Jitendra Khimlani", "url": SITE["url"] + "/"}})
    faqs = re.findall(r"<details>\s*<summary>(.*?)</summary>\s*<p>(.*?)</p>", body, re.S)
    if faqs:
        clean = lambda t: re.sub(r"<[^>]+>", "", t).strip()
        graph.append({"@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": clean(q), "acceptedAnswer": {"@type": "Answer", "text": clean(a)}} for q, a in faqs]})
    if out == "about.html":
        graph.append(dict(person_schema(), **{"@type": "Person"}))
    data = {"@context": "https://schema.org", "@graph": graph}
    return '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False) + "</script>"


def head(meta, out, depth, body):
    base = "../" * depth
    title = seo_title(meta["title"])
    description = meta["description"]
    url = page_url(out)
    img = meta.get("image")
    if not img:
        m = re.search(r'class="article-cover[^"]*"><img src="(?:\.\./)*assets/img/([^"]+)"', body)
        img = m.group(1) if m else DEFAULT_OG_IMAGE
    image = SITE["url"] + "/assets/img/" + img
    og_type = "article" if out.startswith("blog/") else "website"
    robots = meta.get("robots", "index, follow, max-image-preview:large")
    return f"""<!doctype html>
<html lang="en-IN" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{description}">
<meta name="robots" content="{robots}">
<meta name="author" content="Jitendra Khimlani">
<link rel="canonical" href="{url}">
<meta name="theme-color" content="#0b0a08">
<meta property="og:site_name" content="Jitendra Khimlani">
<meta property="og:locale" content="en_IN">
<meta property="og:type" content="{og_type}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{image}">
<meta property="og:image:alt" content="{meta.get('image_alt', 'Jitendra Khimlani (Jitu Bhaiya)')}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@jitubhaiyajgd">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{description}">
<meta name="twitter:image" content="{image}">
<link rel="icon" href="{base}assets/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="{base}assets/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{base}assets/css/style.css?v={ASSET_V}">
{json_ld(meta, out, meta["title"], description, image, body)}
</head>
<body>
"""


def write_sitemap(outs):
    import datetime
    today = datetime.date.today().isoformat()
    def prio(o):
        return "1.0" if o == "index.html" else ("0.6" if o.startswith("blog/") else "0.8")
    urls = "\n".join(f"  <url><loc>{page_url(o)}</loc><lastmod>{today}</lastmod><priority>{prio(o)}</priority></url>" for o in sorted(outs))
    (ROOT / "sitemap.xml").write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}\n</urlset>\n', encoding="utf-8")
    (ROOT / "robots.txt").write_text(f"User-agent: *\nAllow: /\n\nSitemap: {SITE['url'].rstrip('/')}/sitemap.xml\n", encoding="utf-8")
    print("built sitemap.xml, robots.txt")


def header(active, depth):
    base = "../" * depth
    links = "\n".join(
        '      <a href="{}{}"{}>{}</a>'.format(base, href, ' class="active"' if key == active else "", label)
        for key, href, label in NAV
    )
    return f"""<header class="site-header">
  <div class="wrap">
    <a class="brand" href="{base}index.html" aria-label="Jitendra Khimlani — home">
      <span class="brand-mark"><span>JK</span></span>
      <span class="brand-name">Jitendra Khimlani<small>Jitu Bhaiya</small></span>
    </a>
    <nav class="nav" aria-label="Main">
{links}
      <a class="btn" href="{base}contact.html">Connect <span class="arrow">→</span></a>
    </nav>
    <button class="menu-toggle" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>
  </div>
</header>
"""


def footer(depth):
    base = "../" * depth
    s = SITE
    return f"""<footer class="site-footer">
  <div class="wrap">
    <div class="footer-top">
      <div>
        <a class="brand" href="{base}index.html">
          <span class="brand-mark"><span>JK</span></span>
          <span class="brand-name">Jitendra Khimlani<small>Jitu Bhaiya</small></span>
        </a>
        <p>Senior Art of Living faculty, motivational speaker, NLP trainer, Bach remedy therapist and life transformation coach — helping souls reach their fullest potential.</p>
        <div class="socials">
          <a href="{s['instagram']}" target="_blank" rel="noopener" aria-label="Instagram">{ICONS['instagram']}</a>
          <a href="{s['facebook']}" target="_blank" rel="noopener" aria-label="Facebook">{ICONS['facebook']}</a>
          <a href="{s['x']}" target="_blank" rel="noopener" aria-label="X">{ICONS['x']}</a>
          <a href="{s['linkedin']}" target="_blank" rel="noopener" aria-label="LinkedIn">{ICONS['linkedin']}</a>
        </div>
      </div>
      <div class="footer-col">
        <h5>Explore</h5>
        <ul>
          <li><a href="{base}about.html">About Jitu Bhaiya</a></li>
          <li><a href="{base}programs.html">Programs</a></li>
          <li><a href="{base}seva.html">Seva &amp; Impact</a></li>
          <li><a href="{base}gallery.html">Gallery</a></li>
          <li><a href="{base}blog.html">Journal</a></li>
          <li><a href="{base}contact.html">Contact</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h5>Programs</h5>
        <ul>
          <li><a href="{base}programs.html#happiness">Happiness Program</a></li>
          <li><a href="{base}programs.html#sahaj">Sahaj Samadhi Meditation</a></li>
          <li><a href="{base}programs.html#youth">Youth Happiness Program</a></li>
          <li><a href="{base}programs.html#intuition">Intuition Process</a></li>
          <li><a href="{base}programs.html#corporate">Corporate Program</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h5>Get in touch</h5>
        <ul>
          <li><a href="https://wa.me/{s['whatsapp']}" target="_blank" rel="noopener">WhatsApp {s['phone_display']}</a></li>
          <li><a href="tel:{s['helpline']}">Helpline {s['helpline_display']}</a></li>
          <li><a href="{s['instagram']}" target="_blank" rel="noopener">@jitubhaiyajgd</a></li>
          <li><a href="{base}contact.html">Vadodara, Gujarat</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© <span data-year>2026</span> Jitendra Khimlani. All rights reserved.</span>
      <span>Breathe · Meditate · Live</span>
    </div>
  </div>
</footer>
<a class="float-cta" href="https://wa.me/{s['whatsapp']}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">{ICONS['whatsapp']}</a>
<script src="{base}assets/js/main.js?v={ASSET_V}"></script>
</body>
</html>
"""


def parse(path):
    text = path.read_text(encoding="utf-8")
    m = re.match(r"\s*<!--(.*?)-->\s*", text, re.S)
    meta = {}
    for line in m.group(1).strip().splitlines():
        k, _, v = line.partition(":")
        meta[k.strip()] = v.strip()
    return meta, text[m.end():]


def main():
    outs = []
    for path in sorted(CONTENT.rglob("*.html")):
        meta, body = parse(path)
        out = meta["out"]
        depth = out.count("/")
        base = "../" * depth
        body = body.replace("{{base}}", base)
        for k, v in SITE.items():
            body = body.replace("{{" + k + "}}", v)
        body = re.sub(r"\{\{img:([\w./-]+)\}\}", lambda m: image_url(m.group(1), base), body)
        body = re.sub(r"\{\{wa:([^}]+)\}\}", lambda m: wa(m.group(1)), body)
        leftover = re.findall(r"\{\{[^}]+\}\}", body)
        if leftover:
            raise SystemExit(f"{path}: unknown placeholders {leftover}")
        html = head(meta, out, depth, body) + header(meta.get("nav", ""), depth) + "<main>\n" + body + "</main>\n" + footer(depth)
        dest = ROOT / out
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(html, encoding="utf-8")
        outs.append(out)
        print("built", out)
    write_sitemap(outs)


if __name__ == "__main__":
    main()
