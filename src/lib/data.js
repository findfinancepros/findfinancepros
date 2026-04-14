import { supabase } from './supabase';

// -- Shape transformers -------------------------------------------------------
// DB uses snake_case; components expect the original camelCase shape.

function rowToFirm(row, serviceMap = null) {
  if (!row) return null;
  const services = row.services || [];
  const serviceLabels = serviceMap
    ? services.map((slug) => serviceMap.get(slug)).filter(Boolean)
    : [];
  return {
    slug: row.slug,
    name: row.name,
    contact: row.contact,
    title: row.title,
    city: row.city,
    cityLabel: row.city_label,
    province: row.province,
    country: row.country,
    services,
    industries: row.industries || [],
    description: row.description,
    website: row.website,
    linkedin: row.linkedin,
    featured: row.plan === 'featured' || row.priority_score >= 100,
    plan: row.plan,
    priorityScore: row.priority_score,
    serviceLabels,
  };
}

function rowToPost(row) {
  if (!row) return null;
  return {
    slug: row.slug,
    title: row.title,
    metaDescription: row.meta_description,
    author: row.author,
    authorTitle: row.author_title,
    date: row.date,
    readTime: row.read_time,
    category: row.category,
    tags: row.tags || [],
    content: row.content,
    relatedServices: row.related_services || [],
    relatedCities: row.related_cities || [],
    relatedIndustries: row.related_industries || [],
  };
}

async function buildServiceMap() {
  const svcs = await getAllServices();
  return new Map(svcs.map((s) => [s.slug, { slug: s.slug, label: s.label }]));
}

async function enrichFirms(rows) {
  const map = await buildServiceMap();
  return rows.map((r) => rowToFirm(r, map));
}

// -- Firms --------------------------------------------------------------------

export async function getAllFirms() {
  const { data, error } = await supabase
    .from('firms')
    .select('*')
    .eq('status', 'active')
    .order('priority_score', { ascending: false })
    .order('name', { ascending: true });
  if (error) throw error;
  return enrichFirms(data || []);
}

export async function getFirmBySlug(slug) {
  const { data, error } = await supabase
    .from('firms')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const map = await buildServiceMap();
  return rowToFirm(data, map);
}

export async function getFirmsByCity(citySlug) {
  const { data, error } = await supabase
    .from('firms')
    .select('*')
    .eq('status', 'active')
    .eq('city', citySlug)
    .order('priority_score', { ascending: false })
    .order('name', { ascending: true });
  if (error) throw error;
  return enrichFirms(data || []);
}

export async function getFirmsByService(serviceSlug) {
  const { data, error } = await supabase
    .from('firms')
    .select('*')
    .eq('status', 'active')
    .contains('services', [serviceSlug])
    .order('priority_score', { ascending: false })
    .order('name', { ascending: true });
  if (error) throw error;
  return enrichFirms(data || []);
}

export async function getFirmsByIndustry(industrySlug) {
  const { data, error } = await supabase
    .from('firms')
    .select('*')
    .eq('status', 'active')
    .contains('industries', [industrySlug])
    .order('priority_score', { ascending: false })
    .order('name', { ascending: true });
  if (error) throw error;
  return enrichFirms(data || []);
}

export async function getFeaturedFirms() {
  const { data, error } = await supabase
    .from('firms')
    .select('*')
    .eq('status', 'active')
    .eq('plan', 'featured')
    .order('priority_score', { ascending: false })
    .order('name', { ascending: true });
  if (error) throw error;
  return enrichFirms(data || []);
}

export async function searchFirms(query) {
  const q = (query || '').trim();
  if (!q) return [];
  const esc = q.replace(/[%_,]/g, (m) => `\\${m}`);
  const pattern = `%${esc}%`;
  const { data, error } = await supabase
    .from('firms')
    .select('*')
    .eq('status', 'active')
    .or(
      `name.ilike.${pattern},city_label.ilike.${pattern},description.ilike.${pattern}`
    )
    .order('priority_score', { ascending: false })
    .order('name', { ascending: true })
    .limit(50);
  if (error) throw error;
  return enrichFirms(data || []);
}

// -- Cities / Services / Industries ------------------------------------------

export async function getAllCities() {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .order('label', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getCityBySlug(slug) {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function getAllServices() {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('label', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getServiceBySlug(slug) {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function getAllIndustries() {
  const { data, error } = await supabase
    .from('industries')
    .select('*')
    .order('label', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getIndustryBySlug(slug) {
  const { data, error } = await supabase
    .from('industries')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

// -- Blog ---------------------------------------------------------------------

export const blogCategories = {
  guides: { label: 'Guides', description: 'In-depth guides for business owners' },
  insights: { label: 'Insights', description: 'Industry insights and analysis' },
  comparisons: { label: 'Comparisons', description: 'Compare options and approaches' },
};

export async function getAllBlogPosts() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return (data || []).map(rowToPost);
}

export async function getBlogPostBySlug(slug) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToPost(data) : null;
}

// -- Leads --------------------------------------------------------------------

export async function submitLead(leadData) {
  const payload = {
    name: leadData.name || null,
    email: leadData.email,
    phone: leadData.phone || null,
    company: leadData.company || null,
    message: leadData.message || null,
    firm_id: leadData.firmId || null,
    city: leadData.city || null,
    services_needed: leadData.servicesNeeded || [],
  };
  const { error } = await supabase.from('leads').insert(payload);
  if (error) throw error;
  return { ok: true };
}
