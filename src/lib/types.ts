export type UserRole = 'member' | 'moderator' | 'administrator' | 'admin' | 'owner'

export type WebsiteStatus = 'draft' | 'pending' | 'published' | 'archived'

export interface Profile {
  id: string
  username: string
  email: string
  role: UserRole
  status: 'active' | 'banned' | 'suspended'
  avatar_url: string | null
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
}

export interface Website {
  id: string
  title: string
  slug: string
  url: string
  logo_url: string | null
  thumbnail_url: string | null
  description: string
  category_id: string | null
  status: WebsiteStatus
  is_new: boolean
  display_order: number
  visits: number
  clicks: number
  created_at: string
  created_by: string | null
  categories?: Category | null
}

export interface AuditLog {
  id: string
  actor_id: string | null
  action: string
  target_type: string
  target_id: string | null
  details: Record<string, unknown> | null
  created_at: string
}

export interface Report {
  id: string
  website_id: string
  reporter_email: string | null
  reason: string
  status: 'open' | 'resolved' | 'dismissed'
  created_at: string
  websites?: { title: string } | null
}

// Roles ranked low to high - used for permission checks
export const ROLE_RANK: Record<UserRole, number> = {
  member: 0,
  moderator: 1,
  administrator: 2,
  admin: 3,
  owner: 4,
}

export function hasRole(userRole: UserRole | undefined, minRole: UserRole): boolean {
  if (!userRole) return false
  return ROLE_RANK[userRole] >= ROLE_RANK[minRole]
}
