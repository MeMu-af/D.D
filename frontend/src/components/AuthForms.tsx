import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';

export function AuthForms() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await authService.login({ email: formData.email, password: formData.password });
      } else {
        await authService.register({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        });
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center medieval-text gold-text">
          {isLogin ? 'Login to Your Adventure' : 'Begin Your Adventure'}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-dragon-red/10 border border-dragon-red rounded-md text-dragon-red text-sm">
              {error}
            </div>
          )}

          {!isLogin && (
            <>
              <div className="space-y-2">
                <label htmlFor="firstName" className="fantasy-text block text-sm font-medium">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-ink rounded-md bg-scroll focus:outline-none focus:ring-2 focus:ring-gold"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="fantasy-text block text-sm font-medium">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-ink rounded-md bg-scroll focus:outline-none focus:ring-2 focus:ring-gold"
                  required
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="fantasy-text block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-ink rounded-md bg-scroll focus:outline-none focus:ring-2 focus:ring-gold"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="fantasy-text block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-ink rounded-md bg-scroll focus:outline-none focus:ring-2 focus:ring-gold"
              required
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            variant="dragon"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="fantasy-text text-sm text-gold hover:underline"
            >
              {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
            </button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
} 