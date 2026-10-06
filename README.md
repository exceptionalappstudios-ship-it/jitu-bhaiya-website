# Jitendra Khimlani — Website Redesign

A luxury redesign of [jitendrakhimlani.com](https://jitendrakhimlani.com/): black, ivory and champagne-gold, Cormorant Garamond + Manrope type, with layouts for both desktop and phone.

It's a plain static site (HTML/CSS/JS), so it can be hosted for free on GitHub Pages, Netlify, Vercel or Cloudflare Pages, or uploaded to any web host. It doesn't need WordPress or a database.

## Pages

| Page | File |
|---|---|
| Home | `index.html` |
| About | `about.html` |
| Programs (Happiness Program, Sahaj Samadhi, Youth, Corporate, NLP, Intuition, Bach Flower) | `programs.html` |
| Seva & Impact (#SevaTrend, Khushiyon Ka Tohfa, Colors of Life, food kits) | `seva.html` |
| Journal (blog listing with category filters) | `blog.html` |
| Articles (7 posts) | `blog/*.html` |
| Contact (the form sends the message via WhatsApp) | `contact.html` |

## Editing

The top-level `.html` files are **generated**. Edit these sources instead:

- `content/*.html`: page content
- `build.py`: the shared header, footer and `<head>`, plus phone, WhatsApp, address, social links and image list
- `assets/css/style.css`: all styling
- `assets/js/main.js`: menu, animations, counters, testimonial slider, forms

Then rebuild:

```bash
python3 build.py
```

## Images

The images were generated with Higgsfield and load from the Higgsfield CDN. To keep local copies before going live (recommended):

```bash
./download-images.sh
```

This saves them to `assets/img/` and rebuilds the pages to use the local files. Converting them to `.webp` makes the pages faster (`build.py` picks up `.webp`/`.jpg` versions automatically).

## Before going live: checklist

- [ ] **Portrait photo**: add a real photo of Jitu Bhaiya as `assets/img/jitendra-portrait.jpg` (portrait, about 4:5). Until then a gold "JK" monogram is shown.
- [ ] **Testimonials** on the home page are *samples*. Replace them with real quotes from participants (search for `Sample testimonials` in `content/index.html`).
- [ ] **Contact details** in `build.py` came from public directory listings. Please confirm the phone, WhatsApp and registration numbers and the address.
- [ ] Program details (durations, age groups) are typical Art of Living formats. Adjust them as needed.
- [ ] Hook the newsletter form up to an email provider (Mailchimp, ConvertKit, etc.).
- [ ] Copy over any older blog posts from WordPress (new posts go in `content/blog/`).
