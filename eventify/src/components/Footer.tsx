import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Twitter, Instagram, Linkedin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-black">
      {/* Main Footer Content */}
      <div className="px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          {/* Top Section - Big CTA */}
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 mb-16">
            <div className="flex flex-col gap-2">
              <span className="text-sm uppercase tracking-wider text-gray-500">Ready to explore?</span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium flex flex-wrap items-center gap-2">
                <span className="border border-black px-4 py-2">Find your</span>
                <span className="bg-[#E85A6B] border border-black px-4 py-2 rounded-[20px] text-white">next event</span>
              </h2>
            </div>
            <Link
              to="/organizer-landing"
              className="group flex items-center gap-3 border border-black px-6 py-4 hover:bg-[#E85A6B] hover:text-white transition-all duration-300"
            >
              <span className="text-lg font-medium">Want to Host Events?</span>
              <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-16">
            {/* Navigation */}
            <div>
              <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-4">Navigate</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="text-black hover:text-[#E85A6B] transition-colors inline-flex items-center gap-1 group">
                    <span>Browse Events</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
                <li>
                  <Link to="/my-tickets" className="text-black hover:text-[#E85A6B] transition-colors inline-flex items-center gap-1 group">
                    <span>My Tickets</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
                <li>
                  <Link to="/organizer-landing" className="text-black hover:text-[#E85A6B] transition-colors inline-flex items-center gap-1 group">
                    <span>Become a Host</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-4">Resources</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/help" className="text-black hover:text-[#E85A6B] transition-colors inline-flex items-center gap-1 group">
                    <span>Help Center</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="text-black hover:text-[#E85A6B] transition-colors inline-flex items-center gap-1 group">
                    <span>Blog</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
                <li>
                  <Link to="/faqs" className="text-black hover:text-[#E85A6B] transition-colors inline-flex items-center gap-1 group">
                    <span>FAQs</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-4">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/privacy" className="text-black hover:text-[#E85A6B] transition-colors inline-flex items-center gap-1 group">
                    <span>Privacy</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-black hover:text-[#E85A6B] transition-colors inline-flex items-center gap-1 group">
                    <span>Terms</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="text-black hover:text-[#E85A6B] transition-colors inline-flex items-center gap-1 group">
                    <span>Cookies</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-4">Connect</h4>
              <div className="flex flex-wrap gap-2">
                <a
                  href="#"
                  className="w-10 h-10 border border-black flex items-center justify-center hover:bg-[#E85A6B] hover:border-[#E85A6B] hover:text-white transition-all duration-300 group"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 border border-black flex items-center justify-center hover:bg-[#E85A6B] hover:border-[#E85A6B] hover:text-white transition-all duration-300 group"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 border border-black flex items-center justify-center hover:bg-[#E85A6B] hover:border-[#E85A6B] hover:text-white transition-all duration-300 group"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-black">
        <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">Eventify</span>
            <span className="text-xs text-gray-400">© {new Date().getFullYear()}</span>
          </div>
          <p className="text-sm text-gray-500 text-center md:text-right">
            Made with <span className="text-[#E85A6B]">♥</span> for event lovers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
};
