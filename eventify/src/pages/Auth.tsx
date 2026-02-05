import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '@/lib/api';
import { useRole } from '@/components/RoleContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
// import { useToast } from '@/components/ui/use-toast'; // Deprecated
import { toast } from '@/components/ui/toast';
import { SEOHead } from '@/components/SEOHead';

const Auth = () => {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Initialize state based on URL path or params
  // Ensure isLogin state is correctly derived and name is included
  const [isLogin, setIsLogin] = useState(() => {
    const params = new URLSearchParams(location.search);
    if (location.pathname.includes('/signup')) return false;
    if (location.pathname.includes('/login')) return true;
    return params.get('mode') !== 'signup';
  });

  // Effect to handle mode changes via navigation
  useEffect(() => {
    if (location.pathname.includes('/signup')) setIsLogin(false);
    else if (location.pathname.includes('/login')) setIsLogin(true);
  }, [location.pathname]);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, role, loading: authLoading, login } = useRole();

  useEffect(() => {
    if (!authLoading && user) {
      if (!user.is_verified && !user.verified) {
        navigate('/verify');
        return;
      }
      const params = new URLSearchParams(location.search);
      const nextParam = params.get('next');
      const from = nextParam || (location.state as any)?.from?.pathname || (role === 'admin' ? '/organizer' : '/');
      navigate(from, { replace: true });
    }
  }, [user, role, authLoading, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        const { data } = await api.post('/auth/login', { email, password });
        login(data.token, data);

        toast.success(
          'Logged in successfully',
          { title: 'Success' }
        );
      } else {
        // SIGNUP
        // Ensure name is sent. API expects 'name', 'email', 'password'
        const payload = { name, email, password };
        const { data } = await api.post('/auth/register', payload);
        login(data.token, data);

        toast.success(
          'Account created successfully',
          { title: 'Success' }
        );
        navigate('/verify');
      }
    } catch (error: any) {
      console.error("Auth Error:", error.response?.data);
      toast.error(
        error.response?.data?.message || error.message,
        { title: 'Error' }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <SEOHead
        title={isLogin ? 'Sign In' : 'Sign Up'}
        description={isLogin ? 'Sign in to manage your events and registrations' : 'Create an account to manage events and register for upcoming events'}
      />
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="text-4xl font-normal text-[#1A1A1A] tracking-[-0.02em]">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </h2>
          <p className="mt-2 text-sm text-[#1A1A1A] opacity-50">
            {isLogin ? 'Sign in to manage events' : 'Create an account to manage events'}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <Input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="border-[#1A1A1A] text-[#1A1A1A]"
              />
            </div>
          )}
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-[#1A1A1A] text-[#1A1A1A]"
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-[#1A1A1A] text-[#1A1A1A]"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1A1A1A] text-white hover:bg-opacity-90"
          >
            {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-[#1A1A1A] hover:opacity-70 transition-opacity"
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
};

export default Auth;
