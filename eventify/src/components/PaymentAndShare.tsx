// ... imports remain the same but ensure we have the right assets
import React from 'react';
import { Facebook, Twitter, Mail, Link2, CalendarPlus } from 'lucide-react';
import { toast } from '@/components/ui/toast';
// Use placeholders or actual imports if available. Assuming existing imports are correct for now.
// If not, we might need to adjust or use placeholders.
import bkashLogo from '@/assets/bkash-logo.png';
import sslcommerzLogos from '@/assets/sslcommerz-logos.jpg';
import pathaoPayLogo from '@/assets/pathao-pay-logo.png';

interface PaymentAndShareProps {
  eventTitle: string;
  eventDate: string;
  eventAddress: string;
}

export const PaymentAndShare: React.FC<PaymentAndShareProps> = ({
  eventTitle,
  eventDate,
  eventAddress
}) => {
  const currentUrl = window.location.href;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedTitle = encodeURIComponent(eventTitle);

    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      email: `mailto:?subject=${encodedTitle}&body=Check out this event: ${encodedUrl}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'noopener,noreferrer');
    }
  };

  const handleAddToCalendar = () => {
    const startDate = new Date(eventDate);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration

    const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, '').slice(0, 15) + 'Z';

    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&location=${encodeURIComponent(eventAddress)}&sf=true&output=xml`;

    window.open(calendarUrl, '_blank', 'noopener,noreferrer');
  };

  const buttonBaseClass = "flex items-center justify-center transition-all bg-white border border-gray-200 hover:border-gray-400 hover:shadow-sm rounded-md";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
      {/* Payment Methods */}
      <div className="flex flex-col gap-5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">
          Payment Methods
        </h3>
        <div className="flex flex-col gap-3">
          <button className={`${buttonBaseClass} p-4 gap-4 justify-start`}>
            <img src={bkashLogo} alt="bKash" className="h-6 w-auto object-contain" />
            <span className="text-sm font-medium text-gray-700">Pay with bKash</span>
          </button>

          <button className={`${buttonBaseClass} p-6 flex-col gap-3 text-center`}>
            <img src={sslcommerzLogos} alt="SSLCommerz" className="h-6 w-auto object-contain mx-auto opacity-90" />
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-tight">Pay with SSLCommerz (Card, Mobile Banking)</span>
          </button>

          <button className={`${buttonBaseClass} p-4 gap-4 justify-start`}>
            {/* Fallback styling for pathao pay if logo is missing or different size */}
            <div className="flex items-center gap-2">
              <img src={pathaoPayLogo} alt="Pathao Pay" className="h-5 w-auto object-contain" />
            </div>
            <span className="text-sm font-medium text-gray-700">Pay with Pathao Pay</span>
          </button>
        </div>
      </div>

      {/* Share on Socials */}
      <div className="flex flex-col gap-5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">
          Share on Socials
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleShare('facebook')}
            className={`${buttonBaseClass} p-3 gap-2.5`}
          >
            <Facebook className="w-4 h-4 text-gray-700" />
            <span className="text-sm font-medium text-gray-600">Facebook</span>
          </button>

          <button
            onClick={() => handleShare('twitter')}
            className={`${buttonBaseClass} p-3 gap-2.5`}
          >
            <Twitter className="w-4 h-4 text-gray-700" />
            <span className="text-sm font-medium text-gray-600">Twitter</span>
          </button>

          <button
            onClick={() => handleShare('email')}
            className={`${buttonBaseClass} p-3 gap-2.5`}
          >
            <Mail className="w-4 h-4 text-gray-700" />
            <span className="text-sm font-medium text-gray-600">Email</span>
          </button>

          <button
            onClick={handleCopyLink}
            className={`${buttonBaseClass} p-3 gap-2.5`}
          >
            <Link2 className="w-4 h-4 text-gray-700" />
            <span className="text-sm font-medium text-gray-600">Copy Link</span>
          </button>
        </div>

        <button
          onClick={handleAddToCalendar}
          className={`${buttonBaseClass} p-4 gap-2.5 w-full mt-1 border-gray-300`}
        >
          <CalendarPlus className="w-4 h-4 text-gray-700" />
          <span className="text-sm font-semibold text-gray-800">Add to Calendar</span>
        </button>
      </div>
    </div>
  );
};
