#!/usr/bin/env node
/** Batch 5 of 5 (final): 10 Canadian cities. */
import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

function f(slug, name, contact, city, cityLabel, province, country, services, industries, description, website) {
  return { slug, name, contact: contact || 'Team', city, cityLabel, province, country, services, industries, description, website };
}

const CANDIDATES = [
  // ── Victoria ───────────────────────────────────────────────────────
  f("dusanj-wirk-vic", "Dusanj & Wirk CPA", "Team", "victoria", "Victoria", "British Columbia", "Canada", ["tax-advisory", "fpa-consulting", "bookkeeping"], ["professional-services", "retail", "real-estate"], "Dusanj & Wirk is a CPA firm providing sound, insightful advice and business expertise in Victoria, BC, with extensive experience serving local businesses, individuals, and non-profits.", "https://dusanjwirk.com"),
  f("parallel-vic", "Parallel CPA", "Team", "victoria", "Victoria", "British Columbia", "Canada", ["tax-advisory", "fpa-consulting", "bookkeeping"], ["professional-services", "retail", "real-estate"], "Parallel CPA is a forward-thinking Victoria, BC accounting firm specializing in tax, cloud accounting, and business management for individuals and small businesses.", "https://www.parallelcpa.ca"),
  f("btvic-vic", "Baker Tilly Victoria", "Team", "victoria", "Victoria", "British Columbia", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "manufacturing"], "Baker Tilly Victoria provides tax, accounting, and advisory services to British Columbia businesses.", "https://www.btvic.com"),
  f("wtcca-vic", "WTCCA Victoria", "Team", "victoria", "Victoria", "British Columbia", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "WTCCA is a Victoria BC CPA accounting firm providing end-to-end accounting services for individuals and businesses.", "https://wtcca.com/victoria"),
  f("hutcheson-vic", "Hutcheson & Co", "Team", "victoria", "Victoria", "British Columbia", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "retail"], "Hutcheson & Co. is a Victoria BC trusted resource since 1987 for corporate and individual accounting and tax services with cross-border tax expertise.", "https://www.hutcheson.ca"),
  f("schell-vic", "Schell & Associates", "Team", "victoria", "Victoria", "British Columbia", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Schell & Associates is a team of personal and business chartered professional accountants in BC serving Victoria, Duncan, Sidney, Nanaimo, and Vancouver Island.", "https://schellandassociates.ca"),
  f("padgett-vic", "Padgett Victoria", "Team", "victoria", "Victoria", "British Columbia", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Padgett Business Services is a Victoria, BC firm providing expert small business and personal tax return accounting with specialists in corporate and personal tax.", "https://www.countbeans.com"),
  f("ssk-vic", "Schibli Stedman King", "Team", "victoria", "Victoria", "British Columbia", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "private-equity"], "Schibli Stedman King serves Victoria's most successful organizations and private individuals with tax, audit, and advisory services.", "https://sskca.com"),
  f("mnp-vic", "MNP Victoria", "Team", "victoria", "Victoria", "British Columbia", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "manufacturing"], "MNP Victoria provides accounting, tax, and consulting services to Vancouver Island businesses.", "https://www.mnp.ca/en/offices/victoria"),
  f("grant-thornton-vic", "Grant Thornton - Victoria", "Team", "victoria", "Victoria", "British Columbia", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "manufacturing"], "Grant Thornton has a Victoria, BC office providing audit, tax, and advisory services to Vancouver Island businesses.", "https://www.grantthornton.ca/en/locations/victoria-bc"),
  f("spire-vic", "Spire CPA Victoria", "Team", "victoria", "Victoria", "British Columbia", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Spire CPA is a Victoria BC chartered professional accounting firm providing tax and accounting services.", "https://spirecpa.ca"),

  // ── Saskatoon ──────────────────────────────────────────────────────
  f("mnp-sas", "MNP Saskatoon", "Team", "saskatoon", "Saskatoon", "Saskatchewan", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "agriculture", "real-estate"], "MNP Saskatoon has been a local community member for 25+ years providing accounting, assurance, audit, specialty tax, business valuations, litigation, bookkeeping, and business consulting.", "https://www.mnp.ca/en/offices/saskatoon"),
  f("mahil-sas", "Mahil CPA", "Team", "saskatoon", "Saskatoon", "Saskatchewan", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Mahil CPA is a Saskatoon chartered accountant with 30+ years of experience specializing in corporate tax preparation, CRA audits, and business advisory services.", "https://www.mahilcpa.ca"),
  f("sm-pro-sas", "SM Pro Services", "Team", "saskatoon", "Saskatoon", "Saskatchewan", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "SM Pro Services delivers expert accounting, bookkeeping, payroll, and tax solutions for small businesses and individuals in Saskatoon as Certified QuickBooks ProAdvisors Elite Tier.", "https://smproservices.ca"),
  f("murray-sen-sas", "Murray Sen & Associates CPA", "Team", "saskatoon", "Saskatoon", "Saskatchewan", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Murray, Sen & Associates has been taking the accounting weight off Saskatoon small businesses for 10+ years.", "https://saskatoonaccountant.ca"),
  f("padgett-sas", "Padgett Saskatoon", "Team", "saskatoon", "Saskatoon", "Saskatchewan", "Canada", ["tax-advisory", "bookkeeping"], ["professional-services", "retail"], "Padgett Saskatoon offers bookkeeping, payroll, and tax preparation for small businesses backed by a national network.", "https://saskatoon.smallbizpros.ca"),
  f("newwave-sas", "New Wave CPA", "Team", "saskatoon", "Saskatoon", "Saskatchewan", "Canada", ["fractional-cfo", "tax-advisory", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "New Wave CPA provides end-to-end tax services for individuals and businesses in Saskatoon with efficient tax planning and reduction strategies.", "https://newwavecpa.com"),
  f("gta-sas", "GTA Accounting Saskatoon", "Team", "saskatoon", "Saskatoon", "Saskatchewan", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "GTA Accounting is a Saskatoon professional tax services firm.", "https://www.gtaaccounting.ca/accounting-firm/professional-accounting-firm-in-saskatoon"),
  f("kpmg-sas", "KPMG - Saskatoon", "Team", "saskatoon", "Saskatoon", "Saskatchewan", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "agriculture", "real-estate"], "KPMG has a Saskatoon office providing audit, tax, and advisory services.", "https://kpmg.com/ca/en/home/about/offices/saskatoon.html"),
  f("bdo-sas", "BDO Canada - Saskatoon", "Team", "saskatoon", "Saskatoon", "Saskatchewan", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "agriculture", "real-estate"], "BDO Canada has a Saskatoon office providing assurance, tax, and business advisory services.", "https://www.bdo.ca/en-ca/offices/saskatoon"),
  f("cherry-insights-sas", "Cherry Insights CPA", "Team", "saskatoon", "Saskatoon", "Saskatchewan", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Cherry Insights is a Saskatoon CPA firm providing tax and accounting services to Saskatchewan businesses.", "https://cherryinsights.ca"),
  f("thecompanybook-sas", "The Company Book", "Team", "saskatoon", "Saskatoon", "Saskatchewan", "Canada", ["bookkeeping", "tax-advisory"], ["professional-services", "retail"], "The Company Book is a Saskatoon accounting and bookkeeping firm serving small businesses.", "https://thecompanybook.ca"),

  // ── Regina ─────────────────────────────────────────────────────────
  f("custom-reg", "Custom CPA Regina", "Team", "regina", "Regina", "Saskatchewan", "Canada", ["fractional-cfo", "tax-advisory", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Custom CPA is Regina's trusted fractional CFO and accounting firm offering strategic tax planning, financial modeling, and CFO advisory for growing businesses with 18+ years experience.", "https://customcpa.ca"),
  f("bituin-reg", "Bituin Tax and Accounting", "Team", "regina", "Regina", "Saskatchewan", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Bituin is a Regina-based full-service accounting, payroll, and tax firm supporting individuals, micro-businesses, and small enterprises.", "https://www.bituintaxandaccounting.com"),
  f("mnp-reg", "MNP Regina", "Team", "regina", "Regina", "Saskatchewan", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "agriculture", "real-estate"], "MNP Regina provides accounting, tax, and consulting services to Saskatchewan businesses.", "https://www.mnp.ca/en/offices/regina"),
  f("4sight-reg", "4Sight Group CPA", "Team", "regina", "Regina", "Saskatchewan", "Canada", ["tax-advisory", "fpa-consulting", "bookkeeping"], ["professional-services", "retail", "agriculture"], "4Sight Group CPA is a local Saskatchewan accounting business and advisory firm with offices in Regina and Wynyard providing integrated accounting, tax, and advisory services.", "https://www.4sightgroup-cpa.ca"),
  f("gpa-reg", "Great Plains Accounting", "Team", "regina", "Regina", "Saskatchewan", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["agriculture", "professional-services", "retail"], "Great Plains Accounting is a full-service Regina, SK accounting firm serving corporate, personal, and agriculture clients.", "https://gpacc.ca"),
  f("grant-thornton-reg", "Grant Thornton - Regina", "Team", "regina", "Regina", "Saskatchewan", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "agriculture", "real-estate"], "Grant Thornton has a Regina, SK office providing audit, tax, and advisory services.", "https://www.grantthornton.ca/en/locations/regina-sk"),
  f("kpmg-reg", "KPMG - Regina", "Team", "regina", "Regina", "Saskatchewan", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "agriculture", "real-estate"], "KPMG has a Regina office providing audit, tax, and advisory services.", "https://kpmg.com/ca/en/home/about/offices/regina.html"),
  f("bdo-reg", "BDO Canada - Regina", "Team", "regina", "Regina", "Saskatchewan", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "agriculture", "real-estate"], "BDO Canada has a Regina office providing assurance, tax, and business advisory services.", "https://www.bdo.ca/en-ca/offices/regina"),
  f("gp-reg", "GP Chartered Professional Accountants", "Team", "regina", "Regina", "Saskatchewan", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "agriculture"], "GP CPA is a Regina Saskatchewan chartered professional accounting firm serving small and medium businesses.", "https://gpcpa.ca"),
  f("colby-reg", "Colby CPA Regina", "Team", "regina", "Regina", "Saskatchewan", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "agriculture"], "Colby CPA is a Regina chartered professional accounting firm providing tax and accounting services.", "https://colbycpa.ca"),

  // ── Kitchener ──────────────────────────────────────────────────────
  f("bdo-kw", "BDO Kitchener-Waterloo", "Team", "kitchener", "Kitchener", "Ontario", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "manufacturing"], "BDO has a Kitchener-Waterloo office providing assurance, tax, and business advisory services.", "https://www.bdo.ca/locations/bdo-kitchener-waterloo"),
  f("csd-kw", "Clarke Starke & Deigel", "Team", "kitchener", "Kitchener", "Ontario", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "retail", "real-estate"], "Clarke, Starke & Deigel is located in the heart of Kitchener-Waterloo offering personalized strategies and integrated tax planning.", "https://csd.cpa"),
  f("lnm-kw", "LNM Accounting Solutions", "Team", "kitchener", "Kitchener", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "LNM specializes in Kitchener small businesses that do not have the need or capacity for a full-time finance department.", "https://www.lnm-cpa.com"),
  f("ck-kw", "CK Accounting", "Team", "kitchener", "Kitchener", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "CK Accounting & Tax Services is a professional Kitchener accounting practice serving companies and individuals in the Kitchener, Waterloo, Cambridge, and Ontario area.", "https://ckaccounting.ca"),
  f("ark-kw", "Ark Accounting & Tax KW", "Team", "kitchener", "Kitchener", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["healthcare", "real-estate", "technology"], "Ark Accounting & Tax is a Kitchener-Waterloo firm with 10+ years experience specializing in healthcare, real estate, IT consultants, freelancers, and creative content.", "https://arkaccounting.com"),
  f("deborah-hughes-kw", "Deborah Hughes CPA", "Deborah Hughes", "kitchener", "Kitchener", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Deborah Hughes is a Kitchener-Waterloo CPA dedicated to assisting small businesses with accounting, bookkeeping, payroll, and tax preparation.", "https://deborahhughes.ca"),
  f("kanac-kw", "Kanac Accounting", "Team", "kitchener", "Kitchener", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Kanac Accounting is a CPA Ontario-registered Kitchener firm offering expert accounting services, bookkeeping, and tax preparation.", "https://www.kanac.ca"),
  f("waterloo-acct-kw", "Waterloo Accounting Services", "Team", "kitchener", "Kitchener", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Waterloo Accounting Services was founded by Dr. Wenqin Zhou, a CPA and CMA, creating custom solutions for accounting, bookkeeping, payroll, and tax services for SME businesses.", "https://waterlooaccountingservices.com"),
  f("amh-kw", "AMH Chartered Professional Accountant", "Team", "kitchener", "Kitchener", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "AMH Chartered Professional Accountant handles bookkeeping, taxes, and management advisory services offering personalized accounting and tax optimization for Kitchener-Waterloo small businesses.", "https://amhtaxes.com/cpa-in-kitchener-waterloo"),
  f("mnp-kw", "MNP Kitchener", "Team", "kitchener", "Kitchener", "Ontario", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "manufacturing", "real-estate"], "MNP Kitchener provides accounting, tax, and consulting services to Waterloo Region businesses.", "https://www.mnp.ca/en/offices/kitchener"),
  f("grant-thornton-kw", "Grant Thornton - Kitchener", "Team", "kitchener", "Kitchener", "Ontario", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "manufacturing", "real-estate"], "Grant Thornton has a Kitchener-Waterloo office providing audit, tax, and advisory services.", "https://www.grantthornton.ca/en/locations/kitchener-on"),

  // ── Quebec City ────────────────────────────────────────────────────
  f("brassard-qc", "Brassard Carrier", "Team", "quebec-city", "Quebec City", "Quebec", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Brassard Carrier Comptables Agréés is a Quebec City accounting firm offering accounting services to local businesses.", "https://brassardcarrier.ca"),
  f("mnp-qc", "MNP Quebec City", "Team", "quebec-city", "Quebec City", "Quebec", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "manufacturing"], "MNP Quebec City provides accounting, tax, and consulting services to Quebec businesses.", "https://www.mnp.ca/en/offices/quebec-city"),
  f("raymond-chabot-qc", "Raymond Chabot Grant Thornton - Quebec", "Team", "quebec-city", "Quebec City", "Quebec", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "manufacturing", "real-estate"], "Raymond Chabot Grant Thornton has a Quebec City office providing audit, tax, and advisory services.", "https://www.rcgt.com/en/offices/quebec-city"),
  f("bdo-qc", "BDO Canada - Quebec City", "Team", "quebec-city", "Quebec City", "Quebec", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "manufacturing"], "BDO Canada has a Quebec City office providing assurance, tax, and business advisory services.", "https://www.bdo.ca/en-ca/offices/quebec"),
  f("t2inc-qc", "T2inc", "Team", "quebec-city", "Quebec City", "Quebec", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "T2inc.ca is a Quebec City corporate tax accountant providing expert support to incorporated small businesses.", "https://t2inc.ca/en"),
  f("mallette-qc", "Mallette Quebec", "Team", "quebec-city", "Quebec City", "Quebec", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "manufacturing"], "Mallette is a large Quebec-based CPA firm with a Quebec City office providing tax, audit, and advisory services.", "https://mallette.ca"),
  f("aubin-qc", "Aubin Leblanc CPA", "Team", "quebec-city", "Quebec City", "Quebec", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Aubin Leblanc CPA is a Quebec City chartered professional accounting firm providing tax and accounting services.", "https://aubinleblanc.ca"),
  f("kpmg-qc", "KPMG - Quebec City", "Team", "quebec-city", "Quebec City", "Quebec", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "manufacturing"], "KPMG has a Quebec City office providing audit, tax, and advisory services.", "https://kpmg.com/ca/en/home/about/offices/quebec.html"),
  f("groupe-rheault-qc", "Groupe Rheault CPA", "Team", "quebec-city", "Quebec City", "Quebec", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Groupe Rheault is a Quebec City CPA firm providing accounting and tax services.", "https://grouperheault.com"),
  f("deloitte-qc", "Deloitte Quebec City", "Team", "quebec-city", "Quebec City", "Quebec", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "manufacturing"], "Deloitte has a Quebec City office providing audit, tax, and advisory services to Quebec businesses.", "https://www2.deloitte.com/ca/en/legal/office-locator/quebec.html"),

  // ── Mississauga ────────────────────────────────────────────────────
  f("madanca-miss", "Madan CPA", "Allan Madan", "mississauga", "Mississauga", "Ontario", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "technology"], "MadanCPA is a premier Mississauga and Toronto accounting firm specializing in cross-border taxation, US tax returns, non-resident tax filings, and corporate tax return preparation.", "https://madanca.com"),
  f("dharna-miss", "Dharna CPA", "Team", "mississauga", "Mississauga", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Dharna CPA is a trusted Mississauga, Toronto, and Ontario accounting, tax, and advisory partner specializing in personalized solutions for small businesses, professionals, and startups.", "https://dharnacpa.ca"),
  f("dean-assoc-miss", "Dean and Associates", "Team", "mississauga", "Mississauga", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Dean and Associates is a Mississauga, Toronto, and Ottawa CPA accounting firm providing tax services.", "https://www.deanandassociates.ca"),
  f("bateman-miss", "Bateman MacKay", "Team", "mississauga", "Mississauga", "Ontario", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "manufacturing"], "Bateman MacKay LLP is a premier full-service Mississauga and Burlington CPA firm with 40+ years delivering high-quality accounting and business advisory services.", "https://www.batemanmackay.com"),
  f("mnp-miss", "MNP Mississauga", "Team", "mississauga", "Mississauga", "Ontario", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["real-estate", "manufacturing", "professional-services"], "MNP Mississauga has a 300-member team providing accounting, tax, and consulting services frequently working with real estate, construction, food and beverage, advanced manufacturing, and technology small and medium enterprises.", "https://www.mnp.ca/en/offices/mississauga"),
  f("gsp-miss", "GSP CPA Mississauga", "Team", "mississauga", "Mississauga", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "GSP Chartered Professional Accountant offers Mississauga small business tax, accounting, bookkeeping, and payroll services with affordable flat-rate packages.", "https://www.gspcpa.ca"),
  f("capex-miss", "Capex CPA Mississauga", "Team", "mississauga", "Mississauga", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Capex CPA is a Mississauga CPA firm for small businesses providing tax and accounting services.", "https://capexcpa.com"),
  f("wtcca-miss", "WTCCA Mississauga", "Team", "mississauga", "Mississauga", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "WTCCA is a Mississauga chartered professional accounting firm providing tax and accounting services.", "https://wtcca.com/mississauga"),
  f("accountingmiss-miss", "Accounting Mississauga", "Team", "mississauga", "Mississauga", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Accounting Mississauga is a local firm providing tax accountant services in the Mississauga area.", "https://www.accountingmississauga.ca"),
  f("billah-miss", "Billah CPA", "Team", "mississauga", "Mississauga", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Billah CPA is a Mississauga chartered professional accounting firm offering accounting, tax, and bookkeeping services to small businesses.", "https://billahcpa.ca"),

  // ── Brampton ───────────────────────────────────────────────────────
  f("gsp-bram", "GSP CPA Brampton", "Team", "brampton", "Brampton", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "GSP Chartered Professional Accountant Professional Corporation provides Brampton personal tax, corporate tax, payroll, bookkeeping, cloud accounting, and business accounting services.", "https://www.gspcpa.ca/pages/service-areas/small-business-tax-accountants-brampton-on"),
  f("cpabrampton", "CPA Brampton", "Team", "brampton", "Brampton", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "CPA Brampton provides reliable guidance and professional support for all accounting, bookkeeping, and tax needs in Brampton.", "https://www.cpabrampton.com"),
  f("gondaliya-bram", "Gondaliya CPA Brampton", "Team", "brampton", "Brampton", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Gondaliya CPA specializes in affordable tax accounting services for small businesses in Brampton and the GTA with corporate tax, bookkeeping, payroll, and tax planning.", "https://gondaliyacpa.ca/brampton"),
  f("ashwani-bram", "Ashwani Sood CPA", "Ashwani Sood", "brampton", "Brampton", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Ashwani Sood CPA is a Brampton, Ontario accountant providing tax and accounting services.", "https://ashwanisood.com"),
  f("taxfilers-bram", "Tax Return Filers Brampton", "Team", "brampton", "Brampton", "Ontario", "Canada", ["tax-advisory", "bookkeeping"], ["professional-services", "retail"], "Tax Return Filers is a Brampton accounting firm providing CPA tax services.", "https://taxreturnfilers.com/brampton"),
  f("aloe-bram", "ALOE Accounting & Tax", "Team", "brampton", "Brampton", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "ALOE Accounting and Tax is a CPA public licensed Brampton, ON accounting firm specializing in audits, tax, and financial statements.", "https://aloeaccountingandtax.com"),
  f("harjit-bram", "Harjit Ghuman CPA", "Harjit Ghuman", "brampton", "Brampton", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Harjit Ghuman CPA provides accounting and tax services in Brampton, Mississauga, and Toronto.", "http://www.harjitghuman.com"),
  f("ravinder-bram", "Ravinder Ahlawat CPA", "Ravinder Ahlawat", "brampton", "Brampton", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Ravinder Ahlawat is a Mississauga, Brampton, and GTA CPA tax accountant providing tax and accounting services.", "https://www.ravindercpa.com"),
  f("sidhu-bram", "Sidhu CPA Brampton", "Team", "brampton", "Brampton", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Sidhu CPA is a Brampton chartered professional accounting firm providing tax and accounting services.", "https://sidhucpa.ca"),
  f("aulakh-bram", "Aulakh CPA Brampton", "Team", "brampton", "Brampton", "Ontario", "Canada", ["tax-advisory", "bookkeeping"], ["professional-services", "retail"], "Aulakh CPA is a Brampton chartered professional accounting firm providing tax and accounting services to small businesses.", "https://aulakhcpa.ca"),

  // ── Surrey ─────────────────────────────────────────────────────────
  f("hwg-sur", "HWG CPA Surrey", "Team", "surrey", "Surrey", "British Columbia", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "HWG, Chartered Professional Accountants provides business and personal tax services to Surrey, BC, Cloverdale, Langley and Lower Fraser Valley clients since 1971.", "https://www.hwgca.com"),
  f("mnp-sur", "MNP Surrey", "Team", "surrey", "Surrey", "British Columbia", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["real-estate", "manufacturing", "professional-services"], "MNP Surrey offers accounting, tax, and consulting including corporate restructuring, succession planning, business valuations, M&A, and non-resident tax planning.", "https://www.mnp.ca/en/offices/surrey"),
  f("equinox-sur", "Equinox CPA", "Team", "surrey", "Surrey", "British Columbia", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "retail"], "Equinox CPA provides Surrey, Langley, and Delta accounting, corporate/business tax, personal tax, financial statements, audits, reviews, and consulting services.", "https://www.equinoxcpa.com"),
  f("taxlink-sur", "Taxlink CPA Firm", "Team", "surrey", "Surrey", "British Columbia", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Taxlink CPA Firm offers Surrey and Langley tax planning, bookkeeping, financial consulting, and payroll services.", "https://taxlinkcpa.ca"),
  f("bouchard-sur", "Bouchard & Company Chartered Accountants", "Team", "surrey", "Surrey", "British Columbia", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Bouchard & Company Chartered Accountants is a Surrey BC firm at 7164 120 Street providing accounting, bookkeeping, personal and corporate tax, and financial planning services to Delta, White Rock, and Vancouver.", "https://www.bouchardco.com"),
  f("mehra-sur", "Mehra CPA", "Team", "surrey", "Surrey", "British Columbia", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Mehra CPA is a leading Surrey and Delta CPA firm offering expert accounting, tax, and bookkeeping services tailored for small businesses and startups.", "https://mehracpa.com"),
  f("crowe-mackay-sur", "Crowe MacKay Surrey", "Team", "surrey", "Surrey", "British Columbia", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["construction", "real-estate", "healthcare"], "Crowe MacKay has a Surrey BC office helping individuals and businesses in construction, real estate, health, aviation, and manufacturing industries.", "https://www.crowe.com/ca/crowemackay/about-us/our-offices/surrey"),
  f("bdo-sur", "BDO Canada - Surrey", "Team", "surrey", "Surrey", "British Columbia", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "manufacturing"], "BDO Canada has a Surrey office providing assurance, tax, and business advisory services.", "https://www.bdo.ca/en-ca/offices/surrey"),
  f("kpmg-sur", "KPMG - Surrey", "Team", "surrey", "Surrey", "British Columbia", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "manufacturing"], "KPMG has a Surrey office providing audit, tax, and advisory services.", "https://kpmg.com/ca/en/home/about/offices/surrey.html"),
  f("grant-thornton-sur", "Grant Thornton - Surrey", "Team", "surrey", "Surrey", "British Columbia", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "manufacturing"], "Grant Thornton has a Surrey BC office providing audit, tax, and advisory services.", "https://www.grantthornton.ca/en/locations/surrey-bc"),

  // ── Markham ────────────────────────────────────────────────────────
  f("jf-cpa-mar", "J.F. CPA", "Team", "markham", "Markham", "Ontario", "Canada", ["tax-advisory", "fpa-consulting", "bookkeeping"], ["professional-services", "retail", "real-estate"], "J.F. CPA is a full-service Markham, ON tax, accounting, and business consulting firm providing solutions to GTA clients.", "https://www.jfcpaca.com"),
  f("mnp-mar", "MNP Markham", "Team", "markham", "Markham", "Ontario", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "manufacturing"], "MNP Markham offers locally focused accounting, tax, and business consulting services with national resources from 120+ offices.", "https://www.mnp.ca/en/offices/markham"),
  f("mainland-mar", "Mainland Accounting", "Team", "markham", "Markham", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Mainland Accounting Professional Corporation is a Markham CPA firm serving GTA and Ontario with taxation, accounting, bookkeeping, consulting, and business registration.", "http://mainlandaccounting.ca"),
  f("elite-tax-mar", "Elite Accounting & Tax", "Team", "markham", "Markham", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Elite Accounting & Tax Services is a full-service accounting firm headquartered in Markham, Ontario with 10+ years of professional experience serving small to medium size businesses.", "https://www.elitetaxpro.ca"),
  f("koroll-mar", "Koroll & Company", "Team", "markham", "Markham", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Koroll & Company is a Markham CPA firm providing accounting services and tax planning to small businesses.", "https://www.koroll.ca"),
  f("gta-mar", "GTA Accounting Markham", "Team", "markham", "Markham", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "GTA Accounting is a Markham professional tax services firm.", "https://www.gtaaccounting.ca/accounting-firm/professional-accounting-firm-in-markham"),
  f("bdo-mar", "BDO Canada - Markham", "Team", "markham", "Markham", "Ontario", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "manufacturing"], "BDO Canada has a Markham office providing assurance, tax, and business advisory services.", "https://www.bdo.ca/en-ca/offices/markham"),
  f("grant-thornton-mar", "Grant Thornton - Markham", "Team", "markham", "Markham", "Ontario", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "manufacturing"], "Grant Thornton has a Markham office providing audit, tax, and advisory services.", "https://www.grantthornton.ca/en/locations/markham-on"),
  f("wei-cpa-mar", "Wei CPA Markham", "Team", "markham", "Markham", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Wei CPA is a Markham chartered professional accounting firm providing tax and accounting services.", "https://weicpa.ca"),
  f("sterling-mar", "Sterling CPA Markham", "Team", "markham", "Markham", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Sterling CPA is a Markham chartered professional accounting firm providing tax and accounting services.", "https://sterlingcpa.ca"),

  // ── Richmond Hill ──────────────────────────────────────────────────
  f("stratking-rh", "Stratking Accounting & Tax", "Team", "richmond-hill", "Richmond Hill", "Ontario", "Canada", ["fractional-cfo", "tax-advisory", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Stratking Accounting & Tax is a top Richmond Hill CPA firm specializing in corporate tax, accounting, and fractional CFO services across Canada.", "https://www.stratkingaccountingandtax.com"),
  f("valguilis-rh", "Val Guilis CPA", "Val Guilis", "richmond-hill", "Richmond Hill", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Val Guilis CPA is a local Richmond Hill chartered professional accounting firm helping small businesses with customized accounting and tax services.", "https://valguiliscpa.com"),
  f("iravani-rh", "Iravani CPA", "Team", "richmond-hill", "Richmond Hill", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Iravani CPA is a full-service Richmond Hill Ontario chartered professional accountant firm focused on small to medium-sized owner-managed businesses, non-profits, and individuals.", "https://www.iravanicpa.com"),
  f("gsp-rh", "GSP CPA Richmond Hill", "Team", "richmond-hill", "Richmond Hill", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "GSP CPA provides small business tax accountants and accounting services in Richmond Hill.", "https://www.gspcpa.ca/pages/service-areas/small-business-tax-accountants-richmond-hill-on"),
  f("srjca-rh", "SRJ Chartered Accountants Richmond Hill", "Team", "richmond-hill", "Richmond Hill", "Ontario", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "retail", "real-estate"], "SRJ Chartered Accountants Professional Corporation is a Richmond Hill tax accountant and accounting services firm.", "https://www.srjca.com/accountants-in-richmond-hill"),
  f("gondaliya-rh", "Gondaliya CPA Richmond Hill", "Team", "richmond-hill", "Richmond Hill", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Gondaliya CPA supports entrepreneurs and small business owners across Richmond Hill with practical year-round tax and accounting solutions.", "https://gondaliyacpa.ca/richmond-hill"),
  f("stratos-rh", "Stratos Consultants", "Team", "richmond-hill", "Richmond Hill", "Ontario", "Canada", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Stratos Accounting Services is a Richmond Hill Ontario accounting firm committed to providing the highest quality of accounting services tailored to small businesses.", "https://www.stratosconsultants.ca/richmond-hill-accounting-firm"),
  f("impact-rh", "IMPACT CPAs", "Team", "richmond-hill", "Richmond Hill", "Ontario", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "retail", "real-estate"], "IMPACT CPAs is a Richmond Hill chartered accounting firm focused on the needs of growing businesses in the Greater Toronto area.", "https://www.impactcpas.ca"),
  f("bdo-rh", "BDO Canada - Richmond Hill", "Team", "richmond-hill", "Richmond Hill", "Ontario", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "manufacturing"], "BDO Canada has a Richmond Hill office providing assurance, tax, and business advisory services.", "https://www.bdo.ca/en-ca/offices/richmond-hill"),
  f("mnp-rh", "MNP Richmond Hill", "Team", "richmond-hill", "Richmond Hill", "Ontario", "Canada", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "manufacturing"], "MNP Richmond Hill provides accounting, tax, and consulting services to GTA businesses.", "https://www.mnp.ca/en/offices/richmond-hill"),
];

function normName(s) { return (s || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
function normWeb(s) { if (!s) return ''; return s.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].replace(/\/$/, ''); }
const UA = 'Mozilla/5.0 (compatible; FindFinanceProsBot/1.0)';
const TIMEOUT = 8000;
async function timedFetch(url, opts = {}) {
  const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), TIMEOUT);
  try { return await fetch(url, { ...opts, signal: ctrl.signal, headers: { 'User-Agent': UA, ...(opts.headers || {}) } }); } finally { clearTimeout(t); }
}
async function headCheck(url) {
  try { const r = await timedFetch(url, { method: 'HEAD', redirect: 'follow' }); if (r.status >= 200 && r.status < 400) return true; const g = await timedFetch(url, { method: 'GET', redirect: 'follow' }); return g.status >= 200 && g.status < 400; }
  catch { try { const g = await timedFetch(url, { method: 'GET', redirect: 'follow' }); return g.status >= 200 && g.status < 400; } catch { return false; } }
}
const EMAIL_RX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const BAD_PREFIX = /^(example|sample|test|user|name|first\.last|your|someone|noreply|no-reply)@/i;
const BAD_DOMAIN = /(example\.com|sentry\.io|wixpress\.com|2x\.png|godaddy\.com|squarespace\.com)/i;
function extractEmail(text, d) {
  if (!text) return null;
  const matches = [...new Set(text.match(EMAIL_RX) || [])];
  const valid = matches.filter((e) => !BAD_PREFIX.test(e) && !BAD_DOMAIN.test(e));
  if (!valid.length) return null;
  if (d) { const local = valid.find((e) => e.toLowerCase().endsWith('@' + d)); if (local) return local; }
  return valid[0];
}
async function findEmail(baseUrl) {
  const domain = normWeb(baseUrl);
  const tries = [baseUrl, baseUrl.replace(/\/$/, '') + '/contact', baseUrl.replace(/\/$/, '') + '/contact-us', baseUrl.replace(/\/$/, '') + '/about', baseUrl.replace(/\/$/, '') + '/about-us'];
  for (const url of tries) {
    try { const res = await timedFetch(url, { method: 'GET', redirect: 'follow' }); if (!res.ok) continue; const text = await res.text(); const email = extractEmail(text, domain); if (email) return email; } catch {}
  }
  return null;
}
async function pmap(items, concurrency, fn) {
  const results = new Array(items.length); let i = 0;
  await Promise.all(Array(Math.min(concurrency, items.length)).fill(0).map(async () => { while (i < items.length) { const idx = i++; results[idx] = await fn(items[idx], idx); } }));
  return results;
}

async function main() {
  console.log(`Candidates: ${CANDIDATES.length}`);
  const { data: existing } = await sb.from('firms').select('slug, name, website');
  const existingSlugs = new Set(existing.map((r) => r.slug));
  const existingNames = new Set(existing.map((r) => normName(r.name)));
  const existingWebsites = new Set(existing.map((r) => normWeb(r.website)).filter(Boolean));

  const passed = []; const skipped = [];
  for (const c of CANDIDATES) {
    if (existingSlugs.has(c.slug)) { skipped.push({ c, r: 'dup slug' }); continue; }
    if (existingNames.has(normName(c.name))) { skipped.push({ c, r: 'dup name' }); continue; }
    const w = normWeb(c.website); if (w && existingWebsites.has(w)) { skipped.push({ c, r: 'dup website' }); continue; }
    passed.push(c);
  }
  console.log(`After dedup: ${passed.length} (skipped ${skipped.length})`);
  for (const s of skipped) console.log(`  ✗ [${s.c.city}] ${s.c.name} — ${s.r}`);

  const alive = await pmap(passed, 10, async (c) => (await headCheck(c.website)) ? c : null);
  const live = alive.filter(Boolean);
  console.log(`\nHEAD: ${live.length}/${passed.length}`);
  for (const c of passed) if (!live.includes(c)) console.log(`  ☠ [${c.city}] ${c.name} — ${c.website}`);

  const withEmail = await pmap(live, 8, async (c) => ({ ...c, email: await findEmail(c.website) }));
  console.log(`\nEmails: ${withEmail.filter((x) => x.email).length}/${withEmail.length}`);

  const toInsert = withEmail.slice(0, 100).map((c) => ({
    slug: c.slug, name: c.name, contact: c.contact || null, title: null, email: c.email || null,
    city: c.city, city_label: c.cityLabel, province: c.province, country: c.country,
    services: c.services, industries: c.industries, description: c.description, website: c.website,
    plan: 'free', priority_score: 0, status: 'active', submitted_by: 'admin', source: 'claude_code',
  }));

  const BATCH = 50;
  let inserted = 0;
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH);
    const { error } = await sb.from('firms').insert(batch);
    if (error) { console.error(`✗ batch ${i / BATCH + 1}: ${error.message}`); continue; }
    inserted += batch.length;
    console.log(`  ✓ batch ${i / BATCH + 1}: ${batch.length}`);
  }
  console.log(`\n✓ Inserted: ${inserted}, with email: ${toInsert.filter((x) => x.email).length}`);

  const cities = [...new Set(CANDIDATES.map((c) => c.city))];
  for (const city of cities) {
    const { count } = await sb.from('firms').select('*', { count: 'exact', head: true }).eq('city', city).eq('status', 'active');
    console.log(`  ${city.padEnd(16)} ${count}`);
  }
  const { count: total } = await sb.from('firms').select('*', { count: 'exact', head: true }).eq('status', 'active');
  console.log(`\nTotal active firms: ${total}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
