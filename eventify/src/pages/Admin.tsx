import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { useRole } from '@/components/RoleContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/toast';
import { z } from 'zod';
import { SEOHead } from '@/components/SEOHead';

// Input validation schema
const eventSchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  creator: z.string()
    .trim()
    .min(1, 'Creator is required')
    .max(100, 'Creator must be less than 100 characters'),
  description: z.string()
    .trim()
    .min(1, 'Description is required')
    .max(2000, 'Description must be less than 2000 characters'),
  date: z.string()
    .trim()
    .min(1, 'Date is required')
    .max(50, 'Date must be less than 50 characters'),
  time: z.string()
    .trim()
    .min(1, 'Time is required')
    .max(50, 'Time must be less than 50 characters'),
  address: z.string()
    .trim()
    .min(1, 'Address is required')
    .max(300, 'Address must be less than 300 characters'),
  target_date: z.string()
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, 'Invalid date format'),
});

interface Event {
  id: string;
  title: string;
  creator: string;
  description: string;
  date: string;
  time: string;
  address: string;
  background_image_url: string;
  target_date: string;
}

const Admin = () => {
  const { user, role, loading: authLoading, signOut } = useRole();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  // const { toast } = useToast(); // Removed

  useEffect(() => {
    if (!authLoading) {
      if (!user) { // || role !== 'admin') {
        // Backend will enforce admin on routes anyway, but UI could check too
        toast.error('You need to be logged in', { title: 'Access Denied' });
        navigate('/');
        return;
      }
      // Loading state is now handled inside fetchEvents
      fetchEvents();
    }
  }, [user, role, authLoading, navigate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/events?limit=1000'); // Fetch all for admin
      // data might be { events: [], page: 1, ... }
      const eventsList = data.events || [];

      // Need to map _id to id if frontend uses id
      const formattedEvents = eventsList.map((e: any) => ({
        ...e,
        id: e._id // Map _id to id
      }));

      setEvents(formattedEvents);
      if (formattedEvents.length > 0) {
        setSelectedEvent(formattedEvents[0]);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch events', { title: 'Error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !selectedEvent) return;

    const file = e.target.files[0];

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, GIF, or WebP image', { title: 'Invalid file type' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB', { title: 'File too large' });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const { data: uploadPath } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const backendUrl = (import.meta.env?.VITE_BACKEND_URL as string) || 'http://localhost:5000';
      const publicUrl = `${backendUrl}${uploadPath}`;

      setSelectedEvent({ ...selectedEvent, background_image_url: publicUrl });

      // Should we save immediately? Or just update state?
      // Logic below suggests handleSave is separate.

      toast.success('Image uploaded successfully', { title: 'Success' });
    } catch (error: any) {
      toast.error(error.message, { title: 'Error' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    // Convert datetime-local string to ISO timestamp
    const targetDateISO = selectedEvent.target_date.includes('T')
      ? new Date(selectedEvent.target_date).toISOString()
      : selectedEvent.target_date;

    // Validate event data
    try {
      eventSchema.parse({
        title: selectedEvent.title,
        creator: selectedEvent.creator,
        description: selectedEvent.description,
        date: selectedEvent.date,
        time: selectedEvent.time,
        address: selectedEvent.address,
        target_date: targetDateISO,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message, { title: 'Validation Error' });
        return;
      }
    }

    try {
      await api.put(`/events/${selectedEvent.id}`, {
        title: selectedEvent.title.trim(),
        creator: selectedEvent.creator.trim(),
        description: selectedEvent.description.trim(),
        date: selectedEvent.date.trim(),
        time: selectedEvent.time.trim(),
        address: selectedEvent.address.trim(),
        background_image_url: selectedEvent.background_image_url,
        target_date: targetDateISO,
      });

      toast.success('Event updated successfully', { title: 'Success' });
      fetchEvents();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update event', { title: 'Error' });
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <SEOHead
        title="Admin Dashboard"
        description="Manage events and content for your event platform"
      />
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-normal text-[#1A1A1A] tracking-[-0.02em]">
            Event CMS
          </h1>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>

        {selectedEvent && (
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="text-[#1A1A1A] text-sm font-normal uppercase mb-2 block">
                Event Title
              </label>
              <Input
                value={selectedEvent.title}
                onChange={(e) =>
                  setSelectedEvent({ ...selectedEvent, title: e.target.value })
                }
                className="border-[#1A1A1A]"
              />
            </div>

            <div>
              <label className="text-[#1A1A1A] text-sm font-normal uppercase mb-2 block">
                Creator
              </label>
              <Input
                value={selectedEvent.creator}
                onChange={(e) =>
                  setSelectedEvent({ ...selectedEvent, creator: e.target.value })
                }
                className="border-[#1A1A1A]"
              />
            </div>

            <div>
              <label className="text-[#1A1A1A] text-sm font-normal uppercase mb-2 block">
                Description
              </label>
              <Textarea
                value={selectedEvent.description}
                onChange={(e) =>
                  setSelectedEvent({ ...selectedEvent, description: e.target.value })
                }
                className="border-[#1A1A1A] min-h-[120px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[#1A1A1A] text-sm font-normal uppercase mb-2 block">
                  Date
                </label>
                <Input
                  value={selectedEvent.date}
                  onChange={(e) =>
                    setSelectedEvent({ ...selectedEvent, date: e.target.value })
                  }
                  className="border-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="text-[#1A1A1A] text-sm font-normal uppercase mb-2 block">
                  Time
                </label>
                <Input
                  value={selectedEvent.time}
                  onChange={(e) =>
                    setSelectedEvent({ ...selectedEvent, time: e.target.value })
                  }
                  className="border-[#1A1A1A]"
                />
              </div>
            </div>

            <div>
              <label className="text-[#1A1A1A] text-sm font-normal uppercase mb-2 block">
                Address
              </label>
              <Input
                value={selectedEvent.address}
                onChange={(e) =>
                  setSelectedEvent({ ...selectedEvent, address: e.target.value })
                }
                className="border-[#1A1A1A]"
              />
            </div>

            <div>
              <label className="text-[#1A1A1A] text-sm font-normal uppercase mb-2 block">
                Background Image
              </label>
              {selectedEvent.background_image_url && (
                <img
                  src={selectedEvent.background_image_url}
                  alt="Current background"
                  className="w-full h-32 object-cover mb-2 rounded"
                />
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="border-[#1A1A1A]"
              />
              {uploading && <p className="text-sm text-[#1A1A1A] mt-1">Uploading...</p>}
            </div>

            <div>
              <label className="text-[#1A1A1A] text-sm font-normal uppercase mb-2 block">
                Target Date (YYYY-MM-DD HH:MM:SS)
              </label>
              <Input
                type="datetime-local"
                value={selectedEvent.target_date.slice(0, 16)}
                onChange={(e) =>
                  setSelectedEvent({ ...selectedEvent, target_date: e.target.value })
                }
                className="border-[#1A1A1A]"
              />
            </div>

            <Button type="submit" className="w-full bg-[#1A1A1A] text-white hover:bg-opacity-90">
              Save Changes
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Admin;
