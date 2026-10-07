# Jitendra Khimlani — Website Redesign

A luxury redesign of [jitendrakhimlani.com](https://jitendrakhimlani.com/): black, ivory and champagne-gold, Cormorant Garamond + Manrope type, with layouts for both desktop and phone.

It's a plain static site (HTML/CSS/JS), so it can be hosted for free on GitHub Pages, Netlify, Vercel or Cloudflare Pages, or uploaded to any web host. It doesn't need WordPress or a database.

## Content

The text, numbers, testimonials, photos, programs, prices, press links and seva stories all come from the current WordPress site. The only additions are the atmospheric images (stage, marble, still lifes) generated with Higgsfield.

| Page | File | What's on it |
|---|---|---|
| Home | `index.html` | Bio, real stats (200K+ / 100+ / 247+ / 500+), programs, "Acknowledged by" photo strip, client logos, real testimonials, Mitra Gadhvi video, seva highlights, press logos |
| About | `about.html` | Story, expertise, Colors of Life, timeline, full press list |
| Programs | `programs.html` | Happiness Program (with FAQs and videos), Online Workshop, Sahaj Samadhi, Youth Happiness, Intuition Process (with age tiers and prices), Utkarsha & Medha Yoga, Corporate, Stress Free Teaching, Volunteer Training, personal sessions |
| Seva | `seva.html` | #SevaTrend, Khushiyo Ka Tohfa, shoes, chhas, Share It Dil Se, floods and more |
| Journal | `blog.html` + `blog/*.html` | 10 seva stories from the old site, plus 6 "Wisdom" articles |
| Contact | `contact.html` | The form opens WhatsApp (+91 97246 23424) with the message already filled in |

Every "Inquire / Register" button opens WhatsApp with a message already filled in, the same way the old site's buttons did.

## Editing

The top-level `.html` files are **generated**. Edit these sources instead:

- `content/*.html`: page content (`{{img:real/name}}` inserts an image, `{{wa:message}}` inserts a WhatsApp link)
- `build.py`: the shared header, footer and `<head>`, plus phone numbers and social links
- `assets/css/style.css`: all styling
- `assets/js/main.js`: menu, animations, counters, testimonial slider, videos, forms

Then rebuild:

```bash
python3 build.py
```

The build stops with an error if a page references an image that doesn't exist.

## Images

- `assets/img/real/`: photos from the current site, resized and compressed
- `assets/img/logos/`: client, press and media logos
- `assets/img/*.jpg`: Higgsfield-generated backgrounds

## Before going live: checklist

- [ ] The 6 **"Wisdom" articles** (Sudarshan Kriya, Sahaj Samadhi, 5 Daily Rituals, What We Give, Bach Flower, NLP) are **new drafts written for this redesign**, not from the old site. Jitu Bhaiya should read and approve them, or they should be removed.
- [ ] Confirm the second helpline number (+91 99985 69377). It comes from the September 2026 Happiness Program poster.
- [ ] The "Join an upcoming course" sections point to WhatsApp because the 10–13 September 2026 batch has already passed. Add the next dates when they're known.
- [ ] The "Personal sessions" section (Bach flower therapy, aromatherapy, NLP coaching) is written from his bio and testimonials. Check the wording.
- [ ] The photos in "Acknowledged by renowned personalities" use generic alt text. Add the guests' names if you'd like them shown.
