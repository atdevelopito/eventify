import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { SEOHead } from '@/components/SEOHead';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    if (import.meta.env.DEV) console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900">
      <SEOHead
        title="404 - Page Not Found"
        description="The page you're looking for doesn't exist."
      />
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="text-9xl font-bold tracking-tighter mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">Page not found</h2>
        <p className="text-gray-500 max-w-md mx-auto text-lg mb-10 leading-relaxed">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-full font-medium text-lg hover:bg-gray-900 transition-all hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>
      </div>

      <Footer />
    </div>
  );
};

export default NotFound;
