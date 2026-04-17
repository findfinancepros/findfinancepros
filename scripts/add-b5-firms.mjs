#!/usr/bin/env node
/** Batch 2 of 5: 4 remaining Priority 1 cities + 6 Priority 2 cities. */
import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

function f(slug, name, contact, city, cityLabel, province, country, services, industries, description, website) {
  return { slug, name, contact: contact || 'Team', city, cityLabel, province, country, services, industries, description, website };
}

const CANDIDATES = [
  // ── Kansas City ─────────────────────────────────────────────────────
  f("wta-tax-kc", "Williams Tax and Accounting", "Shawn Williams", "kansas-city", "Kansas City", "Missouri", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Williams Tax and Accounting is a Kansas City CPA firm at Zona Rosa providing tax preparation, small business tax, bookkeeping, QuickBooks, and payroll services.", "https://wta.tax"),
  f("reller-kc", "Reller & Company CPA", "Team", "kansas-city", "Kansas City", "Missouri", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Reller & Company CPA, PC is a Kansas City, MO full-service tax, accounting, and business consulting firm.", "https://www.rellercpa.com"),
  f("starkey-kc", "Starkey & Company", "Team", "kansas-city", "Kansas City", "Missouri", "United States", ["tax-advisory", "fpa-consulting", "bookkeeping"], ["professional-services", "retail", "real-estate"], "Starkey & Company serves individuals, businesses, and nonprofits in and around the Kansas City metro area with tax preparation and business accounting.", "https://starkey.cpa"),
  f("adamsbrown-kc", "Adams Brown", "Team", "kansas-city", "Kansas City", "Missouri", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "manufacturing", "real-estate"], "Adams Brown is a Kansas City and Overland Park CPA firm providing audit, advisory, outsourced accounting, payroll, tax, technology, and wealth management services.", "https://www.adamsbrowncpa.com"),
  f("amcpa-kc", "AM CPA Kansas City", "Team", "kansas-city", "Kansas City", "Missouri", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "AM CPA is a Kansas City accounting firm described as a partner invested in client success for KC tax experts and accountants.", "https://amcpakc.com"),
  f("mize-kc", "Mize CPAs", "Team", "kansas-city", "Kansas City", "Missouri", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "manufacturing", "retail", "real-estate"], "Mize CPAs is a Kansas City metro CPA firm providing tax, audit, and advisory services to middle-market businesses.", "https://www.mizecpas.com"),
  f("mazuma-kc", "Mazuma USA", "Team", "kansas-city", "Kansas City", "Missouri", "United States", ["bookkeeping", "tax-advisory", "fpa-consulting"], ["professional-services", "retail", "technology"], "Mazuma USA is a Kansas City-based accounting firm providing bookkeeping and tax services to small businesses nationwide.", "https://mazumausa.com"),
  f("marks-nelson-kc", "Marks Nelson", "Team", "kansas-city", "Kansas City", "Missouri", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["real-estate", "manufacturing", "professional-services"], "Marks Nelson is a Kansas City CPA and advisory firm providing tax, audit, and consulting services to privately held businesses across the Midwest.", "https://marksnelson.cpa"),
  f("mayer-hoffman-kc", "Mayer Hoffman McCann - Kansas City", "Team", "kansas-city", "Kansas City", "Missouri", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "healthcare"], "Mayer Hoffman McCann is a Kansas City-headquartered national CPA firm providing audit and attestation services to businesses across the U.S.", "https://www.mhmcpa.com"),
  f("bkd-kc", "FORVIS Mazars - Kansas City", "Team", "kansas-city", "Kansas City", "Missouri", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["manufacturing", "healthcare", "real-estate"], "FORVIS Mazars (formerly BKD) is a top-10 national CPA firm with a Kansas City office providing tax, audit, and advisory services.", "https://forvismazars.us/about-us/locations/kansas-city-mo"),

  // ── Raleigh ─────────────────────────────────────────────────────────
  f("ncllcpa-raleigh", "NC LLC CPA Raleigh", "Team", "raleigh", "Raleigh", "North Carolina", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "NC LLC CPA is a Raleigh, NC full-service CPA firm offering professional accounting and tax services for non-profits and small to medium-sized businesses.", "https://ncllcpa.com"),
  f("carson-thorn-raleigh", "C.E. Thorn CPA", "Team", "raleigh", "Raleigh", "North Carolina", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "C.E. Thorn, CPA, PLLC has provided accounting services for Raleigh small business owners for 30+ years, offering bookkeeping and tax preparation services.", "https://www.carsonthorncpa.com"),
  f("eberry-cpa-raleigh", "Elizabeth C. Berry CPA", "Elizabeth C. Berry", "raleigh", "Raleigh", "North Carolina", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Elizabeth C. Berry CPA, PLLC is a Raleigh, NC full-service tax, accounting, and business consulting firm.", "https://www.eberrycpa.com"),
  f("wapner-raleigh", "Wapner Presley CPA", "Team", "raleigh", "Raleigh", "North Carolina", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Wapner Presley is a Raleigh, NC CPA firm providing accounting and tax services to local businesses and individuals.", "https://www.wapnerpresley.com"),
  f("gwi-raleigh", "GWI Tax & Accounting", "Team", "raleigh", "Raleigh", "North Carolina", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "retail", "real-estate"], "GWI Tax & Accounting has 25+ years in eastern North Carolina working with entrepreneurs of closely held businesses offering tax, small business services, assurance, and consulting.", "https://www.gwitax.com"),
  f("vini-raleigh", "Vini CPA Raleigh", "Team", "raleigh", "Raleigh", "North Carolina", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Vini CPA is a Raleigh, Cary, Apex, and Holly Springs tax, accounting, and payroll firm.", "https://vinicpa.com"),
  f("dunn-associates-raleigh", "Dunn & Associates CPAs", "Team", "raleigh", "Raleigh", "North Carolina", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Dunn & Associates, CPAs, PLLC is a full-service CPA firm licensed in NC offering accounting services for business owners and independent professionals in Raleigh and Smithfield.", "https://ddocpas.tax"),
  f("batchelor-tillery-raleigh", "Batchelor Tillery & Roberts", "Team", "raleigh", "Raleigh", "North Carolina", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "manufacturing"], "Batchelor Tillery & Roberts is a Raleigh CPA firm providing tax, audit, and advisory services to closely held businesses.", "https://www.btrcpa.com"),
  f("hughes-pittman-raleigh", "Hughes Pittman & Gupton", "Team", "raleigh", "Raleigh", "North Carolina", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["technology", "life-sciences", "professional-services"], "Hughes Pittman & Gupton is a Raleigh, NC CPA firm providing tax, audit, and advisory services to technology, life sciences, and professional service firms.", "https://www.hpg.com"),
  f("thomas-judy-raleigh", "Thomas Judy & Tucker", "Team", "raleigh", "Raleigh", "North Carolina", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "construction", "healthcare"], "Thomas, Judy & Tucker is a Raleigh, NC CPA firm providing tax, audit, and advisory services to middle-market businesses.", "https://www.tjtpa.com"),

  // ── Richmond ────────────────────────────────────────────────────────
  f("keiter-rva", "Keiter CPAs", "Team", "richmond", "Richmond", "Virginia", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "private-equity"], "Keiter CPAs provides business tax, audit, advisory, and valuation services in Richmond, VA to high-income families, privately held businesses, and their owners.", "https://keitercpa.com"),
  f("garner-rva", "Garner Adams Associates", "Team", "richmond", "Richmond", "Virginia", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Garner, Adams & Associates, PLLC is a Richmond Virginia West End Short Pump full-service accounting and tax firm providing viable solutions for individuals and business owners.", "https://www.garnercpa.com"),
  f("rmw-rva", "RMW Accounting", "Team", "richmond", "Richmond", "Virginia", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "RMW Accounting has served Richmond clients for 30+ years with exceptional service to small businesses and individuals.", "https://rmwaccounting.com"),
  f("g4-rva", "G4 CPA Firm", "Team", "richmond", "Richmond", "Virginia", "United States", ["tax-advisory", "fpa-consulting", "bookkeeping"], ["professional-services", "retail", "real-estate"], "G4 CPA Firm, Inc. provides the best tax, accounting, consulting, and financial planning services in the Richmond area for individuals and small businesses.", "https://www.g4cpa.com"),
  f("paramount-rva", "Paramount Tax & Accounting Richmond", "Team", "richmond", "Richmond", "Virginia", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Paramount's team of CPAs and licensed tax professionals offer CPA and tax preparation services in Richmond, VA to individuals and businesses.", "https://paramountcpa.com/richmond"),
  f("kwc-rva", "KWC CPAs", "Team", "richmond", "Richmond", "Virginia", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "manufacturing"], "KWC Certified Public Accountants is a Richmond-area CPA firm providing tax, audit, and advisory services.", "https://www.kwccpa.com"),
  f("wall-einhorn-rva", "Wall Einhorn & Chernitzer", "Team", "richmond", "Richmond", "Virginia", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "manufacturing"], "Wall, Einhorn & Chernitzer is a Virginia CPA firm with a Richmond presence providing tax, audit, and advisory services.", "https://www.wec.cpa"),
  f("robinson-farmer-rva", "Robinson Farmer Cox", "Team", "richmond", "Richmond", "Virginia", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "construction"], "Robinson, Farmer, Cox Associates is a Virginia CPA firm with a Richmond office providing audit, tax, and advisory services to governmental, nonprofit, and private sector clients.", "https://www.rfca.com"),
  f("harris-harvey-rva", "Harris Hardy & Johnstone", "Team", "richmond", "Richmond", "Virginia", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "manufacturing"], "Harris Hardy & Johnstone is a Richmond, VA CPA firm providing tax, audit, and advisory services to businesses and individuals.", "https://hhjcpa.com"),
  f("creedle-rva", "Creedle, Jones & Associates", "Team", "richmond", "Richmond", "Virginia", "United States", ["tax-advisory", "fpa-consulting", "bookkeeping"], ["professional-services", "retail", "real-estate"], "Creedle, Jones & Associates is a Richmond, VA CPA firm providing tax, accounting, and advisory services to small and mid-sized businesses.", "https://creedlejones.com"),

  // ── Salt Lake City ──────────────────────────────────────────────────
  f("butler-tax-slc", "Butler Tax & Accounting", "Team", "salt-lake-city", "Salt Lake City", "Utah", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Butler Tax & Accounting is a Salt Lake City tax accounting firm at 5959 S. Redwood Road providing tax and accounting services to Utah businesses.", "https://www.butlertax.com"),
  f("klingler-slc", "Klingler & Associates", "Team", "salt-lake-city", "Salt Lake City", "Utah", "United States", ["tax-advisory", "bookkeeping", "controller-services"], ["professional-services", "retail", "real-estate"], "Klingler & Associates is a Salt Lake City CPA firm founded in 1976 offering small and medium business tax, accounting, and payroll services with CPA quality at bookkeeper rates.", "https://klinglercpa.com"),
  f("cmp-slc", "CMP Utah", "Team", "salt-lake-city", "Salt Lake City", "Utah", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "retail", "real-estate"], "CMP is a nationwide full-service award-winning Utah CPA firm for individuals and small businesses with offices in Layton, Logan, and St. George.", "https://cmp.cpa"),
  f("highimpact-slc", "High Impact CPA", "Team", "salt-lake-city", "Salt Lake City", "Utah", "United States", ["fractional-cfo", "bookkeeping", "tax-advisory"], ["professional-services", "retail", "real-estate"], "High Impact CPA provides outsourced CFO (fractional CFO), monthly bookkeeping, financial reporting, cash flow forecasting, tax preparation, and proactive tax planning for Salt Lake City small businesses.", "https://highimpactcpa.com"),
  f("squire-slc", "Squire & Company", "Team", "salt-lake-city", "Salt Lake City", "Utah", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "manufacturing"], "Squire has been Utah's trusted accounting partner for 50 years and is honored as a 2026 Firm to Watch and Mountain West Regional Partner, serving Orem and Salt Lake City.", "https://www.squire.com"),
  f("hawkins-slc", "Hawkins Advisors", "Team", "salt-lake-city", "Salt Lake City", "Utah", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "technology"], "Hawkins Advisors is a Salt Lake City CPA firm providing tax, audit, and advisory services to Utah businesses.", "https://hawkinsadvisors.com"),
  f("wsrp-slc", "WSRP CPAs", "Team", "salt-lake-city", "Salt Lake City", "Utah", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["real-estate", "manufacturing", "professional-services"], "WSRP CPAs is a Salt Lake City CPA firm providing tax, audit, and advisory services to closely held businesses and high-net-worth individuals.", "https://www.wsrp.com"),
  f("eide-bailly-slc", "Eide Bailly - Salt Lake City", "Team", "salt-lake-city", "Salt Lake City", "Utah", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "healthcare", "real-estate", "manufacturing"], "Eide Bailly's Salt Lake City office provides tax, audit, consulting, and business advisory services to Utah businesses.", "https://www.eidebailly.com/locations/salt-lake-city"),
  f("pinnacle-slc", "Pinnacle Accountancy Group", "Team", "salt-lake-city", "Salt Lake City", "Utah", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Pinnacle Accountancy Group is a Salt Lake City CPA firm providing tax, accounting, and advisory services to Utah small businesses.", "https://www.pinnaclecpa.com"),
  f("cook-martin-slc", "Cook Martin Poulson", "Team", "salt-lake-city", "Salt Lake City", "Utah", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "manufacturing"], "Cook Martin Poulson is a Utah CPA firm with a Salt Lake City office providing tax, audit, and advisory services.", "https://www.cookmartin.com"),

  // ── Seattle ─────────────────────────────────────────────────────────
  f("seattle-tax-group", "Seattle Tax Group", "Team", "seattle", "Seattle", "Washington", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["technology", "professional-services", "real-estate"], "Seattle Tax Group LLC helps individuals and business owners with tax and accounting services across Seattle, serving technology professionals at Amazon, Microsoft, Google, Facebook, and Boeing.", "https://www.seattletaxgroup.com"),
  f("huddleston-sea", "Huddleston Tax CPAs", "Team", "seattle", "Seattle", "Washington", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Huddleston Tax CPAs is a Seattle CPA firm specializing in helping small businesses and individuals with complex financial matters including business coaching, profits, forecasts, and cash flow.", "https://huddlestontaxcpas.com"),
  f("aldaris-sea", "Aldaris CPA", "Team", "seattle", "Seattle", "Washington", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Aldaris CPA Group offers tax, accounting, and advisory services to individuals and business clients in Seattle and Northwest Washington with proactive tax strategy and corporate structure planning.", "https://aldariscpa.com"),
  f("haas-sea", "HAAS CPA", "Team", "seattle", "Seattle", "Washington", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "HAAS CPA, PLLC is a Seattle, WA accounting firm providing tax, bookkeeping, and advisory services to local businesses and individuals.", "https://www.haascpas.com"),
  f("nth-sea", "Nth Degree CPAs", "Team", "seattle", "Seattle", "Washington", "United States", ["fractional-cfo", "tax-advisory", "fpa-consulting"], ["professional-services", "technology", "retail"], "Nth Degree is a leading Seattle CPA firm helping business owners take control of their financial future with proprietary frameworks, expert guidance, and structured paths to financial clarity.", "https://www.nthdegreecpas.com"),
  f("raymond-lyle-sea", "Raymond Lyle CPA", "Raymond Lyle", "seattle", "Seattle", "Washington", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Raymond Lyle CPA PLLC serves individuals and businesses in Seattle, West Seattle, and Island County, WA with personalized financial services and long-term relationships.", "https://www.raymondlylecpa.com"),
  f("rlp-sea", "RLP Tax & Accounting", "Team", "seattle", "Seattle", "Washington", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "RLP Tax & Accounting, P.L.L.C. is a Seattle office of CPA and Enrolled Agent providing tax and accounting services to businesses and individuals.", "https://www.rlptax.com"),
  f("seattle-cpa-pros", "Seattle CPA Professionals", "Team", "seattle", "Seattle", "Washington", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Seattle CPA Professionals is a Seattle accounting firm providing tax and accounting services to local businesses.", "https://www.seattlecpaprofessionals.com"),
  f("clark-nuber-sea", "Clark Nuber", "Team", "seattle", "Seattle", "Washington", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["technology", "professional-services", "real-estate", "manufacturing"], "Clark Nuber is a Seattle-area top-100 CPA firm providing tax, audit, and advisory services to closely held businesses and nonprofits.", "https://clarknuber.com"),
  f("berntson-porter-sea", "Berntson Porter - Seattle", "Team", "seattle", "Seattle", "Washington", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["real-estate", "construction", "professional-services"], "Berntson Porter is a Seattle CPA and advisory firm providing tax, audit, and business consulting services with specialization in construction and real estate.", "https://bpcpa.com"),

  // ── Denver ──────────────────────────────────────────────────────────
  f("cornelius-denver", "Cornelius CPAs", "Team", "denver", "Denver", "Colorado", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["real-estate", "retail", "professional-services"], "Cornelius CPAs delivers insightful and accurate back-office and tax support to East Denver business owners, welcoming startups and small businesses in real estate, cannabis, factories, and retail.", "https://www.corneliuscpas.com"),
  f("coprotax-denver", "Colorado Pro Tax", "Team", "denver", "Denver", "Colorado", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Colorado Pro Tax provides accounting and tax services to Denver businesses and individuals.", "https://www.coprotax.com"),
  f("cpaschlanger-denver", "Matthew Schlanger CPA", "Matthew Schlanger", "denver", "Denver", "Colorado", "United States", ["fractional-cfo", "bookkeeping", "tax-advisory"], ["professional-services", "retail", "real-estate"], "Matthew Schlanger offers Denver bookkeeping services for medium to small businesses including QuickBooks and payroll services plus CFO advisory.", "https://cpaschlanger.com"),
  f("morse-denver", "John P. Morse CPA", "John P. Morse", "denver", "Denver", "Colorado", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "John P. Morse, CPA, LLC is a Denver, Colorado CPA firm providing tax, accounting, and business advisory services.", "https://www.cpamorse.com"),
  f("sba-denver", "SBA CPA", "Team", "denver", "Denver", "Colorado", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "SBA CPA is one of the largest local accounting firms in Colorado with a focus on small business owners.", "https://thesbacpa.com"),
  f("oconnor-denver", "O'Connor CPA Firm", "Team", "denver", "Denver", "Colorado", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "O'Connor CPA Firm, LLC is a Denver CPA firm providing accounting and tax services to help small businesses grow and prosper.", "https://www.oconnorcpafirm.com"),
  f("cornerstone-denver", "Cornerstone CPA Group", "Team", "denver", "Denver", "Colorado", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "construction"], "Cornerstone CPA Group PC is a Denver, CO accounting firm providing tax, audit, and advisory services.", "https://www.cornerstonecpa.com"),
  f("fraser-waldrop-denver", "Fraser, Waldrop & Company", "Team", "denver", "Denver", "Colorado", "United States", ["tax-advisory", "fpa-consulting", "bookkeeping"], ["professional-services", "retail", "real-estate"], "Fraser, Waldrop & Company CPAs Inc. plans for the future of small business clients by offering innovative accounting and tax planning strategies in Denver.", "https://fwcocpas.com"),
  f("scharmer-denver", "Scharmer CPA Group", "Team", "denver", "Denver", "Colorado", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "manufacturing"], "Scharmer CPA Group is a Denver CPA firm providing tax, audit, and advisory services to local businesses.", "https://www.scharmercpa.com"),
  f("cause-denver", "Cause CPA Advisors", "Team", "denver", "Denver", "Colorado", "United States", ["tax-advisory", "fpa-consulting", "bookkeeping"], ["professional-services", "technology", "real-estate"], "Cause CPA Advisors is a Denver CPA firm providing accounting, tax, and advisory services to mission-driven businesses.", "https://causecpa.com"),

  // ── Phoenix ─────────────────────────────────────────────────────────
  f("phxcpa", "PHX CPA", "Team", "phoenix", "Phoenix", "Arizona", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "PHX CPA is a Phoenix tax and accounting firm providing comprehensive services to Arizona businesses and individuals.", "https://www.phxcpa.com"),
  f("apex-phx", "Apex CPAs Phoenix", "Team", "phoenix", "Phoenix", "Arizona", "United States", ["tax-advisory", "fpa-consulting", "bookkeeping"], ["professional-services", "retail", "real-estate"], "Apex CPAs & Consultants helps Phoenix businesses with personalized attention and insight tailored to business needs.", "https://apexcpas.com/phoenix"),
  f("singer-phx", "Singer Tax", "Team", "phoenix", "Phoenix", "Arizona", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Singer Tax is a Phoenix, Arizona tax preparation CPA firm providing tax and accounting services.", "https://singertax.com"),
  f("lowy-phx", "Lowy Your Taxes", "Team", "phoenix", "Phoenix", "Arizona", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Lowy Your Taxes is a Phoenix CPA firm providing bookkeeping, tax planning, income tax preparation, business consulting, and QuickBooks support.", "https://www.lowyyourtaxes.com"),
  f("holly-phx", "Thomas S Holly CPA", "Thomas S. Holly", "phoenix", "Phoenix", "Arizona", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Thomas S Holly CPA PLLC is a Phoenix CPA firm providing quality accounting services, accurate bookkeeping, and balanced financial advice.", "https://www.hollycpa.com"),
  f("price-kong-phx", "Price Kong CPAs", "Team", "phoenix", "Phoenix", "Arizona", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["real-estate", "professional-services", "manufacturing"], "Price Kong is a Phoenix CPA firm providing tax, audit, and advisory services to businesses and high-net-worth individuals.", "https://www.pricekong.com"),
  f("xz-phx", "XZ CPA Phoenix", "Team", "phoenix", "Phoenix", "Arizona", "United States", ["tax-advisory", "fpa-consulting", "bookkeeping"], ["professional-services", "retail", "real-estate"], "XZ CPA is a Phoenix public accounting firm in the Desert Ridge area providing tax, accounting, and consulting services to successful businesses.", "https://xz-cpa.com"),
  f("hhcpa-phx", "H&H CPA Services", "Team", "phoenix", "Phoenix", "Arizona", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "H&H CPA provides accounting, taxes, and business consulting services in Phoenix, AZ.", "https://www.hhcpaservices.com"),
  f("henry-horne-phx", "Henry+Horne", "Team", "phoenix", "Phoenix", "Arizona", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["real-estate", "healthcare", "professional-services"], "Henry+Horne is a Phoenix and Arizona CPA firm providing tax, audit, and advisory services to middle-market businesses.", "https://www.hhcpa.com"),
  f("reddcpa-phx", "Redd Pro CPAs", "Team", "phoenix", "Phoenix", "Arizona", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Redd Pro CPAs is a Phoenix CPA firm providing tax and accounting services to Arizona businesses.", "https://www.reddcpa.com"),

  // ── Austin ──────────────────────────────────────────────────────────
  f("insogna-austin", "Insogna CPA", "Team", "austin", "Austin", "Texas", "United States", ["fractional-cfo", "tax-advisory", "controller-services"], ["professional-services", "technology", "real-estate"], "Insogna provides Austin tax planning, accounting, controller, fractional CFO, and business advisory services to business owners, entrepreneurs, and families seeking proactive financial strategy.", "https://insognacpa.com"),
  f("millan-austin", "Millan & Co CPAs", "Team", "austin", "Austin", "Texas", "United States", ["fractional-cfo", "tax-advisory", "fpa-consulting"], ["professional-services", "technology", "real-estate"], "Millan & Co. Austin CPAs provides tax strategy and CFO services with specialized 2026 tax planning expertise.", "https://millancpa.com"),
  f("ccg-austin", "CCG Accountants Austin", "Team", "austin", "Austin", "Texas", "United States", ["fractional-cfo", "tax-advisory", "bookkeeping"], ["professional-services", "retail", "real-estate"], "CCG Accountants specializes in serving small and medium businesses in Austin, Texas with bookkeeping, tax preparation, and fractional CFO services.", "https://ccgaccountants.com"),
  f("kept-austin", "Kept Pro Austin", "Team", "austin", "Austin", "Texas", "United States", ["fractional-cfo", "controller-services", "bookkeeping"], ["technology", "professional-services"], "kept.pro provides comprehensive bookkeeping and controller services and a network of fractional CFOs in Austin, TX for accurate, actionable data.", "https://www.kept.pro"),
  f("tabco-austin", "TABCo CPA Austin", "Team", "austin", "Austin", "Texas", "United States", ["fractional-cfo", "tax-advisory", "controller-services"], ["professional-services", "technology", "real-estate"], "TABCo.CPA is headquartered in Austin providing virtual accounting, CFO & controller advisory, data analytics, and tax planning services.", "https://www.tabco.cpa"),
  f("parikh-austin", "Parikh Financial", "Team", "austin", "Austin", "Texas", "United States", ["fractional-cfo", "bookkeeping", "fpa-consulting"], ["technology", "professional-services"], "Parikh Financial's expert Austin team includes bookkeepers, accountants, data analysts, and fractional CFOs who build efficient financial operations.", "https://parikhfinancial.com"),
  f("maxwell-austin", "Maxwell Locke & Ritter", "Team", "austin", "Austin", "Texas", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["technology", "real-estate", "professional-services"], "Maxwell Locke & Ritter is a leading Austin CPA and business advisory firm providing tax, audit, and advisory services to Texas businesses.", "https://mlrpc.com"),
  f("atchley-austin", "Atchley & Associates", "Team", "austin", "Austin", "Texas", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "technology"], "Atchley & Associates LLP is an Austin CPA firm providing tax, audit, and advisory services to Texas businesses and nonprofits.", "https://www.atchleycpas.com"),
  f("maxcpas-austin", "MaxCPAs Austin", "Team", "austin", "Austin", "Texas", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "MaxCPAs is an Austin, TX accounting firm providing tax and accounting services to local businesses.", "https://maxcpas.com"),
  f("seoCPA-austin", "Austin CPA Group", "Team", "austin", "Austin", "Texas", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Austin CPA Group provides tax and accounting services to Austin, Texas small businesses.", "https://austincpagroup.com"),

  // ── San Diego ───────────────────────────────────────────────────────
  f("sandiegocpas", "San Diego CPA Corp", "Team", "san-diego", "San Diego", "California", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "San Diego CPA is a professional tax and accountancy corporation at 5703 Oberlin Dr providing full-service tax, accounting, and business consulting in San Diego.", "https://www.sandiegocpas.com"),
  f("abbo-tax-sd", "Abbo Tax CPA", "Team", "san-diego", "San Diego", "California", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Abbo Tax CPA is a San Diego CPA firm specializing in tax preparation and accounting for existing and new business owners and entrepreneurs.", "https://www.abbotax.com"),
  f("regal-sd", "Regal Group CPA", "Team", "san-diego", "San Diego", "California", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Regal Group CPA is a skilled San Diego CPA firm providing tailored financial guidance to small and midsize businesses and individuals with tax preparation services.", "https://www.regalgroupcpa.com"),
  f("paul-anderson-sd", "Paul Anderson CPA", "Paul Anderson", "san-diego", "San Diego", "California", "United States", ["bookkeeping", "tax-advisory", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Paul Anderson CPA offers affordable San Diego bookkeeping services to small businesses with a full range of tax preparation and accounting services.", "https://sdbookkeepingsolutions.com"),
  f("cpafirm-sd", "San Diego CPA Accounting", "Team", "san-diego", "San Diego", "California", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "San Diego CPA Accounting is a San Diego CPA firm providing tax and accounting services to local businesses.", "https://www.cpafirm-sandiego.com"),
  f("teh-sd", "TEH CPA San Diego", "Team", "san-diego", "San Diego", "California", "United States", ["fractional-cfo", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "TEH CPA is a San Diego small business accounting firm offering CFO consulting and full-service accounting for local businesses.", "https://tehcpa.net"),
  f("launch-sd", "Launch CPA", "Team", "san-diego", "San Diego", "California", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["technology", "professional-services", "retail"], "Launch CPA was founded in San Diego and now serves businesses in major California hubs including Los Angeles with tax preparation, bookkeeping, and financial consulting.", "https://launchcpa.com"),
  f("huckabee-sd", "Huckabee CPA La Jolla", "Team", "san-diego", "San Diego", "California", "United States", ["fractional-cfo", "tax-advisory", "fpa-consulting"], ["technology", "professional-services", "real-estate"], "Huckabee CPA is a La Jolla, CA firm providing accounting, financial reporting, tax, and CFO advisory services to San Diego startups and small businesses.", "https://huckabeecpa.com"),
  f("morey-sd", "Morey CPA & Associates", "Team", "san-diego", "San Diego", "California", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Morey CPA & Associates, Inc. provides accounting services and tax planning for small businesses in San Diego.", "https://www.moreycpasd.com"),
  f("considine-sd", "Considine & Considine", "Team", "san-diego", "San Diego", "California", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "manufacturing"], "Considine & Considine is a San Diego CPA firm providing tax, audit, and advisory services to closely held businesses.", "https://www.cccpa.com"),

  // ── Minneapolis ─────────────────────────────────────────────────────
  f("scottreid-mpl", "Scott Reid CPAs", "Team", "minneapolis", "Minneapolis", "Minnesota", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Scott Reid CPAs is a Minneapolis CPA firm offering accounting, tax, and business advisory services to small businesses and individuals throughout the Twin Cities.", "https://www.scottreidcpa.com"),
  f("jak-mpl", "JAK CPA", "Team", "minneapolis", "Minneapolis", "Minnesota", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "JAK is a Minneapolis and St. Paul accounting and CPA firm offering tax preparation services to small businesses.", "https://jakcpa.com"),
  f("rocca-mpl", "Rocca CPA", "Team", "minneapolis", "Minneapolis", "Minnesota", "United States", ["fractional-cfo", "tax-advisory", "fpa-consulting"], ["professional-services", "technology", "retail"], "Rocca CPA is a top-rated Minneapolis tax and accounting firm offering tax planning and prep, small business and startup accounting, and fractional CFO services.", "https://www.roccacpa.com"),
  f("carpenter-mpl", "Carpenter Evert & Associates", "Team", "minneapolis", "Minneapolis", "Minnesota", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "retail", "real-estate"], "Carpenter, Evert & Associates is a Twin Cities, MN firm specializing in business advising and tax services with tax planning, compliance, and financial strategy throughout the business lifecycle.", "https://www.carpenterevert.com"),
  f("rapacki-mpl", "Rapacki + Co", "Team", "minneapolis", "Minneapolis", "Minnesota", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Rapacki + Co. is a trusted Edina-based accounting firm dedicated to helping individuals and small Minneapolis businesses navigate taxes, retirement planning, financial statements, and long-term strategy.", "https://rapacki.com"),
  f("ab-mpl", "Abdo Mpl", "Team", "minneapolis", "Minneapolis", "Minnesota", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "manufacturing", "real-estate"], "AB CPA is a Twin Cities, MN accounting firm providing audit, tax, and advisory services to businesses and individuals.", "https://www.ab.cpa"),
  f("boyum-mpl", "Boyum Barenscheer", "Team", "minneapolis", "Minneapolis", "Minnesota", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["manufacturing", "professional-services", "real-estate"], "Boyum Barenscheer is a top Minneapolis CPA and business advisory firm providing tax, audit, and consulting services to middle-market businesses.", "https://myboyum.com"),
  f("knutson-mpl", "John A. Knutson & Co", "Team", "minneapolis", "Minneapolis", "Minnesota", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "manufacturing"], "John A. Knutson & Co., PLLP is a Twin Cities-based accounting firm serving individuals and businesses throughout Minnesota and the Upper Midwest since 1925.", "https://knutson-cpa.com"),
  f("cliftonlarson-mpl", "CliftonLarsonAllen - Minneapolis", "Team", "minneapolis", "Minneapolis", "Minnesota", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "healthcare"], "CliftonLarsonAllen is a top-10 US CPA firm headquartered in Minneapolis providing audit, tax, advisory, and outsourced accounting services.", "https://www.claconnect.com/en/locations/minnesota/offices/cla-minneapolis"),
  f("lehrman-mpl", "Lehrman Accounting", "Team", "minneapolis", "Minneapolis", "Minnesota", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Lehrman Accounting is a Minneapolis CPA firm providing tax and accounting services to local businesses.", "https://lehrmancpa.com"),
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
function extractEmail(text, preferredDomain) {
  if (!text) return null;
  const matches = [...new Set(text.match(EMAIL_RX) || [])];
  const valid = matches.filter((e) => !BAD_PREFIX.test(e) && !BAD_DOMAIN.test(e));
  if (!valid.length) return null;
  if (preferredDomain) { const local = valid.find((e) => e.toLowerCase().endsWith('@' + preferredDomain)); if (local) return local; }
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

  console.log(`\nHEAD checking ${passed.length}...`);
  const alive = await pmap(passed, 10, async (c) => (await headCheck(c.website)) ? c : null);
  const live = alive.filter(Boolean);
  console.log(`  ${live.length}/${passed.length} returned 2xx/3xx`);
  for (const c of passed) if (!live.includes(c)) console.log(`  ☠ [${c.city}] ${c.name} — ${c.website}`);

  console.log(`\nFetching emails for ${live.length}...`);
  const withEmail = await pmap(live, 8, async (c) => ({ ...c, email: await findEmail(c.website) }));
  const emailCount = withEmail.filter((x) => x.email).length;
  console.log(`  ${emailCount}/${withEmail.length} found email`);

  const toInsert = withEmail.slice(0, 100).map((c) => ({
    slug: c.slug, name: c.name, contact: c.contact || null, title: null, email: c.email || null,
    city: c.city, city_label: c.cityLabel, province: c.province, country: c.country,
    services: c.services || [], industries: c.industries || [],
    description: c.description || null, website: c.website || null,
    plan: 'free', priority_score: 0, status: 'active',
    submitted_by: 'admin', source: 'claude_code',
  }));

  console.log(`\nInserting ${toInsert.length}...`);
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

  console.log('\n── Ending counts ──');
  const cities = [...new Set(CANDIDATES.map((c) => c.city))];
  for (const city of cities) {
    const { count } = await sb.from('firms').select('*', { count: 'exact', head: true }).eq('city', city).eq('status', 'active');
    console.log(`  ${city.padEnd(16)} ${count}`);
  }
  const { count: total } = await sb.from('firms').select('*', { count: 'exact', head: true }).eq('status', 'active');
  console.log(`\nTotal active firms: ${total}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
