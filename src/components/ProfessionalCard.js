import Link from 'next/link';

export default function ProfessionalCard({ pro }) {
  const labels = (pro.serviceLabels || []).map((s) => s.label);

  return (
    <Link href={`/professional/${pro.slug}`} className="block">
      <div className="bg-white rounded-xl p-6 border border-brand-100 card-hover relative">
        {pro.featured && (
          <span className="absolute top-4 right-4 bg-warm-500 text-white text-xs font-medium px-3 py-1 rounded-full">
            Featured
          </span>
        )}
        <h3 className="font-display text-xl text-brand-950 mb-1">{pro.name}</h3>
        <p className="text-sm text-brand-600 font-medium mb-1">{pro.contact} · {pro.title}</p>
        <p className="text-sm text-brand-500 mb-3">
          {pro.cityLabel}, {pro.province} · {pro.country}
        </p>
        <p className="text-sm text-brand-800 leading-relaxed mb-4 line-clamp-2">
          {pro.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {labels.slice(0, 3).map((label) => (
            <span
              key={label}
              className="text-xs bg-brand-50 text-brand-700 px-3 py-1 rounded-full border border-brand-100"
            >
              {label}
            </span>
          ))}
          {labels.length > 3 && (
            <span className="text-xs text-brand-400 px-2 py-1">
              +{labels.length - 3} more
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
