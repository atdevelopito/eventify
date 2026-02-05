import React, { useState, useMemo } from 'react';
import { Check, Info, FileText, Users, Trophy, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";

// Extended Ticket Interface to support Metadata
interface TicketMetadata {
  description_long?: string; // For the modal
  guidebook_url?: string;
  awards?: string;
  attributes?: { label: string; value: string }[];
  // Legacy support
  team_size?: string;
  round_type?: string;
}

interface Ticket {
  id: string;
  name: string;
  price: number;
  description: string | null;
  is_free: boolean;
  category?: string;
  metadata?: TicketMetadata; // Optional for now
}

interface TicketOptionsProps {
  tickets: Ticket[];
  selectedTicket: string | null;
  onSelectTicket: (ticketId: string) => void;
  eventTitle?: string;
}

export const TicketOptions: React.FC<TicketOptionsProps> = ({
  tickets,
  selectedTicket,
  onSelectTicket,
  eventTitle
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [detailsTicket, setDetailsTicket] = useState<Ticket | null>(null); // For Modal

  // Extract unique categories from tickets
  const categories = useMemo(() => {
    const cats = new Set<string>();
    tickets.forEach(t => {
      if (t.category) cats.add(t.category);
      else cats.add('General');
    });
    return ['All', ...Array.from(cats)].sort();
  }, [tickets]);

  // Filter tickets based on active category
  const filteredTickets = useMemo(() => {
    if (activeCategory === 'All') return tickets;
    return tickets.filter(t => (t.category || 'General') === activeCategory);
  }, [tickets, activeCategory]);

  // Helper to format price
  const formatPrice = (price: number, isFree: boolean) => {
    if (isFree) return 'Free';
    return price.toString();
  }

  // --- Mock Metadata Injector (Temporary until DB is populated) ---
  // This allows the UI to be fully demonstrated without waiting for backend data entry
  const enrichedTickets = filteredTickets.map(t => {
    // If no metadata at all, inject mock data for demo purposes
    if (!t.metadata || Object.keys(t.metadata).length === 0) {
      // Only inject if it looks like a demo event
      const isTeam = t.name.toLowerCase().includes('showcase') || t.name.toLowerCase().includes('hackathon');
      if (isTeam) {
        return {
          ...t,
          metadata: {
            attributes: [
              { label: 'Team Size', value: '1-3 Students' },
              { label: 'Round Type', value: 'On-site Presentation' }
            ],
            guidebook_url: '#',
            awards: 'Prize Money, Certificate, Medal',
            description_long: t.description || "Join this exciting event to showcase your skills and compete with the best. Detailed rules and regulations are available in the guidebook."
          }
        }
      }
    }
    return t;
  });


  if (tickets.length === 0) {
    return (
      <div className="text-sm text-neutral-500 italic py-8 text-center border border-dashed rounded-lg">
        No tickets available for this event.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between border-b pb-4 border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
          Ticket details & price
        </h3>
      </div>

      {/* Category Tabs */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeCategory === cat
                ? 'bg-black text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-black hover:text-black'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Ticket List (Horizontal Layout) */}
      <div className="flex flex-col gap-4">
        {enrichedTickets.map((ticket) => {
          const isSelected = selectedTicket === ticket.id;
          // Merge Attributes: Support both new 'attributes' array and legacy 'team_size' fields
          const attributes = ticket.metadata?.attributes || [];
          if (ticket.metadata?.team_size) attributes.push({ label: 'Team', value: ticket.metadata.team_size });
          if (ticket.metadata?.round_type) attributes.push({ label: 'Round', value: ticket.metadata.round_type });

          return (
            <div
              key={ticket.id}
              className={`
                relative flex flex-col md:flex-row justify-between rounded-xl bg-white transition-all duration-200 overflow-hidden
                ${isSelected
                  ? 'border-2 border-[#d1410c] shadow-sm'
                  : 'border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }
                `}
              onClick={() => onSelectTicket(ticket.id)}
            >
              {/* Left Side: Info */}
              <div className="flex-1 p-6 pr-8 md:pr-10 relative">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-bold text-xl text-gray-900 leading-tight tracking-tight">
                    {ticket.name}
                  </h4>
                  <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 uppercase tracking-wider border border-gray-200">
                    {ticket.category || 'General'}
                  </span>
                </div>

                {/* Description & Metadata */}
                <div className="space-y-2">
                  {ticket.description && (
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {ticket.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-gray-500">
                    {/* Render Dynamic Attributes */}
                    {attributes.slice(0, 3).map((attr, idx) => ( // Show max 3 on card
                      <div key={idx} className="flex items-center gap-1.5" title={attr.label}>
                        <Check className="w-4 h-4 text-gray-400 stroke-[2]" /> {/* Generic Check Icon for custom attributes */}
                        <span>{attr.value}</span>
                      </div>
                    ))}

                    <div
                      className="flex items-center gap-1.5 text-[#d1410c] font-bold cursor-pointer hover:underline transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetailsTicket(ticket);
                      }}
                    >
                      <Info className="w-4 h-4" />
                      Details
                    </div>
                  </div>
                </div>

                {/* Ticket Notches (Desktop Only) */}
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border border-gray-200 z-10" />
              </div>

              {/* Right Side: Price & Action */}
              <div className="relative flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 p-6 pt-0 md:pt-6 md:pl-8 bg-gray-50/50 md:bg-white md:border-l-2 border-dashed border-gray-100 min-w-[200px]">
                {/* Ticket Notches (Negative space approach for cleaner look) */}
                <div className="hidden md:block absolute -left-3 -top-3 w-6 h-6 bg-white rounded-full border-b border-gray-200 z-10" />
                <div className="hidden md:block absolute -left-3 -bottom-3 w-6 h-6 bg-white rounded-full border-t border-gray-200 z-10" />

                <div className="flex flex-col items-start md:items-end">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Price</span>
                  <div className="flex items-baseline gap-0.5">
                    {!ticket.is_free && <span className="text-lg font-bold text-gray-900">৳</span>}
                    <span className="text-3xl font-bold text-gray-900 tracking-tighter">
                      {formatPrice(ticket.price, ticket.is_free)}
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  className={`rounded-lg text-xs font-bold h-10 px-6 shadow-none transition-all duration-200 ${isSelected
                    ? 'bg-[#d1410c] hover:bg-[#b8380b] text-white pointer-events-none opacity-100'
                    : 'bg-[#d1410c] hover:bg-[#b8380b] text-white hover:-translate-y-0.5'
                    }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTicket(ticket.id);
                  }}
                >
                  {isSelected ? 'Selected' : 'Buy Now'}
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Ticket Details Modal */}
      <Dialog open={!!detailsTicket} onOpenChange={(open) => !open && setDetailsTicket(null)}>
        <DialogContent className="sm:max-w-xl bg-white p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
          {detailsTicket && (
            <>
              <div className="p-6 pb-0">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{detailsTicket.name}</h2>
                    <p className="text-gray-500 font-medium">{detailsTicket.category || 'Event Ticket'}</p>
                  </div>
                  <div className="bg-gray-50 px-4 py-2 rounded-xl text-right">
                    <span className="block text-xs text-gray-400 font-bold uppercase">Price</span>
                    <span className="text-xl font-bold text-gray-900">
                      {detailsTicket.is_free ? 'Free' : `৳ ${detailsTicket.price}`}
                    </span>
                  </div>
                </div>

                <div className="prose prose-sm prose-gray max-w-none mb-6">
                  <p className="text-gray-600 leading-relaxed">
                    {detailsTicket.metadata?.description_long || detailsTicket.description}
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {/* Render Dynamic Attributes in Modal */}
                  {(detailsTicket.metadata?.attributes || []).map((attr, idx) => (
                    <div key={idx} className="flex flex-col">
                      <span className="text-xs font-bold text-gray-400 uppercase">{attr.label}</span>
                      <span className="font-medium text-gray-900 flex items-center gap-2">
                        <Check className="w-4 h-4 text-gray-500" />
                        {attr.value}
                      </span>
                    </div>
                  ))}
                  {/* Legacy Fallback in Modal */}
                  {detailsTicket.metadata?.team_size && !detailsTicket.metadata.attributes?.some(a => a.label === 'Team') && (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-400 uppercase">Team Size</span>
                      <span className="font-medium text-gray-900 flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        {detailsTicket.metadata.team_size}
                      </span>
                    </div>
                  )}
                  {detailsTicket.metadata?.round_type && !detailsTicket.metadata.attributes?.some(a => a.label === 'Round') && (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-400 uppercase">Round Type</span>
                      <span className="font-medium text-gray-900 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-gray-500" />
                        {detailsTicket.metadata.round_type}
                      </span>
                    </div>
                  )}

                  {detailsTicket.metadata?.awards && (
                    <div className="flex flex-col sm:col-span-2">
                      <span className="text-xs font-bold text-gray-400 uppercase">Awards</span>
                      <span className="font-medium text-gray-900">
                        {detailsTicket.metadata.awards}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4">
                {detailsTicket.metadata?.guidebook_url && (
                  <a
                    href={detailsTicket.metadata.guidebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-gray-600 hover:text-black flex items-center gap-2 underline decoration-gray-300 underline-offset-4"
                  >
                    <FileText className="w-4 h-4" />
                    View Guidebook
                  </a>
                )}
                <div className="flex gap-3 ml-auto">
                  <Button variant="outline" onClick={() => setDetailsTicket(null)} className="rounded-full">
                    Close
                  </Button>
                  <Button
                    className="rounded-full bg-black text-white hover:bg-gray-800 px-6"
                    onClick={() => {
                      onSelectTicket(detailsTicket.id);
                      setDetailsTicket(null);
                    }}
                  >
                    Select This Ticket
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
