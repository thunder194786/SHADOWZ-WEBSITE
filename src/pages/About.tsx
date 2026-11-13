import Container from '../components/Container'
import GlassCard from '../components/GlassCard'

export default function About() {
  return (
    <Container>
      <div className="py-16 max-w-2xl mx-auto">
        <h1 className="font-heading text-3xl font-bold text-white mb-6">About SHADOWZ HUB</h1>
        <GlassCard>
          <p className="text-gray-300 leading-relaxed">
            SHADOWZ HUB is the central directory for every website in the SHADOWZ network.
            Instead of bookmarking each project separately, browse, search, and jump straight
            into any of them from one place. New sites are added here the moment they go live.
          </p>
        </GlassCard>
      </div>
    </Container>
  )
}
