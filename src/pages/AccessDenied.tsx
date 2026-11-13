import { Link } from 'react-router-dom'
import Container from '../components/Container'
import Button from '../components/Button'

export default function AccessDenied() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Container>
        <div className="text-center max-w-lg mx-auto">
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-neon mb-4">
            ACCESS DENIED
          </h1>
          <p className="text-gray-300 mb-2">
            You do not have Administrator permissions to access this page.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Your account does not have the required authorization.
          </p>
          <Link to="/">
            <Button variant="primary">Return to Homepage</Button>
          </Link>
        </div>
      </Container>
    </div>
  )
}
