import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea'; // Assuming we have this
import { Plus, Trash2, Ticket, ChevronDown, ChevronUp } from 'lucide-react';
import { z } from 'zod';

// Define Metadata Interface
export interface TicketMetadata {
  description_long?: string;
  guidebook_url?: string;
  awards?: string;
  // Dynamic Attributes
  attributes?: { label: string; value: string }[];
  // Legacy support (optional)
  team_size?: string;
  round_type?: string;
}

export interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  isFree: boolean;
  metadata?: TicketMetadata;
  form_id?: string;
  form_title?: string;
}

interface Form {
  id: string;
  title: string;
}

const ticketSchema = z.object({
  name: z.string().trim().min(1, 'Ticket name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().trim().max(500, 'Description must be less than 500 characters'),
  price: z.number().min(0, 'Price cannot be negative').max(1000000, 'Price is too high'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100000, 'Quantity is too high'),
});

interface TicketManagerProps {
  tickets: TicketType[];
  onTicketsChange: (tickets: TicketType[]) => void;
}

export const TicketManager = ({ tickets, onTicketsChange }: TicketManagerProps) => {
  const [isAddingTicket, setIsAddingTicket] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false); // Toggle for metadata fields
  const [newTicket, setNewTicket] = useState<Omit<TicketType, 'id'>>({
    name: '',
    description: '',
    price: 0,
    quantity: 100,
    isFree: true,
    metadata: {
      attributes: [],
      guidebook_url: '',
      awards: '',
      description_long: ''
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [forms, setForms] = useState<Form[]>([]);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const { data } = await api.get('/forms/organizer');
        setForms(data);
      } catch (err) {
        console.error('Failed to load forms', err);
      }
    };
    fetchForms();
  }, []);

  const handleAddTicket = () => {
    setError(null);

    const validationResult = ticketSchema.safeParse({
      name: newTicket.name,
      description: newTicket.description,
      price: newTicket.isFree ? 0 : newTicket.price,
      quantity: newTicket.quantity,
    });

    if (!validationResult.success) {
      setError(validationResult.error.errors[0].message);
      return;
    }

    // Clean up metadata (remove empty strings)
    const cleanedMetadata = { ...newTicket.metadata };
    Object.keys(cleanedMetadata).forEach(key => {
      const k = key as keyof TicketMetadata;
      if (cleanedMetadata[k] === '') delete cleanedMetadata[k];
    });

    const ticket: TicketType = {
      id: crypto.randomUUID(),
      ...newTicket,
      price: newTicket.isFree ? 0 : newTicket.price,
      metadata: Object.keys(cleanedMetadata).length > 0 ? cleanedMetadata : undefined
    };

    onTicketsChange([...tickets, ticket]);
    setNewTicket({
      name: '',
      description: '',
      price: 0,
      quantity: 100,
      isFree: true,
      metadata: {
        attributes: [],
        guidebook_url: '',
        awards: '',
        description_long: ''
      }
    });
    setIsAddingTicket(false);
    setShowAdvanced(false);
  };

  const handleRemoveTicket = (ticketId: string) => {
    onTicketsChange(tickets.filter(t => t.id !== ticketId));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ticket className="w-5 h-5" />
          <h3 className="text-[17px] font-medium">Tickets</h3>
        </div>
        {!isAddingTicket && (
          <button
            type="button"
            onClick={() => setIsAddingTicket(true)}
            className="flex items-center gap-1.5 text-[13px] font-medium uppercase tracking-wider hover:opacity-70 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Ticket
          </button>
        )}
      </div>

      {/* Existing Tickets */}
      {tickets.length > 0 && (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="border border-black p-4 space-y-3 bg-white"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-[15px]">{ticket.name}</span>
                    <span className={`text-[13px] px-2 py-0.5 ${ticket.isFree ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {ticket.isFree ? 'FREE' : `৳${ticket.price.toFixed(2)}`}
                    </span>
                  </div>
                  {ticket.description && (
                    <p className="text-[14px] text-gray-600">{ticket.description}</p>
                  )}
                  {/* Show summary of advanced details if present */}
                  {ticket.metadata && Object.keys(ticket.metadata).length > 0 && (
                    <div className="text-[12px] text-gray-400 mt-1 flex flex-wrap gap-2">
                      {ticket.metadata.team_size && <span>• {ticket.metadata.team_size}</span>}
                      {ticket.metadata.round_type && <span>• {ticket.metadata.round_type}</span>}
                    </div>
                  )}
                  <p className="text-[13px] text-gray-500">
                    {ticket.quantity} tickets available
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveTicket(ticket.id)}
                  className="p-2 hover:bg-gray-100 transition-colors"
                  aria-label="Remove ticket"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Ticket Form */}
      {isAddingTicket && (
        <div className="border border-black p-4 space-y-4 bg-gray-50">
          <div className="space-y-3">
            <Input
              placeholder="Ticket name (e.g., General Admission, VIP)"
              value={newTicket.name}
              onChange={(e) => setNewTicket({ ...newTicket, name: e.target.value })}
              className="border-black focus:ring-0 focus:border-black"
            />
            <Input
              placeholder="Short Description (visible on card)"
              value={newTicket.description}
              onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
              className="border-black focus:ring-0 focus:border-black"
            />

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={newTicket.isFree}
                  onCheckedChange={(checked) => setNewTicket({ ...newTicket, isFree: checked, price: checked ? 0 : newTicket.price })}
                />
                <span className="text-[14px]">Free ticket</span>
              </div>
            </div>

            {!newTicket.isFree && (
              <div className="flex items-center gap-2">
                <span className="text-[14px]">৳</span>
                <Input
                  type="number"
                  placeholder="Price"
                  value={newTicket.price || ''}
                  onChange={(e) => setNewTicket({ ...newTicket, price: parseFloat(e.target.value) || 0 })}
                  className="w-32 border-black focus:ring-0 focus:border-black"
                  min="0"
                  step="0.01"
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-[14px]">Quantity:</span>
              <Input
                type="number"
                placeholder="100"
                value={newTicket.quantity || ''}
                onChange={(e) => setNewTicket({ ...newTicket, quantity: parseInt(e.target.value) || 0 })}
                className="w-32 border-black focus:ring-0 focus:border-black"
                min="1"
              />
            </div>

            {/* Form Selection */}
            <div className="space-y-1">
              <label className="text-[13px] font-medium text-gray-700">Attach Form (Optional)</label>
              <select
                value={newTicket.form_id || ''}
                onChange={(e) => {
                  const formId = e.target.value;
                  const formTitle = forms.find(f => f.id === formId)?.title;
                  setNewTicket({ ...newTicket, form_id: formId || undefined, form_title: formTitle });
                }}
                className="w-full px-3 py-2 bg-white border border-black rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="">No Form Required</option>
                {forms.map(form => (
                  <option key={form.id} value={form.id}>{form.title}</option>
                ))}
              </select>
              <p className="text-[11px] text-gray-500">Attendees must fill this form before checkout.</p>
            </div>

            {/* Advanced Details Toggle */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1 text-[13px] font-bold text-gray-600 uppercase tracking-wider hover:text-black"
              >
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options (Custom Details, Rules, etc.)'}
              </button>

              {showAdvanced && newTicket.metadata && (
                <div className="mt-3 space-y-4 pl-2 border-l-2 border-gray-200 animate-in slide-in-from-top-2 duration-200">

                  {/* Dynamic Attributes Section */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase text-gray-500 block">
                      Ticket Attributes
                    </label>
                    <p className="text-[12px] text-gray-400 mb-2">
                      Add specific details like "Team Size", "Round Type", "Dress Code", "Platform", etc.
                    </p>

                    {(newTicket.metadata.attributes || []).map((attr, idx) => (
                      <div key={idx} className="flex items-center gap-2 mb-2">
                        <Input
                          placeholder="Label (e.g. Team Size)"
                          className="bg-white flex-1 h-9 text-xs"
                          value={attr.label}
                          onChange={(e) => {
                            const newAttrs = [...(newTicket.metadata?.attributes || [])];
                            newAttrs[idx].label = e.target.value;
                            setNewTicket({ ...newTicket, metadata: { ...newTicket.metadata!, attributes: newAttrs } });
                          }}
                        />
                        <Input
                          placeholder="Value (e.g. 4 Members)"
                          className="bg-white flex-[2] h-9 text-xs"
                          value={attr.value}
                          onChange={(e) => {
                            const newAttrs = [...(newTicket.metadata?.attributes || [])];
                            newAttrs[idx].value = e.target.value;
                            setNewTicket({ ...newTicket, metadata: { ...newTicket.metadata!, attributes: newAttrs } });
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newAttrs = newTicket.metadata?.attributes?.filter((_, i) => i !== idx);
                            setNewTicket({ ...newTicket, metadata: { ...newTicket.metadata!, attributes: newAttrs } });
                          }}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        const newAttrs = [...(newTicket.metadata?.attributes || []), { label: '', value: '' }];
                        setNewTicket({ ...newTicket, metadata: { ...newTicket.metadata!, attributes: newAttrs } });
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Attribute
                    </button>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-gray-100">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-500 mb-1 block">Guidebook URL</label>
                      <Input
                        placeholder="https://drive.google.com/..."
                        className="bg-white h-9"
                        value={newTicket.metadata.guidebook_url}
                        onChange={(e) => setNewTicket({ ...newTicket, metadata: { ...newTicket.metadata!, guidebook_url: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-500 mb-1 block">Awards / Prize Pool</label>
                      <Input
                        placeholder="e.g. 10k Prize Pool + Certs"
                        className="bg-white h-9"
                        value={newTicket.metadata.awards}
                        onChange={(e) => setNewTicket({ ...newTicket, metadata: { ...newTicket.metadata!, awards: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-500 mb-1 block">Detailed Description (Modal)</label>
                      <Textarea
                        placeholder="Full details visible in 'See Details' popup..."
                        className="bg-white min-h-[80px]"
                        value={newTicket.metadata.description_long}
                        onChange={(e) => setNewTicket({ ...newTicket, metadata: { ...newTicket.metadata!, description_long: e.target.value } })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {error && (
            <p className="text-red-500 text-[13px]">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleAddTicket}
              className="px-4 py-2 text-[13px] font-medium uppercase tracking-wider bg-black text-white hover:bg-gray-800 transition-colors"
            >
              Add Ticket
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingTicket(false);
                setError(null);
                setNewTicket({
                  name: '',
                  description: '',
                  price: 0,
                  quantity: 100,
                  isFree: true,
                  metadata: {
                    attributes: [],
                    guidebook_url: '',
                    awards: '',
                    description_long: ''
                  }
                });
              }}
              className="px-4 py-2 text-[13px] font-medium uppercase tracking-wider border border-black hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {tickets.length === 0 && !isAddingTicket && (
        <div
          className="border border-dashed border-gray-300 p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
          onClick={() => setIsAddingTicket(true)}
        >
          <Ticket className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-[14px] text-gray-500">No tickets added yet</p>
          <p className="text-[13px] text-gray-400">Click to add your first ticket type</p>
        </div>
      )}
    </div>
  );
};
