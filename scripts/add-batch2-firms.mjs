#!/usr/bin/env node
/**
 * Batch 2: Add 100 firms to Las Vegas, Atlanta, Sacramento, Omaha, Oklahoma City, Birmingham.
 * Pipeline:
 *   1. Load dedup set of existing firms (names + root domains).
 *   2. Drop candidates that are already duplicates (no network call).
 *   3. HEAD-check remaining candidate homepages in parallel.
 *   4. For those returning 200, fetch homepage + /contact + /about to extract email.
 *   5. Batch-insert into Supabase.
 */
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
  // ── Las Vegas (16) ─────────────────────────────────────────────────
  f("mark-sherman-cpa-lv", "Mark Sherman CPA", "Mark Sherman", "las-vegas", "Las Vegas", "Nevada", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "real-estate", "retail", "healthcare"], "Mark Sherman CPA is a leading Las Vegas accounting firm led by a team of CPAs, tax experts, and financial planners specializing in small business incorporation, tax minimization, and deductions.", "https://shermancpas.com"),
  f("allison-archer-cpa-lv", "Allison Archer CPA", "Allison Archer", "las-vegas", "Las Vegas", "Nevada", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Allison Archer, CPA LLC is a Las Vegas accounting firm providing a broad range of tax, accounting, and business advisory services to individuals and small businesses.", "https://www.aarchercpa.com"),
  f("adam-hodson-cpa-lv", "Adam Hodson CPA", "Adam Hodson", "las-vegas", "Las Vegas", "Nevada", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Adam Hodson CPA is a Las Vegas trusted partner for small business tax strategy, QuickBooks-ready tax preparation, wealth planning, and entity and accounting system setup.", "https://adamhodsoncpa.com"),
  f("kim-walker-cpa-lv", "Kim Walker CPA", "Kim Walker", "las-vegas", "Las Vegas", "Nevada", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Kim Walker CPA has over 45 years of public accounting experience representing the small business community of Southern Nevada with specific accounting and tax expertise.", "https://kimwalkercpa.com"),
  f("ascend-cpas-lv", "Ascend CPAs & Advisors", "Team", "las-vegas", "Las Vegas", "Nevada", "United States", ["fractional-cfo", "tax-advisory", "fpa-consulting"], ["professional-services", "technology", "retail", "real-estate"], "Ascend CPAs & Advisors is a full-service Las Vegas accounting firm serving clients throughout Nevada and the United States with tax, accounting, and advisory services.", "https://ascendcpas.com"),
  f("bloom-cpa-lv", "Bloom CPA", "Team", "las-vegas", "Las Vegas", "Nevada", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "technology"], "Bloom CPA is a Las Vegas CPA firm providing personal and business accounting, tax, and advisory services to Nevada individuals and business owners.", "https://www.bloomcpa.io"),
  f("centennial-cpa-lv", "Centennial CPA", "Team", "las-vegas", "Las Vegas", "Nevada", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate", "healthcare"], "Centennial CPA is a trusted Las Vegas partner for tax, accounting, and advisory services at their 7251 West Lake Mead Blvd office, serving Summerlin, Centennial Hills, Henderson, North Las Vegas, and Spring Valley.", "https://www.centennialhillscpa.com"),
  f("katherine-lei-cpa-lv", "Katherine Lei CPA", "Katherine Lei", "las-vegas", "Las Vegas", "Nevada", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "real-estate", "retail"], "Katherine Lei CPA, PLLC offers accounting, tax preparation, and advisory services in Las Vegas, Henderson, and Summerlin, NV.", "https://www.katherineleicpa.com"),
  f("rws-cpa-lv", "RWS CPA", "Team", "las-vegas", "Las Vegas", "Nevada", "United States", ["bookkeeping", "tax-advisory", "controller-services"], ["professional-services", "retail", "real-estate"], "RWS CPA provides bookkeeping, accounting, tax, and advisory services in Summerlin, Las Vegas, NV for small businesses and individuals.", "https://www.rws-cpa.com"),
  f("sj-meyer-lv", "S. J. Meyer & Company", "Team", "las-vegas", "Las Vegas", "Nevada", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "retail", "real-estate", "construction"], "S. J. Meyer & Company has been providing expert business accounting and auditing since 1990, serving the Las Vegas Valley including Summerlin and Henderson.", "https://sjmeyer.org"),
  f("torchlight-tax-henderson", "Torchlight Tax and Financial Solutions", "Team", "las-vegas", "Las Vegas", "Nevada", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Torchlight Tax and Financial Solutions was founded with a focus on quality tax services, offering tax preparation and financial services to individuals and businesses in Henderson, NV.", "https://torchlighttax.com"),
  f("kondler-cpa-lv", "Kondler & Associates", "Team", "las-vegas", "Las Vegas", "Nevada", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate", "hospitality"], "Kondler & Associates is a certified public accountants firm in Las Vegas providing accounting, bookkeeping, tax preparation, and business advisory services.", "https://kondlercpa.com"),
  f("gerety-cpa-lv", "Gerety and Associates CPAs", "Team", "las-vegas", "Las Vegas", "Nevada", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "retail", "real-estate", "hospitality"], "Gerety and Associates CPAs is a full-service tax, accounting, and business consulting firm in Las Vegas, NV, working with thousands of closely held businesses for over 42 years.", "https://www.geretycpa.com"),
  f("cpa-financial-architects-lv", "CPA Financial Architects", "Team", "las-vegas", "Las Vegas", "Nevada", "United States", ["tax-advisory", "fpa-consulting", "bookkeeping"], ["professional-services", "real-estate", "retail"], "CPA Financial Architects provides a full range of tax, business, and financial services in the Las Vegas and Henderson areas.", "https://cpaarchitects.com"),
  f("elite-way-cpas-lv", "Elite Way CPAs", "Team", "las-vegas", "Las Vegas", "Nevada", "United States", ["fractional-cfo", "tax-advisory", "bookkeeping"], ["professional-services", "retail", "real-estate", "technology"], "Elite Way CPAs is a unique, boutique CPA firm in Las Vegas founded with the idea that there is a better way to help clients with their accounting and tax challenges.", "https://elitewaycpas.com"),
  f("pbtk-cpa-lv", "Piercy Bowler Taylor & Kern", "Team", "las-vegas", "Las Vegas", "Nevada", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["hospitality", "real-estate", "professional-services", "manufacturing"], "Piercy Bowler Taylor & Kern is a Las Vegas accounting firm providing audit, tax, and advisory services to the gaming, hospitality, and real estate industries.", "https://pbtk.com"),

  // ── Atlanta (19) ───────────────────────────────────────────────────
  f("virtue-cpas-atlanta", "Virtue CPAs", "Team", "atlanta", "Atlanta", "Georgia", "United States", ["fractional-cfo", "tax-advisory", "fpa-consulting"], ["professional-services", "technology", "real-estate", "retail"], "Virtue CPAs is an Atlanta business and financial advisory firm providing expert fractional financial leadership and strategic planning without the cost of a full-time executive.", "https://virtuecpas.com"),
  f("bennett-thrasher-atlanta", "Bennett Thrasher", "Team", "atlanta", "Atlanta", "Georgia", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "technology", "manufacturing"], "Bennett Thrasher strives to be a different kind of Atlanta accounting firm with values of integrity and family, offering tax, audit, advisory, and operational solutions.", "https://www.btcpa.net"),
  f("atag-cpa-atlanta", "Accounting & Tax Advisory Group", "Team", "atlanta", "Atlanta", "Georgia", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "real-estate", "retail"], "Accounting & Tax Advisory Group LLC has offices in Alpharetta and Sandy Springs, serving Atlanta businesses with tax, accounting, and advisory services.", "https://www.atagcpa.com"),
  f("fricke-cpa-atlanta", "Fricke & Associates", "Team", "atlanta", "Atlanta", "Georgia", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "manufacturing", "healthcare"], "Fricke & Associates are certified public accountants providing accounting, audit, tax, and business advisory services to individuals and privately owned firms in Atlanta, Marietta, and Peachtree Corners.", "https://frickecpa.com"),
  f("wbl-cpas-atlanta", "WBL CPAs + Advisors", "Team", "atlanta", "Atlanta", "Georgia", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "technology", "private-equity"], "WBL CPAs + Advisors is an award-winning Atlanta CPA firm in operation since 1982, offering audit, accounting, advisory, transaction, family office, and tax services.", "https://wblcpa.com"),
  f("atlanta-cpa", "Johnson Financial Services (Atlanta CPA)", "Team", "atlanta", "Atlanta", "Georgia", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Johnson Financial Services is an Atlanta CPA firm in Buckhead and Loganville providing accounting, tax, and financial management services tailored to various industries.", "https://www.atlanta-cpa.com"),
  f("carter-company-atlanta", "Carter & Company CPA", "Team", "atlanta", "Atlanta", "Georgia", "United States", ["fractional-cfo", "tax-advisory", "bookkeeping"], ["professional-services", "real-estate", "retail"], "Carter & Company is an Atlanta tax and accounting CPA firm offering fractional CFO services alongside tax, accounting, and advisory for small and mid-sized businesses.", "https://www.cartercompanycpa.com"),
  f("pereira-cpa-atlanta", "Pereira and Company CPA", "Team", "atlanta", "Atlanta", "Georgia", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "real-estate", "retail"], "Pereira and Company, CPA is a Marietta local CPA firm dedicated to helping individuals and small business owners manage their financial lives with confidence.", "https://mariettacpa.net"),
  f("barnett-stegall-atlanta", "Barnett & Stegall", "Team", "atlanta", "Atlanta", "Georgia", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "real-estate", "retail"], "Barnett & Stegall, LLC is a Marietta, GA full-service tax, accounting, and business consulting firm serving the Atlanta metro area.", "https://www.barnettstegall.com"),
  f("massey-cpa-atlanta", "Massey and Company CPA", "Team", "atlanta", "Atlanta", "Georgia", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "real-estate", "retail", "healthcare"], "Massey and Company CPA is an Atlanta firm providing tax services, accounting, and financial advisory for small businesses and individuals in the Atlanta area.", "https://masseyandcompanycpa.com"),
  f("savemytax-atlanta", "Tax & Accounting Advisors", "Team", "atlanta", "Atlanta", "Georgia", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Tax & Accounting Advisors is an Atlanta-area CPA firm providing comprehensive tax, accounting, and advisory services to individuals and businesses.", "https://savemytax.com"),
  f("thompson-atlanta", "Thompson & Associates CPAs", "Team", "atlanta", "Atlanta", "Georgia", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "real-estate", "retail"], "Thompson & Associates CPAs is a Roswell, GA full-service tax, accounting, business consulting, and tax relief firm serving the greater Atlanta area.", "https://www.atlantacpas.com"),
  f("killingsworth-spencer-atlanta", "Killingsworth Spencer", "Team", "atlanta", "Atlanta", "Georgia", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "real-estate", "retail"], "Killingsworth Spencer is a Roswell, Georgia CPA firm providing tax preparation, accounting, bookkeeping, and IRS resolution services across the Atlanta metro.", "https://www.killingsworthspencerllc.com"),
  f("mma-cpa-atlanta", "MMA CPA Decatur", "Team", "atlanta", "Atlanta", "Georgia", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "real-estate", "retail"], "MMA CPA is a Decatur, GA CPA firm on Clairemont Avenue providing accounting and tax services to businesses and individuals in the Atlanta area.", "https://www.mmacpapro.com"),
  f("burge-cpa-atlanta", "Burge & Associates", "Team", "atlanta", "Atlanta", "Georgia", "United States", ["tax-advisory", "fpa-consulting", "bookkeeping"], ["professional-services", "real-estate", "retail"], "Burge & Associates, P.C. is a Decatur, GA full-service certified public accounting firm licensed in Georgia providing tax, accounting, and advisory services.", "https://www.burgecpa.com"),
  f("cbt-cpa-atlanta", "Carmichael, Brasher, Tuvell & Company", "Team", "atlanta", "Atlanta", "Georgia", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "manufacturing", "healthcare"], "Carmichael, Brasher, Tuvell & Company is an Atlanta CPA firm providing tax, audit, and advisory services to businesses and individuals.", "https://www.cbtcpa.com"),
  f("bowen-cpa-atlanta", "Thomas Bowen CPA", "Thomas Bowen", "atlanta", "Atlanta", "Georgia", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "real-estate", "retail"], "Thomas Bowen CPA is a full-service CPA firm licensed in Georgia serving Roswell, Alpharetta, Dunwoody, Sandy Springs, and the surrounding Atlanta metro areas.", "https://bowencpa.net"),
  f("padgett-marietta-atlanta", "Padgett Marietta", "Team", "atlanta", "Atlanta", "Georgia", "United States", ["bookkeeping", "tax-advisory", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Padgett Marietta's certified professional accountants provide guidance and support to Atlanta-area entrepreneurs with accounting, tax, and business advisory services.", "https://marietta.padgettadvisors.com"),
  f("appletree-business-atlanta", "Appletree Business Services", "Team", "atlanta", "Atlanta", "Georgia", "United States", ["fractional-cfo", "bookkeeping", "tax-advisory"], ["professional-services", "retail", "real-estate"], "Appletree Business Services is a comprehensive Atlanta accounting firm offering bookkeeping, tax preparation, payroll, financial analysis, and fractional CFO services.", "https://appletreebusiness.com"),
  f("sagestonecfo-cobb", "Dark Horse Atlanta", "Team", "atlanta", "Atlanta", "Georgia", "United States", ["fractional-cfo", "tax-advisory", "bookkeeping"], ["professional-services", "technology", "retail"], "Dark Horse CPAs Atlanta combines bookkeeping, tax compliance, and fractional CFO-level advisory for Atlanta-area businesses with an office in Roswell.", "https://darkhorse.cpa/atlanta-cpa-firm/"),

  // ── Sacramento (19) ────────────────────────────────────────────────
  f("jd-tax-sacramento", "JD Tax and Accounting", "Team", "sacramento", "Sacramento", "California", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "real-estate", "retail"], "JD Tax and Accounting is a full-service Sacramento tax, accounting, and business consulting firm serving individuals and small businesses.", "https://www.sacramentotaxes.com"),
  f("zerotaxman-sacramento", "ZeroTaxMan CPA", "Team", "sacramento", "Sacramento", "California", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "real-estate", "retail"], "ZeroTaxMan is a Sacramento CPA firm providing accounting and tax services with a focus on tax reduction strategies for individuals and businesses.", "https://www.zerotaxman.com"),
  f("bulletprooftax-sacramento", "Bulletproof Tax", "Team", "sacramento", "Sacramento", "California", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "real-estate", "retail"], "Bulletproof Tax is a Sacramento and Roseville tax accountant providing tax preparation and planning services to individuals and small businesses.", "https://www.bulletprooftax.com"),
  f("watsontax-sacramento", "Watson Tax CPA", "Team", "sacramento", "Sacramento", "California", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "real-estate", "retail"], "Watson Tax is a Sacramento CPA firm offering accounting and tax services to smaller businesses and individuals since 1992.", "https://watsontaxcpa.com"),
  f("kilgore-cpa-sacramento", "Kilgore & Co.", "Team", "sacramento", "Sacramento", "California", "United States", ["fractional-cfo", "tax-advisory", "bookkeeping"], ["professional-services", "real-estate", "retail"], "Kilgore & Co. Accountancy is a full-service consulting and accounting firm founded in 1985 serving Folsom, Carmichael, Davis, Elk Grove, Rocklin, Roseville, Fair Oaks, and Sacramento Valley with outsourced controllership and CFO services.", "https://www.kilgorecpa.com"),
  f("carothers-cpa-sacramento", "Carothers and Associates", "Team", "sacramento", "Sacramento", "California", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "real-estate", "retail"], "Carothers and Associates, Inc. is a California-licensed CPA/EA firm based in Roseville providing expert tax preparation for individuals, retirees, rental property owners, investors, and trusts.", "https://www.carotherscpa.com"),
  f("devant-cpa-sacramento", "Devant CPA", "Team", "sacramento", "Sacramento", "California", "United States", ["fractional-cfo", "tax-advisory", "fpa-consulting"], ["professional-services", "real-estate", "retail", "technology"], "Devant CPA is a Northern California CPA firm serving Sacramento, Roseville, and beyond with tax planning, business advisory, bookkeeping, and strategic financial advice.", "https://www.devantcpa.com"),
  f("nicholson-olson-sacramento", "Nicholson & Olson CPAs", "Team", "sacramento", "Sacramento", "California", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "retail"], "Nicholson & Olson, Certified Public Accountants have been dedicated to serving a wide variety of clients in the greater Sacramento area since 1981.", "https://www.nicholsonolson.com"),
  f("fitzpatrick-casimiro-sacramento", "Fitzpatrick & Casimiro CPAs", "Team", "sacramento", "Sacramento", "California", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "real-estate", "retail"], "Fitzpatrick & Casimiro, CPAs, Inc. is a Sacramento CPA firm providing comprehensive accounting, tax, and advisory services to businesses and individuals.", "https://www.fitzpatrickcpas.com"),
  f("richardson-cpas-sacramento", "Richardson CPAs", "Team", "sacramento", "Sacramento", "California", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "real-estate", "retail"], "Richardson CPAs is a Sacramento-area accounting firm providing tax, accounting, and advisory services to local businesses and individuals.", "https://richardsoncpas.com"),
  f("cpa-firm-sacramento", "CPA Firm Sacramento", "Team", "sacramento", "Sacramento", "California", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "retail"], "CPA Firm Sacramento provides tax, audit, and advisory services to businesses in the Sacramento region.", "https://cpafirmsacramento.com"),
  f("cramer-cpa-sacramento", "Cramer & Associates CPA", "Team", "sacramento", "Sacramento", "California", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "real-estate", "retail"], "Cramer & Associates is a Rocklin CPA firm providing tax preparation, college savings, retirement and estate planning, wealth management, IRS representation, business advisor services, QuickBooks, and bookkeeping.", "https://www.cramercpa.com"),
  f("cal-tax-boutique-sacramento", "California Tax Boutique", "Team", "sacramento", "Sacramento", "California", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "real-estate", "retail"], "California Tax Boutique specializes in tax preparation and planning for individuals, businesses, and trusts in the Sacramento area.", "https://www.doesmytaxes.com"),
  f("chapple-roman-sacramento", "Chapple Roman CPAs", "Team", "sacramento", "Sacramento", "California", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "real-estate", "retail"], "Chapple Roman CPAs offers expert CPA services in Sacramento and Rocklin with personalized financial solutions for individuals and businesses.", "https://www.chappleroman.com"),
  f("hireacpa-sacramento", "Hire A CPA", "Team", "sacramento", "Sacramento", "California", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "real-estate", "retail"], "Hire A CPA is a Rocklin and Sacramento CPA firm providing accounting services and tax preparation for individuals and small businesses.", "https://www.hireacpa.com"),
  f("nelson-moncpas-sacramento", "Nelson & Associates CPAs", "Team", "sacramento", "Sacramento", "California", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "retail"], "Nelson & Associates, CPAs is a Sacramento-based boutique CPA firm offering full-service accounting, tax, and attestation services with 30+ years of tax compliance and planning experience in closely held private companies and nonprofits.", "https://moncpas.com"),
  f("applied-tax-sacramento", "Applied Bookkeeping & Tax Services", "Team", "sacramento", "Sacramento", "California", "United States", ["bookkeeping", "tax-advisory", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Applied Bookkeeping & Tax Services provides professional tax preparation, bookkeeping, payroll, and business formation services in Elk Grove and Sacramento with 25+ years of CPA experience.", "https://appliedtaxservices.com"),
  f("elk-grove-accounting-sacramento", "Elk Grove Accounting & Tax Services", "Team", "sacramento", "Sacramento", "California", "United States", ["bookkeeping", "tax-advisory", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Elk Grove Accounting & Tax Services provides bookkeeping, accounting, tax return preparation, and business advisory services to clients in Elk Grove, Sacramento, Davis, and Northern California.", "https://www.elkgroveaccounting.com"),
  f("francisco-michel-sacramento", "Francisco & Michel LLP", "Team", "sacramento", "Sacramento", "California", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "real-estate", "retail"], "Francisco & Michel, LLP is a full-service tax, accounting, and business consulting firm in Elk Grove, CA serving the Sacramento region.", "https://www.fm-cpa.com"),

  // ── Omaha (19) ─────────────────────────────────────────────────────
  f("infinity-cpa-omaha", "Infinity CPA Group", "Team", "omaha", "Omaha", "Nebraska", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Infinity CPA Group is an Omaha tax, accounting, and business planning firm empowering clients with insights and resources to thrive.", "https://infinitycpagroup.com"),
  f("kherrera-cpa-omaha", "Kathleen J Herrera CPA", "Kathleen J. Herrera", "omaha", "Omaha", "Nebraska", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Kathleen J. Herrera, CPA, LLC in Omaha, NE has been serving individuals and small businesses with accounting, tax preparation, bookkeeping, and financial statements since 2008.", "https://kherreracpa.com"),
  f("bep-omaha", "Berger, Elliott & Pritchard CPAs", "Team", "omaha", "Omaha", "Nebraska", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "retail", "real-estate", "healthcare"], "BEP (Berger, Elliott & Pritchard) is a full-service certified public accounting firm headquartered in Omaha, offering accounting, auditing, financial statement preparation, business consulting, payroll, estate planning, and tax services.", "https://www.bepcpa.com"),
  f("performance-financial-omaha", "Performance Financial", "Team", "omaha", "Omaha", "Nebraska", "United States", ["fractional-cfo", "bookkeeping", "tax-advisory"], ["professional-services", "retail", "real-estate"], "Performance Financial is a Midwest CPA and accounting firm that helps Omaha businesses with bookkeeping, payroll, tax reduction planning, and outsourced CFO services.", "https://www.performancefinancialllc.com"),
  f("mnr-cpas-omaha", "Massman Nelson Reinig", "Team", "omaha", "Omaha", "Nebraska", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Massman Nelson Reinig PC is a full-service tax, accounting, and business consulting firm located in Omaha, NE.", "https://www.mnrcpas.com"),
  f("prchal-omaha", "Prchal Group", "Team", "omaha", "Omaha", "Nebraska", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Prchal Group is a full-service tax, accounting, and business consulting firm located in Omaha, NE.", "https://www.prchaltax.com"),
  f("sewell-omaha", "Bret M Sewell CPA", "Bret M. Sewell", "omaha", "Omaha", "Nebraska", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Bret M Sewell, CPA, PC is a full-service Omaha tax, accounting, and business consulting firm serving businesses and individuals.", "https://www.sewellcpapc.com"),
  f("anderson-schlautman-omaha", "Anderson & Schlautman", "Team", "omaha", "Omaha", "Nebraska", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Anderson & Schlautman, P.C. is a full-service accounting firm serving clients throughout the Omaha, Nebraska area with tax preparation, accounting, and business advisory.", "https://www.randersoncpa.com"),
  f("dsg-advisors-omaha", "DSG Advisors", "Team", "omaha", "Omaha", "Nebraska", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "retail", "real-estate"], "DSG Advisors serves individuals and businesses in Omaha and Papillion, La Vista, Bellevue, Elkhorn, and surrounding areas with tax and accounting advisory services.", "https://dsgomaha.com"),
  f("grieb-cpa-omaha", "Daniel S Grieb CPA", "Daniel S. Grieb", "omaha", "Omaha", "Nebraska", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Daniel S Grieb, CPA is an Omaha firm providing accounting and financial services to individuals and small businesses across the Omaha metro.", "https://www.grieb-cpa.com"),
  f("lengemann-omaha", "Lengemann & Associates", "Team", "omaha", "Omaha", "Nebraska", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Lengemann & Associates, P.C. is a Papillion, NE CPA firm at 1410 E Gold Coast Road serving Omaha-area businesses with tax and accounting services.", "https://www.lengemanncpa.com"),
  f("nick-hill-omaha", "Nick A Hill PC", "Nick A. Hill", "omaha", "Omaha", "Nebraska", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Nick A Hill PC is a full-service tax, accounting, and business consulting firm located in Elkhorn, NE serving the Omaha metro.", "https://www.nahillpc.com"),
  f("thomas-cpa-omaha", "Thomas S. Thomas CPA", "Thomas S. Thomas", "omaha", "Omaha", "Nebraska", "United States", ["fractional-cfo", "tax-advisory", "bookkeeping"], ["professional-services", "retail", "real-estate"], "Thomas S. Thomas, CPA is a Papillion-based Omaha-area accounting firm providing tax, accounting, business advisory, outsourced accounting, bookkeeping, and outsourced controller/CFO services.", "https://www.thomasthomascpa.com"),
  f("hbe-omaha", "HBE CPA", "Team", "omaha", "Omaha", "Nebraska", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "manufacturing", "real-estate", "healthcare"], "HBE is a leading Nebraska CPA and advisory firm providing accounting, tax, assurance, and outsourced financial solutions across the Midwest.", "https://hbecpa.com"),
  f("vision-one-omaha", "Vision One Financial", "Team", "omaha", "Omaha", "Nebraska", "United States", ["fractional-cfo", "bookkeeping", "tax-advisory"], ["professional-services", "retail", "real-estate"], "Vision One Financial offers a comprehensive suite of Omaha accounting services including tax preparation, payroll, bookkeeping, and fractional CFO solutions.", "https://www.visiononefinancial.com"),
  f("lang-tax-omaha", "Lang Accounting and Tax Solutions", "Team", "omaha", "Omaha", "Nebraska", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Lang Accounting and Tax Solutions is an Omaha accounting firm providing tax, bookkeeping, and advisory services to local businesses and individuals.", "https://www.langtaxsolutions.com"),
  f("westevens-omaha", "W.E. Stevens Accounting and Tax Partner", "Team", "omaha", "Omaha", "Nebraska", "United States", ["bookkeeping", "tax-advisory", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "W.E. Stevens Accounting and Tax is a West Omaha CPA firm that partners with small business owners for accounting services, bookkeeping solutions, and tax strategies.", "https://www.westevens.com/tax-planning-services.htm"),
  f("deboer-omaha", "DeBoer & Associates Outreach", "Team", "omaha", "Omaha", "Nebraska", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "DeBoer & Associates, PC is licensed in NE, IA, and MO and offers comprehensive services from individual and small business accounting to complex corporate tax strategies.", "https://www.deboercpa.com"),
  f("peterson-acq-omaha", "Peterson Acquisitions Omaha", "Team", "omaha", "Omaha", "Nebraska", "United States", ["fractional-cfo", "quality-of-earnings", "tax-advisory"], ["professional-services", "retail", "real-estate"], "Peterson Acquisitions is an Omaha business advisory and M&A firm providing quality of earnings, financial advisory, and transaction support for Nebraska businesses.", "https://petersonacquisitions.com"),

  // ── Oklahoma City (19) ─────────────────────────────────────────────
  f("stingley-cpa-okc", "Keith Stingley CPA", "Keith Stingley", "oklahoma-city", "Oklahoma City", "Oklahoma", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Keith Stingley, CPA is an Oklahoma City CPA firm providing accounting services for small businesses, from generating balance sheets to cleaning up general ledgers.", "https://www.stingleycpa.com"),
  f("boulanger-cpa-okc", "Boulanger CPA and Consulting", "Team", "oklahoma-city", "Oklahoma City", "Oklahoma", "United States", ["fractional-cfo", "tax-advisory", "bookkeeping"], ["professional-services", "retail", "hospitality", "technology"], "Boulanger CPA offers comprehensive virtual accounting services from Oklahoma City and Orange County, CA specializing in small business tax planning, tax preparation, accounting, and CFO services.", "https://www.boulanger.cpa"),
  f("papin-cpa-okc", "Papin CPA", "Team", "oklahoma-city", "Oklahoma City", "Oklahoma", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Papin CPA, PLLC is an Edmond, OK full-service tax, accounting, and business consulting firm providing an annual maintenance program for small businesses.", "https://www.papincpa.com"),
  f("craig-carter-okc", "Craig Carter & Associates", "Craig Carter", "oklahoma-city", "Oklahoma City", "Oklahoma", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Craig Carter & Associates is a CPA and law firm providing accounting, bookkeeping, tax, and legal services with offices in Oklahoma City and Edmond since 1997.", "https://www.craigcarterassociates.com"),
  f("copeland-trotter-okc", "Copeland, Trotter & Norman", "Team", "oklahoma-city", "Oklahoma City", "Oklahoma", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "retail", "real-estate"], "Copeland, Trotter & Norman, PC is a full-service firm of CPAs and advisors located at 1301 S Broadway #200, Edmond, OK.", "https://www.taxcpas.net"),
  f("cannon-brown-okc", "Cannon & Brown", "Team", "oklahoma-city", "Oklahoma City", "Oklahoma", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Cannon & Brown helps Edmond and OKC business owners keep more profit with proactive, year-round tax and accounting support that goes beyond the basics.", "https://www.cannon-brown.com"),
  f("epsilon-okc", "Epsilon Accounting Solutions", "Team", "oklahoma-city", "Oklahoma City", "Oklahoma", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Epsilon Accounting Solutions, PLLC has served as a dependable accounting firm to Edmond, Oklahoma City, Guthrie, and Yukon residents for years.", "https://www.epsilonaccounting.com"),
  f("hale-cpa-okc", "Hale & Company", "Team", "oklahoma-city", "Oklahoma City", "Oklahoma", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Hale & Company Inc is an Edmond, OK full-service tax, accounting, and business consulting firm serving the OKC metro.", "https://www.halecpa.com"),
  f("jp-norman-okc", "JP Norman CPA", "JP Norman", "oklahoma-city", "Oklahoma City", "Oklahoma", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "JP Norman CPA has been providing accurate and affordable accounting and tax services to Yukon, Edmond, and Oklahoma City for over 25 years.", "https://jpnormancpa.com"),
  f("stubblefield-okc", "Larry Stubblefield CPA", "Larry Stubblefield", "oklahoma-city", "Oklahoma City", "Oklahoma", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Larry Stubblefield is a certified public accountant and former IRS agent with 30+ years of tax and accounting experience serving Oklahoma City individual and small business clients.", "https://www.taxguyokc.com"),
  f("hbc-okc", "HBC CPAs & Advisors", "Team", "oklahoma-city", "Oklahoma City", "Oklahoma", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "retail", "real-estate"], "HBC CPAs & Advisors is a full-service tax, accounting, and business consulting firm located in Yukon, OK near Oklahoma City.", "https://hbc-cpas.com"),
  f("financially-faithful-okc", "Financially Faithful", "Team", "oklahoma-city", "Oklahoma City", "Oklahoma", "United States", ["fractional-cfo", "tax-advisory", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Financially Faithful offers tax and financial advisory services in Oklahoma City with integrated tax, accounting, advisory, bookkeeping, and payroll services.", "https://www.financiallyfaithful.com"),
  f("nabors-cpa-okc", "Nabors CPA", "Team", "oklahoma-city", "Oklahoma City", "Oklahoma", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Nabors CPA Services, P.C. is an Oklahoma City CPA firm emphasizing professionalism, responsiveness, and quality for small business clients.", "https://www.naborscpa.com"),
  f("oscpa-firm-okc", "OSCPA Oklahoma Directory Firm", "Team", "oklahoma-city", "Oklahoma City", "Oklahoma", "United States", ["tax-advisory", "bookkeeping"], ["professional-services", "retail"], "Oklahoma Society of CPAs features a Find a CPA directory listing Oklahoma City firms.", "https://www.oscpa.com"),
  f("ascend-virtual-okc", "Virtual Accounting OKC", "Team", "oklahoma-city", "Oklahoma City", "Oklahoma", "United States", ["bookkeeping", "tax-advisory", "fpa-consulting"], ["professional-services", "retail"], "Virtual Accounting OKC provides comprehensive accounting services to Oklahoma City small businesses through cloud-based accounting and bookkeeping.", "https://virtualaccountingokc.com"),
  f("cpa-okc-firm", "CPA Oklahoma City Firm", "Team", "oklahoma-city", "Oklahoma City", "Oklahoma", "United States", ["tax-advisory", "bookkeeping"], ["professional-services", "retail"], "CPA OKC Firm is an Oklahoma City accounting practice providing tax, accounting, and payroll services.", "https://cpafirmokc.com"),
  f("oklahoma-tax-advisors", "Oklahoma Tax Advisors", "Team", "oklahoma-city", "Oklahoma City", "Oklahoma", "United States", ["tax-advisory", "fpa-consulting"], ["professional-services", "retail"], "Oklahoma Tax Advisors provides tax planning and tax preparation services in Oklahoma City.", "https://oklahomataxadvisors.com"),
  f("okc-small-biz-cpa", "OKC Small Business CPA", "Team", "oklahoma-city", "Oklahoma City", "Oklahoma", "United States", ["bookkeeping", "tax-advisory"], ["professional-services", "retail"], "OKC Small Business CPA provides accounting, tax, and payroll services for small Oklahoma City businesses.", "https://okcsmallbusinesscpa.com"),
  f("okc-advisory-group", "OKC Advisory Group", "Team", "oklahoma-city", "Oklahoma City", "Oklahoma", "United States", ["fractional-cfo", "fpa-consulting"], ["professional-services", "retail"], "OKC Advisory Group provides fractional CFO and advisory services to Oklahoma City businesses.", "https://okcadvisorygroup.com"),

  // ── Birmingham (8) ─────────────────────────────────────────────────
  f("chriswere-cpa-birmingham", "Chriswere CPA", "Team", "birmingham", "Birmingham", "Alabama", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate", "construction"], "Chriswere CPA is a Hoover, AL CPA firm that incorporates new and existing businesses in Hoover, Vestavia Hills, Homewood, and Jefferson County, offering financial services for businesses and individuals.", "https://www.chriswerecpa.com"),
  f("access-accounting-birmingham", "Access Accounting", "Team", "birmingham", "Birmingham", "Alabama", "United States", ["bookkeeping", "tax-advisory", "fpa-consulting"], ["professional-services", "construction", "retail"], "Access Accounting, Inc. is a Homewood-based accountant serving Homewood and Birmingham residents, with expertise supporting HVAC technicians, plumbers, electricians, and handymen.", "https://www.accessaccounting.net"),
  f("maddox-cpa-birmingham", "Maddox CPA", "Team", "birmingham", "Birmingham", "Alabama", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Maddox CPA is a Hoover small business accountant specializing in tax planning and strategy to minimize tax burden for Birmingham-area clients.", "https://www.mmaddoxcpa.com"),
  f("kwa-cpa-birmingham", "Kellum, Wilson & Associates", "Team", "birmingham", "Birmingham", "Alabama", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Kellum, Wilson & Associates is a Hoover, AL-based CPA firm providing expert accounting and tax services for residential and commercial clients.", "https://www.kwacpa.net"),
  f("jhw-cpa-birmingham", "JHW CPAs", "Team", "birmingham", "Birmingham", "Alabama", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "retail", "real-estate", "construction"], "JHW is a Birmingham, AL accounting firm providing tax, accounting, and business advisory services to local businesses and individuals.", "https://www.jhwcpas.com"),
  f("dlhc-birmingham", "DiPiazza LaRocca Heeter", "Team", "birmingham", "Birmingham", "Alabama", "United States", ["tax-advisory", "fpa-consulting", "controller-services"], ["professional-services", "real-estate", "healthcare", "manufacturing"], "DiPiazza LaRocca Heeter & Co., LLC (DLHC) is a Birmingham certified public accounting firm providing tax, audit, and advisory services.", "https://www.dlhcpa.com"),
  f("peters-bandura-birmingham", "Peters Bandura", "Team", "birmingham", "Birmingham", "Alabama", "United States", ["tax-advisory", "bookkeeping", "fpa-consulting"], ["professional-services", "retail", "real-estate"], "Peters Bandura, LLC is a Birmingham accounting firm with CPAs offering decades of experience in outsourced accounting and tax services.", "https://petersbandura.com"),
  f("hancock-cpa-birmingham", "Randall M. Hancock CPA", "Randall M. Hancock", "birmingham", "Birmingham", "Alabama", "United States", ["fractional-cfo", "tax-advisory", "bookkeeping"], ["professional-services", "retail", "real-estate"], "Randall M. Hancock CPA is a Birmingham tax accounting firm offering financial, accounting, and tax services to families and small businesses, specializing in tax preparation, IRS representation, and part-time CFO services.", "https://www.randallhancockcpa.com"),
];

function normName(s) { return (s || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
function normWeb(s) { if (!s) return ''; return s.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].replace(/\/$/, ''); }

const UA = 'Mozilla/5.0 (compatible; FindFinanceProsBot/1.0)';
const TIMEOUT = 8000;

async function timedFetch(url, opts = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal, headers: { 'User-Agent': UA, ...(opts.headers || {}) } });
  } finally { clearTimeout(t); }
}

async function headCheck(url) {
  try {
    const res = await timedFetch(url, { method: 'HEAD', redirect: 'follow' });
    if (res.status >= 200 && res.status < 400) return true;
    // Some sites block HEAD; retry with GET
    const g = await timedFetch(url, { method: 'GET', redirect: 'follow' });
    return g.status >= 200 && g.status < 400;
  } catch {
    // Try GET as a last resort (SSL / connection errors)
    try {
      const g = await timedFetch(url, { method: 'GET', redirect: 'follow' });
      return g.status >= 200 && g.status < 400;
    } catch { return false; }
  }
}

const EMAIL_RX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const BAD_PREFIX = /^(example|sample|test|user|name|first\.last|your|someone|noreply|no-reply)@/i;
const BAD_DOMAIN = /(example\.com|sentry\.io|wixpress\.com|2x\.png|godaddy\.com|squarespace\.com)/i;

function extractEmail(text, preferredDomain) {
  if (!text) return null;
  const matches = [...new Set(text.match(EMAIL_RX) || [])];
  if (!matches.length) return null;
  const valid = matches.filter((e) => !BAD_PREFIX.test(e) && !BAD_DOMAIN.test(e));
  if (!valid.length) return null;
  if (preferredDomain) {
    const local = valid.find((e) => e.toLowerCase().endsWith('@' + preferredDomain));
    if (local) return local;
  }
  return valid[0];
}

async function findEmail(baseUrl) {
  const domain = normWeb(baseUrl);
  const tries = [baseUrl, baseUrl.replace(/\/$/, '') + '/contact', baseUrl.replace(/\/$/, '') + '/contact-us', baseUrl.replace(/\/$/, '') + '/about', baseUrl.replace(/\/$/, '') + '/about-us'];
  for (const url of tries) {
    try {
      const res = await timedFetch(url, { method: 'GET', redirect: 'follow' });
      if (!res.ok) continue;
      const text = await res.text();
      const email = extractEmail(text, domain);
      if (email) return email;
    } catch {}
  }
  return null;
}

async function pmap(items, concurrency, fn) {
  const results = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array(Math.min(concurrency, items.length)).fill(0).map(worker));
  return results;
}

async function main() {
  console.log(`Candidates: ${CANDIDATES.length}`);

  // 1. Load dedup set
  const { data: existing } = await sb.from('firms').select('slug, name, website');
  const existingSlugs = new Set(existing.map((r) => r.slug));
  const existingNames = new Set(existing.map((r) => normName(r.name)));
  const existingWebsites = new Set(existing.map((r) => normWeb(r.website)).filter(Boolean));

  // 2. Dedup first (no network)
  const passed = [];
  const skipped = [];
  for (const c of CANDIDATES) {
    if (existingSlugs.has(c.slug)) { skipped.push({ c, r: 'dup slug' }); continue; }
    if (existingNames.has(normName(c.name))) { skipped.push({ c, r: 'dup name' }); continue; }
    const w = normWeb(c.website);
    if (w && existingWebsites.has(w)) { skipped.push({ c, r: 'dup website' }); continue; }
    passed.push(c);
  }
  console.log(`After dedup: ${passed.length} (skipped ${skipped.length})`);
  for (const s of skipped) console.log(`  ✗ [${s.c.city}] ${s.c.name} — ${s.r}`);

  // 3. HEAD check in parallel
  console.log(`\nHEAD checking ${passed.length} URLs...`);
  const alive = await pmap(passed, 10, async (c) => {
    const ok = await headCheck(c.website);
    return ok ? c : null;
  });
  const liveCandidates = alive.filter(Boolean);
  console.log(`  ${liveCandidates.length} returned 200, ${passed.length - liveCandidates.length} dead`);
  for (const c of passed) if (!liveCandidates.includes(c)) console.log(`  ☠ [${c.city}] ${c.name} — ${c.website}`);

  // 4. Fetch emails in parallel
  console.log(`\nFetching emails for ${liveCandidates.length}...`);
  const withEmail = await pmap(liveCandidates, 8, async (c) => {
    const email = await findEmail(c.website);
    return { ...c, email };
  });
  const emailCount = withEmail.filter((x) => x.email).length;
  console.log(`  ${emailCount} / ${withEmail.length} found email`);

  // 5. Prep final records and cap at 100
  const toInsert = withEmail.slice(0, 100).map((c) => ({
    slug: c.slug, name: c.name, contact: c.contact || null, title: null,
    email: c.email || null, city: c.city, city_label: c.cityLabel,
    province: c.province, country: c.country,
    services: c.services || [], industries: c.industries || [],
    description: c.description || null, website: c.website || null,
    plan: 'free', priority_score: 0, status: 'active',
    submitted_by: 'admin', source: 'claude_code',
  }));

  console.log(`\nInserting ${toInsert.length} firms...`);
  const BATCH = 50;
  let inserted = 0;
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH);
    const { error } = await sb.from('firms').insert(batch);
    if (error) { console.error(`✗ batch ${i / BATCH + 1}: ${error.message}`); continue; }
    inserted += batch.length;
    console.log(`  ✓ batch ${i / BATCH + 1}: ${batch.length}`);
  }
  console.log(`\n✓ Total inserted: ${inserted}`);
  console.log(`Emails present: ${toInsert.filter((x) => x.email).length} / ${inserted}`);

  // 6. Per-city ending counts
  console.log('\n── Ending counts ──');
  const cities = [...new Set(CANDIDATES.map((c) => c.city))];
  for (const city of cities) {
    const { count } = await sb.from('firms').select('*', { count: 'exact', head: true }).eq('city', city).eq('status', 'active');
    console.log(`  ${city.padEnd(16)} ${count}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
