import Container from '../../components/Container'
import GlassCard from '../../components/GlassCard'
import { useAuth } from '../../context/AuthContext'

export default function AccountDashboard() {
  const { profile } = useAuth()

  if (!profile) return null

  return (
    <Container>
      <div className="py-12 max-w-2xl mx-auto">
        <h1 className="font-heading text-3xl font-bold text-white mb-6">My Account</h1>
        <GlassCard>
          <div className="space-y-4 text-sm">
            <Row label="Username" value={profile.username} />
            <Row label="Email" value={profile.email} />
            <Row label="Role" value={profile.role.toUpperCase()} />
            <Row label="Status" value={profile.status} />
            <Row label="Member Since" value={new Date(profile.created_at).toLocaleDateString()} />
          </div>
        </GlassCard>
      </div>
    </Container>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-violet/10 pb-3">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-200">{value}</span>
    </div>
  )
}
