import { Link } from 'react-router-dom'
import type { Website } from '../lib/types'
import GlassCard from './GlassCard'
import Button from './Button'

export default function WebsiteCard({ site }: { site: Website }) {
  return (
    <GlassCard className="flex flex-col">
      <div className="relative -m-6 mb-4 h-36 overflow-hidden rounded-t-2xl bg-surface">
        {site.thumbnail_url ? (
          <img src={site.thumbnail_url} alt={site.title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-600 text-sm">
            No thumbnail
          </div>
        )}
        {site.is_new && (
          <span className="absolute top-2 right-2 rounded-full bg-neon px-3 py-1 text-xs font-bold text-white shadow-[0_0_10px_rgba(176,38,255,0.7)]">
            NEW
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 mb-2">
        {site.logo_url && (
          <img src={site.logo_url} alt="" className="h-6 w-6 rounded object-cover" />
        )}
        <h3 className="font-heading text-base font-semibold text-white truncate">{site.title}</h3>
      </div>

      <p className="text-sm text-gray-400 line-clamp-2 flex-1">{site.description}</p>

      {site.categories?.name && (
        <span className="mt-3 inline-block w-fit rounded-full border border-violet/40 px-3 py-0.5 text-xs text-violet">
          {site.categories.name}
        </span>
      )}

      <div className="mt-4 flex gap-2">
        <a href={site.url} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button variant="primary" className="w-full">Visit Website</Button>
        </a>
        <Link to={`/websites/${site.slug}`} className="flex-1">
          <Button variant="outline" className="w-full">Details</Button>
        </Link>
      </div>
    </GlassCard>
  )
}
