import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, ArrowRight, Check } from 'lucide-react';
import { toast } from '@/components/ui/toast';

export const NewsletterCTA = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsSubmitting(true);

    // Simulate subscription (replace with actual API call)
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSubscribed(true);
    setIsSubmitting(false);
    toast.success('Successfully subscribed!');
    setEmail('');
  };

  return (
    <section className="px-4 md:px-8 py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        <div className="bg-black text-white p-8 md:p-12 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#E85A6B] rounded-full -translate-y-1/2 translate-x-1/2 opacity-80" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#E85A6B] rounded-full translate-y-1/2 -translate-x-1/2 opacity-60" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5" />
              <span className="text-sm font-medium uppercase tracking-wider">Newsletter</span>
            </div>

            <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium mb-4">
              Never miss an event
            </h2>

            <p className="text-gray-300 mb-8 max-w-lg">
              Get weekly updates on the hottest events in your area. Exclusive early access and special offers delivered straight to your inbox.
            </p>

            {isSubscribed ? (
              <div className="flex items-center gap-2 text-[#E85A6B]">
                <Check className="w-5 h-5" />
                <span className="font-medium">You're subscribed! Check your inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white text-black border-0 h-12 flex-1"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#E85A6B] hover:bg-[#990e3d] text-white font-medium h-12 px-6 flex items-center gap-2"
                >
                  {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            )}

            <p className="text-gray-500 text-xs mt-4">
              By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
