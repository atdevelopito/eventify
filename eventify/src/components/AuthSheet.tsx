import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, ArrowRight, RefreshCcw, LogOut } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import api from '@/lib/api';
import { useRole } from './RoleContext';

interface AuthSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthView = 'login' | 'signup' | 'forgot-password' | 'verify';

export const AuthSheet: React.FC<AuthSheetProps> = ({ isOpen, onClose }) => {
  const [view, setView] = useState<AuthView>('login');

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  // Verification State
  const [cooldown, setCooldown] = useState(0);

  // const { toast } = useToast(); // Removed
  const { login, signOut, isVerified, user } = useRole();

  // Reset view when opening, unless unverified user is logged in
  useEffect(() => {
    if (isOpen) {
      if (user && !isVerified) {
        setView('verify');
        // Pre-fill email if available
        if (user.email) setEmail(user.email);
      } else {
        setView('login');
        setPassword('');
      }
    }
  }, [isOpen, user, isVerified]);

  // Timer for cooldown
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (view === 'signup') {
        const { data } = await api.post('/auth/register', { name, email, password });
        login(data.token, data);
        toast.success('Please verify your email.', { title: 'Account created!' });
        setView('verify');
        // Do not close, show verify screen
      } else if (view === 'login') {
        const { data } = await api.post('/auth/login', { email, password });
        login(data.token, data);

        // Check verification immediately
        if (data.user?.is_verified === false && data.user?.role === 'unverified') {
          setView('verify');
          // Do not close
        } else {
          toast.success('Signed in successfully.', { title: 'Welcome back!' });
          onClose();
        }
      } else if (view === 'forgot-password') {
        await api.post('/auth/forgot-password', { email });
        toast.success('Check your email for password reset instructions.', { title: 'Reset Link Sent' });
        setView('login');
      }
    } catch (error: any) {

      // Special case: Login returns 403 for unverified, but we want to catch that and show verify screen? 
      // Actually backend login returns 403 if unverified. 
      // We should probably check if the error is "Account not verified" and switch to verify view?
      // But we can't get the user info if 403. 
      // User needs to rely on "user created" state or log in successfully to get the token.
      // If backend blocks login for unverified, we can't show "verify" screen with logged in context. 
      // Let's assume the user just registered or we handle the 403 explicitly if we want to "rescue" them.

      const msg = error.response?.data?.message || 'Something went wrong';

      if (view === 'login' && error.response?.status === 403 && msg.includes('not verified')) {
        toast.warning('Please verify your email to continue.', { title: 'Verification Required' });
        // We might not have the email in state if they typed it.
        // We can switch to verify view, but we need to know the email to Resend.
        // If they typed it in the login form, we have it.
        setView('verify');
      } else {
        toast.error(msg, { title: 'Error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    try {
      const emailToSend = email || user?.email; // Use state email or user email
      if (!emailToSend) {
        toast.error("Email not found. Please log in again.", { title: "Error" });
        return;
      }

      await api.post('/auth/resend-verification', { email: emailToSend });
      toast.success('Verification link resent.', { title: 'Email Sent' });
      setCooldown(60);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend.', { title: 'Error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    signOut();
    onClose();
    setView('login');
    setEmail('');
    setPassword('');
    setName('');
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000]" onClick={onClose} />

      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-[#0a0a0a] border-l border-white/10 z-[1001] shadow-2xl transition-transform duration-300 ${isOpen ? 'animate-slide-in-right' : ''}`}>

        {/* Helper Close for mobile or just standard */}
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
          <X size={20} />
        </button>

        <div className="flex flex-col h-full px-8 py-20 overflow-y-auto">

          {/* VERIFY VIEW */}
          {view === 'verify' ? (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-10 text-center">
                <div className="w-16 h-16 bg-[#E85A6B]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#E85A6B]">
                  <Mail size={32} />
                </div>
                <h2 className="text-white text-3xl font-bold mb-3">Verify Your Email</h2>
                <p className="text-gray-400 leading-relaxed">
                  We've sent a verification link to <span className="text-white font-medium">{email || user?.email}</span>.
                  Please check your inbox (and spam folder) to activate your account.
                </p>
              </div>

              <div className="space-y-4 flex-1">
                <button
                  onClick={handleResend}
                  disabled={loading || cooldown > 0}
                  className="w-full bg-[#1A1A1A] border border-white/10 text-white font-medium py-4 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-[#252525] transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <RefreshCcw size={18} className={cooldown > 0 ? "opacity-50" : ""} />
                  )}
                  {cooldown > 0 ? `Resend available in ${cooldown}s` : 'Resend Verification Email'}
                </button>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <p className="text-blue-200 text-sm text-center">
                    Tip: After verifying, you may need to refresh this page or sign in again.
                  </p>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-white/10">
                <button onClick={handleLogout} className="w-full text-gray-500 hover:text-white py-3 flex items-center justify-center gap-2 transition-colors">
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            </div>
          ) : (
            /* LOGIN / SIGNUP / FORGOT PASSWORD VIEWS */
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-white text-4xl font-bold mb-2 tracking-tight">
                {view === 'signup' ? 'Create Account' : view === 'forgot-password' ? 'Reset Password' : 'Sign In'}
              </h2>
              <p className="text-gray-400 text-base mb-10">
                {view === 'signup' ? 'Join us to create and manage your events' :
                  view === 'forgot-password' ? 'Enter your email to receive reset instructions' :
                    'Welcome back! Please sign in to continue'}
              </p>

              <form onSubmit={handleAuth} className="flex flex-col gap-5">
                {view === 'signup' && (
                  <div className="space-y-1.5">
                    <label className="text-gray-300 text-xs font-bold uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-[#1A1A1A] border border-white/10 text-white px-4 py-3.5 rounded-xl focus:outline-none focus:border-[#E85A6B] focus:ring-1 focus:ring-[#E85A6B] transition-all placeholder:text-gray-600"
                      placeholder="John Doe"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-gray-300 text-xs font-bold uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-[#1A1A1A] border border-white/10 text-white px-4 py-3.5 rounded-xl focus:outline-none focus:border-[#E85A6B] focus:ring-1 focus:ring-[#E85A6B] transition-all placeholder:text-gray-600"
                    placeholder="your@email.com"
                  />
                </div>

                {view !== 'forgot-password' && (
                  <div className="space-y-1.5">
                    <label className="text-gray-300 text-xs font-bold uppercase tracking-wider">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full bg-[#1A1A1A] border border-white/10 text-white px-4 py-3.5 rounded-xl focus:outline-none focus:border-[#E85A6B] focus:ring-1 focus:ring-[#E85A6B] transition-all placeholder:text-gray-600"
                      placeholder="••••••••"
                    />
                  </div>
                )}

                {view === 'login' && (
                  <div className="flex justify-end">
                    <button type="button" onClick={() => setView('forgot-password')} className="text-xs text-gray-400 hover:text-white transition-colors">
                      Forgot Password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#E85A6B] text-white font-bold py-4 px-6 rounded-xl mt-4 hover:bg-[#a00f40] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  {loading ? 'Please wait...' :
                    view === 'signup' ? 'Create Account' :
                      view === 'forgot-password' ? 'Send Reset Link' :
                        'Sign In'}
                  {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-white/10 text-center space-y-4">
                <button
                  onClick={() => setView(view === 'login' ? 'signup' : 'login')} // Toggle between login/signup mostly, handle forgot-pass separately
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  {view === 'login' ? "Don't have an account? Create one" :
                    view === 'signup' ? 'Already have an account? Sign in' :
                      view === 'forgot-password' ? 'Remembered your password? Sign in' :
                        ''}
                </button>
                {view === 'verify' && ( // Redundant but safe
                  <button onClick={() => setView('login')} className="text-gray-500 hover:text-white text-xs block mx-auto">Back to Login</button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </>,
    document.body
  );
};
