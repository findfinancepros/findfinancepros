# Firm enrichment spec (Stage 3)

You enrich finance-firm records by reading already-cached website content. **Do not browse the web.** Work only from the cached files.

For each firm slug you are given, read these files under `scrape-cache/<slug>/`:
- `corpus.md` — cleaned text of the firm's homepage + services/team/about/contact/pricing pages
- `extracted-deterministic.json` — emails/phones/linkedin/logo/JSON-LD already pulled mechanically (trust these for contact info unless the corpus clearly contradicts)
- `meta.json` — which pages were crawled; note `redirectedOffDomain`

Then WRITE `scrape-cache/<slug>/enriched.json` with exactly this shape:

```json
{
  "slug": "...",
  "email": "string|null",
  "phone": "string|null (E.164-ish or as displayed; prefer deterministic tel: value)",
  "linkedin": "string|null",
  "logo_url": "string|null (from deterministic)",
  "tagline": "string|null (<= 90 chars, the firm's own positioning line)",
  "contact": "string|null (primary named contact/owner if clear, else 'Team')",
  "title": "string|null (that person's title, e.g. 'CPA, Founder')",
  "team_size": "integer|null (only if stated or clearly countable; '30+ partners' -> 30)",
  "year_founded": "integer|null",
  "certifications": ["CPA","CA","CFA","CMA","EA", "..."],
  "languages": ["English", "..."],
  "free_consultation": "boolean (true only if a free consult/call is offered)",
  "accepts_new_clients": "boolean (default true unless site says otherwise)",
  "min_engagement": "string|null (pricing/minimum fee details if a pricing page exists, e.g. 'Packages from $1,500/mo')",
  "pricing_notes": "string|null (any other pricing specifics found)",
  "service_area": "string|null (geographies served)",
  "services": ["<taxonomy slugs only, see below>"],
  "industries": ["<taxonomy slugs only, see below>"],
  "description": "string (1-2 sentence summary, factual, refined from the site)",
  "long_description": "string (150-250 words, factual, written in third person, no marketing fluff or invented facts)",
  "team": [{"name":"...","title":"...","credentials":"...|null"}],
  "confidence": "high|medium|low",
  "review_flags": ["short strings noting anything uncertain, conflicting, or an acquisition/redirect"]
}
```

## Service taxonomy — map to THESE slugs only (closest fit; omit if none apply)
- `fractional-cfo` — Fractional/part-time/interim/outsourced CFO
- `fpa-consulting` — FP&A, budgeting, forecasting, financial modeling, management reporting
- `controller-services` — Outsourced controller, month-end close, financial reporting
- `bookkeeping` — Bookkeeping, AP/AR, payroll, reconciliations
- `power-bi-automation` — BI dashboards, Power BI, finance automation/systems
- `quality-of-earnings` — QoE, M&A/transaction advisory, due diligence
- `tax-advisory` — Tax planning, preparation, compliance
- `cfo-search` — CFO/finance executive search & recruiting

## Industry taxonomy — map to THESE slugs only (omit if none clearly apply)
`manufacturing, technology, saas, healthcare, professional-services, private-equity, energy, construction, retail, ecommerce, real-estate, hospitality, fintech, life-sciences, senior-living, agriculture`

## Rules
- **Never invent facts.** If the site doesn't state something, use null / empty array. Accuracy over completeness.
- **No em-dashes or en-dashes anywhere.** Use commas, periods, or parentheses. Hard requirement.
- **`long_description` must be 180-260 words** of clean, factual, third-person prose suitable for a public directory page — long enough to be indexable, never padded with fluff or invented claims.
- Correct obvious errors only when the site is explicit (e.g. a wrong founder name).
- If `redirectedOffDomain` is true, set confidence "low" and add a review_flag like "REDIRECTED to <host>: possible acquisition; do not trust extracted data as this firm's."
- If `corpus.md` is missing or nearly empty (only a homepage with no real content), set confidence "low" and flag it.
