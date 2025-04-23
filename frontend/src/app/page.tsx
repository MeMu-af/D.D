import { MainLayout } from '@/components/MainLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <MainLayout>
      <section className="text-center mb-12">
        <h2 className="text-5xl font-bold mb-4 medieval-text gold-text">
          Find Your Next Adventure
        </h2>
        <p className="text-xl fantasy-text mb-8">
          Connect with fellow adventurers and embark on epic quests together
        </p>
        <div className="flex justify-center space-x-4">
          <Button variant="dragon" size="lg">
            Find Players Nearby
          </Button>
          <Button variant="gold" size="lg">
            Join the Forum
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Find Players</CardTitle>
            <CardDescription>
              Discover fellow adventurers in your area
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="fantasy-text">
              Use our advanced search to find D&D players near you. Filter by experience level, preferred play style, and more.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="scroll">Start Searching</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Share Stories</CardTitle>
            <CardDescription>
              Document your epic adventures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="fantasy-text">
              Share your campaign stories, character builds, and memorable moments with the community.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="scroll">View Stories</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organize Games</CardTitle>
            <CardDescription>
              Plan your next session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="fantasy-text">
              Create and manage game sessions, track attendance, and coordinate with your party.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="scroll">Create Session</Button>
          </CardFooter>
        </Card>
      </section>

      <section className="mt-12 text-center">
        <h3 className="text-3xl font-bold mb-4 medieval-text gold-text">
          Join Our Community
        </h3>
        <p className="text-lg fantasy-text mb-8">
          Connect with thousands of D&D enthusiasts worldwide
        </p>
        <Button variant="dragon" size="lg">
          Sign Up Now
        </Button>
      </section>
    </MainLayout>
  )
}
