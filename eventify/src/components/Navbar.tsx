import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Calendar, LayoutDashboard, Sparkles, CreditCard, Home, Activity, ShoppingBag, Mail, User } from 'lucide-react';
import { useRole } from './RoleContext';
import { useCart } from './CartContext';
import { BottomNav } from './BottomNav';
import { MobileMenu } from './MobileMenu';
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

const NavLink = ({ to, children, isActive }: { to: string; children: React.ReactNode; isActive: boolean }) => (
  <Link
    to={to}
    className={`text-sm font-semibold transition-colors duration-200 font-sans tracking-wide
      ${isActive
        ? 'text-black'
        : 'text-gray-500 hover:text-black'
      }`}
  >
    {children}
  </Link>
);

export const Navbar: React.FC = () => {
  const { user } = useRole();
  const { items: cart } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Main website only - no organizer mode
  const isHostMode = false;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[50] transition-all duration-500 ease-in-out font-sans
        ${scrolled
            ? 'py-4 bg-white/95 backdrop-blur-xl border-b border-gray-100/50 shadow-sm'
            : 'py-6 bg-transparent'
          }`}
      >
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">

          {/* Mobile Layout (Hamburger | Logo | Cart) */}
          <div className="flex md:hidden items-center justify-between">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link to="/" className="flex-shrink-0">
              <img src="/logo.svg" alt="Eventify" className="h-8 w-auto object-contain" />
            </Link>
            <div className="flex items-center gap-2">
              <Link to="/merch" className="relative p-2 rounded-lg hover:bg-black/5 transition-colors">
                <ShoppingBag className="w-6 h-6" />
                {cart.length > 0 && (
                  <span className="absolute top-1 right-0 bg-[#E85A6B] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </Link>
              {!user && (
                <Link to="/login" className="bg-[#E85A6B] text-white text-xs font-bold px-4 py-2 rounded-full">
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Desktop Layout (Links | Logo | Actions) */}
          <div className="hidden md:flex items-center justify-between">

            {/* Left: Navigation Links */}
            <div className="flex-1 flex items-center justify-start gap-8">
              {!isHostMode ? (
                <>
                  <NavLink to="/" isActive={isActive('/')}>Home</NavLink>
                  <NavLink to="/discover" isActive={isActive('/discover')}>Discover</NavLink>
                  <NavLink to="/activities" isActive={isActive('/activities')}>Activities</NavLink>
                  <NavLink to="/merch" isActive={isActive('/merch')}>Merch</NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/organizer" isActive={isActive('/organizer')}>Dashboard</NavLink>
                  {user && <NavLink to="/my-events" isActive={isActive('/my-events')}>My Events</NavLink>}
                  <NavLink to="/subscription" isActive={isActive('/subscription')}>Pricing</NavLink>
                </>
              )}
            </div>

            {/* Center: Logo */}
            <div className="flex-shrink-0 mx-4">
              <Link to="/">
                <img src="/logo.svg" alt="Eventify" className="h-10 w-auto object-contain hover:scale-105 transition-transform duration-300" />
              </Link>
            </div>

            {/* Right: Actions */}
            <div className="flex-1 flex items-center justify-end gap-8">
              <NavLink to="/contact" isActive={isActive('/contact')}>Contact</NavLink>

              {/* Cart */}
              <Link to="/merch" className="relative group">
                <ShoppingBag className="w-5 h-5 text-gray-500 group-hover:text-black transition-colors" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#E85A6B] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center ring-2 ring-white">
                    {cart.length}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="flex items-center gap-4">
                  {user && !isHostMode && (
                    <NavLink to="/dashboard" isActive={isActive('/dashboard')}>Dashboard</NavLink>
                  )}
                  <Link
                    to="/dashboard"
                    className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:ring-2 hover:ring-[#E85A6B]/20 transition-all overflow-hidden"
                    title="Profile"
                  >
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-gray-600" />
                    )}
                  </Link>
                </div>
              ) : (
                <InteractiveHoverButton
                  onClick={() => navigate('/login')}
                  text="Get started"
                  className="w-32 py-2 text-sm bg-black text-white hover:bg-black/90"
                />
              )}
            </div>

          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      </nav>

      <BottomNav />
    </>
  );
};