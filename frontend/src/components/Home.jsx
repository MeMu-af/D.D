import { Button } from '@/components/button';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4">Welcome to D&D Connect</h1>
      <p className="text-lg mb-4">Find local players and share game stories!</p>
      <Button asChild>
        <Link to="/forum">Visit Forum</Link>
      </Button>
    </div>
  );
}

export default Home;