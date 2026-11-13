import { Link } from 'react-router-dom'
import Container from '../components/Container'
import Button from '../components/Button'

export default function NotFound() {
  return (
    <Container>
      <div className="py-24 text-center">
        <h1 className="font-heading text-5xl font-bold text-neon mb-4">404</h1>
        <p className="text-gray-400 mb-8">Page not found.</p>
        <Link to="/"><Button variant="primary">Return to Homepage</Button></Link>
      </div>
    </Container>
  )
}
