# Chalmers Hockey · Sponsringssida 26/27

En modern sponsringssida för **Chalmers Blue McRangers** — Göteborgs näst äldsta ishockeyförening och svenska universitetshockeymästare 2024.

**Live:** [https://sponsra.chalmershockey.se/)

---

## Om projektet

Den här sidan är byggd för att visa potentiella sponsorer **vad de faktiskt får** för pengarna — istället för bara en PDF-broschyr. Sponsorer kan själva räkna ut priset, jämföra mot betald annonsering, se var deras logga skulle synas på matchstället, och kontakta klubben direkt via formuläret.

Sidan har två primära mål:
1. **Sänka tröskeln** för företag att kontakta oss med en konkret förfrågan
2. **Bevisa värdet** med riktig data — 2,4 miljoner organiska visningar, CPM-jämförelser mot Instagram/TikTok Ads, och exempel på vilken räckvidd vi faktiskt genererar

---

## Funktioner

### Räckvidds-bevis
- **2,4M+ organiska visningar** över 12 månader (TikTok + Instagram)
- Live CPM-jämförelse mot Instagram Ads, TikTok Ads och Meta Ads Sverige
- Engagement rate 4,92 % (mer än marknadssnittet på 3,7 %)
- Alla siffror baseras på riktig data från TikTok Analytics och Instagram Insights

### Interaktiv sponsringskalkylator
- Välj budget, mål och exponeringar
- Automatisk paketrekommendation baserat på val
- Visar uppskattad räckvidd och CPM
- Jämförelse mot marknadsstandard för betalda annonser

### Tröjzon-visualisering
- Klickbara zoner på match-tröjan (C, D, E, F, H, X, A, B)
- Lediga zoner pulserar grönt, bokade visas röda
- Klick på en zon öppnar kontaktformulär med zon-info förifylld

### Kontaktformulär med Web3Forms
- Riktigt formulär med obligatoriska fält
- Automatisk sammanställning av valt paket
- Mail går direkt till `chalmershockey@gmail.com`
- Sponsorns mailadress sätts som reply-to för enkel uppföljning

### TikTok-embeddar
- Tre handplockade klipp som visar föreningens innehåll
- Embeddas direkt från TikTok — ingen filhostning behövs
- Lyfter humor, matchstämning och gemenskap

### Sponsor-galleri
- Logotyper på befintliga partners (Sano Marin, Joluca, Aros, Nivåbyggen, Löfbergs)
- Social proof för nya prospekts

### Analytics & SEO
- **Cloudflare Web Analytics** — GDPR-vänligt, ingen cookie-banner
- **Open Graph meta-tags** för snygga previews på LinkedIn, WhatsApp, iMessage
- Lagbild med SUHL-pokal som delningsbild

---

## Teknisk stack

| Komponent | Verktyg |
|---|---|
| **Frontend** | HTML, CSS, vanilla JavaScript (inget ramverk) |
| **Hosting** | GitHub Pages |
| **Kontaktformulär** | [Web3Forms](https://web3forms.com) (gratis tier) |
| **Analytics** | [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/) (gratis) |
| **Video-embeds** | TikTok iframe-embeds |
| **Versionshantering** | Git + GitHub |
| **Utvecklingsverktyg** | Cursor + Claude Code |

---

## Projektstruktur
Chalmers-Hockey-SponsorSite/
├── index.html              # Huvudsida
├── styles/                 # CSS-filer
├── scripts/                # JavaScript för kalkylator, modal, etc
├── assets/
│   ├── photos/             # Spelar- och lagbilder
│   ├── logos/              # Klubblogga + sponsorlogos
│   ├── mockups/            # Tröj- och byx-mockups
│   ├── og-image.jpg        # Open Graph delningsbild
│   └── ...                 # Bildfiler för zon-modaler
└── README.md

---

## Lokal utveckling

Projektet kräver ingen build-process. Klona repot och kör en lokal server:

```bash
git clone https://github.com/reisky17-svg/Chalmers-Hockey-SponsorSite.git
cd Chalmers-Hockey-SponsorSite
```

Använd **Live Server**-extensionen i VS Code/Cursor eller kör en enkel HTTP-server:

```bash
# Python 3
python -m http.server 5500

# Node.js
npx serve
```

Öppna sedan `http://localhost:5500` i webbläsaren.

---

## Deployment

Sidan deployas automatiskt via **GitHub Pages** vid push till `main`:

```bash
git add .
git commit -m "Beskriv ändringen"
git push
```

Ändringar är live på `reisky17-svg.github.io/Chalmers-Hockey-SponsorSite/` inom ~1 minut.

---

## Konfiguration

### Web3Forms (kontaktformulär)
Access key finns i `index.html` i submit-funktionen för formuläret. För att byta mottagaradress eller nyckel, registrera ny site på [web3forms.com](https://web3forms.com).

### Cloudflare Analytics
Beacon-snippet ligger precis innan stängande `</body>`-tagg. Token är knuten till sajten i Cloudflare-dashboarden.

### TikTok-embeddar
Embed-URL:erna byggs från video-ID enligt formatet:

https://www.tiktok.com/embed/v2/[VIDEO_ID]

För att byta video, ändra `[VIDEO_ID]` i `index.html` i video-sektionen.

---

## Designprinciper

- **Mörkt tema** med röd accent — matchar klubbens identitet
- **Mobile-first** efter ursprunglig desktop-design — separata media queries hanterar mobilanpassning utan att påverka desktopvyn
- **Ärlig data** — alla siffror är verifierbara via TikTok Analytics och Instagram Insights, källor visas för CPM-benchmarks
- **Kort väg till kontakt** — flera CTAs leder till samma modal med kontextkänslig förifyllning

---

## Roadmap

- [ ] Custom domain (`chalmershockey.se` eller liknande)
- [ ] Mätning på Cloudflare Analytics under första sponsorperioden
- [ ] Flytta paketpriser och zon-status till JSON-konfig för enklare uppdatering
- [ ] Eventuell migration till Supabase för lead-hantering om volymen ökar

---
## Prestandaoptimering

Sidan har genomgått fyra rundor av systematisk prestandaoptimering baserat på Lighthouse-audits och Cloudflare Web Analytics.

### Slutresultat (maj 2026)

| Kategori | Poäng |
|---|---|
| Performance (desktop) | 97/100 |
| Performance (mobile) | 86/100 |
| Accessibility | 96/100 |
| Best Practices | 100/100 |
| SEO | 100/100 |

| Mätning | Före | Efter |
|---|---|---|
| LCP desktop | — | 1.0s |
| LCP mobile | 5.0s | 3.5s |
| TBT desktop | — | 0ms |
| TBT mobile | 1,390ms | 10ms |
| CLS | 0 | 0 |
| Page weight | ~20 MB | ~700 KB |

### Vad som gjordes

**Runda 1 — Bildoptimering och lazy loading**
- Konverterade alla bilder från JPG/PNG till WebP (page weight: 20 MB → 700 KB)
- Lade till `loading="lazy"` på alla TikTok-iframes (TBT: 1,390ms → 10ms)
- Preconnect till externa domäner (TikTok, Web3Forms)
- Hero-bild fick `fetchpriority="high"` och `<link rel="preload">`

**Runda 2 — Accessibility och render-blocking**
- Fixade saknade `<label>`-element på `<select>` i kalkylator
- Rättade ARIA-roller och rubrikhierarki (H1→H2→H3)
- Accessibility: 82 → 96
- La till `font-display: swap` på fonter

**Runda 3 — Regressionsfixar och animation**
- Återställde CSS-laddning som orsakade CLS 0.782 → 0
- Konverterade non-composited animationer till GPU-accelererade (`transform`/`opacity`)
- TBT: 520ms → 0ms på desktop

**Runda 4 — Mobilspecifik bildoptimering**
- Skapade mobilspecifik hero-bild (`player-hero-mobile.webp`, max 400px, kvalitet 70)
- Implementerade `srcset` + `sizes` för att ladda rätt bildstorlek per enhet
- `imagesrcset` i preload-taggen matchar `<picture>`-elementets srcset

### Verklig prestanda

Cloudflare Web Analytics visar faktisk prestanda för riktiga besökare — inte Lighthouse-simulation på Moto G Power med Slow 4G:

- **LCP P50:** 291ms
- **LCP P75:** 492ms  
- **LCP P90:** 1,036ms

Sidan laddar snabbt för verkliga besökare. Lighthouse mobile-poängen (86) är konservativ eftersom den simulerar extremt begränsad hårdvara och uppkoppling.

### Testmetodik

Alla mätningar gjordes i Chrome incognito-läge för att eliminera extension-påverkan:
- **Mobile:** Emulated Moto G Power, Slow 4G throttling
- **Desktop:** Custom throttling
- Verktyg: Lighthouse 13.0.2, Cloudflare Web Analytics

---

## Kontakt

**Chalmers Blue McRangers**
📧 [chalmershockey@gmail.com](mailto:chalmershockey@gmail.com)
📱 [TikTok](https://www.tiktok.com/@chalmershockey) · [Instagram](https://www.instagram.com/chalmershockey)
🏟️ Slottsskogsrinken, Göteborg

---

## Licens

© Chalmers Blue McRangers. Allt innehåll (bilder, logotyper, text) tillhör föreningen och dess respektive sponsorer.
