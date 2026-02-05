import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '@/components/RoleContext';
import api from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { SEOHead } from '@/components/SEOHead';
import { Footer } from '@/components/Footer';
import { CartButton } from '@/components/CartButton';
import { CartDrawer } from '@/components/CartDrawer';
import { getImageUrl } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  User as UserIcon,
  Ticket,
  Calendar,
  MapPin,
  Clock,
  ChevronRight,
  Mail,
  Edit2,
  Save,
  X,
  LogOut,
  Camera,
  Loader2,
  QrCode,
  History,
  ShoppingBag,
  Phone
} from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MorphButton } from '@/components/ui/morph-button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RegisteredEvent {
  id: string;
  event_id: string;
  registered_at: string;
  event: {
    id: string;
    title: string;
    date: string;
    time: string;
    address: string;
    background_image_url: string;
    target_date: string;
  };
}

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
  avatar_url?: string | null;
  bio?: string | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useRole();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tickipass' | 'orders' | 'history'>('tickipass');
  const [registrations, setRegistrations] = useState<RegisteredEvent[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);


  useEffect(() => {
    let mounted = true;

    const initDashboard = async () => {
      if (!authLoading) {
        if (!user) {
          navigate('/auth');
          return;
        }

        if (user && mounted) {
          await fetchUserData();
        }
      }
    };

    initDashboard();

    return () => {
      mounted = false;
    };
  }, [user, authLoading, navigate]);

  const fetchUserData = async () => {
    let mounted = true;
    try {
      // Fetch registrations only - user data comes from RoleContext
      const registrationsRes = await api.get('/registrations/my');

      if (!mounted) return;

      // Set display name from user context
      if (user?.name) {
        setDisplayName(user.name);
      }

      if (registrationsRes.data) {
        const formattedData = registrationsRes.data
          .filter((reg: any) => reg.event)
          .map((reg: any) => ({
            id: reg._id || reg.id,
            event_id: reg.event.id,
            registered_at: reg.registered_at,
            event: {
              id: reg.event.id,
              title: reg.event.title,
              date: reg.event.date,
              time: reg.event.time,
              address: reg.event.address,
              background_image_url: reg.event.background_image_url,
              target_date: reg.event.target_date
            }
          }));
        setRegistrations(formattedData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
    return () => { mounted = false; };
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      await api.put('/user/profile', {
        name: displayName
      });

      setIsEditingProfile(false);
      toast.success('Profile updated successfully');
      // Refresh user data from context
      window.location.reload();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) return;
      if (!user) return;

      const file = event.target.files[0];
      setUploadingAvatar(true);

      const formData = new FormData();
      formData.append('image', file);

      // Upload directly to user profile picture endpoint
      const { data } = await api.post('/user/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Avatar updated!');
      // Refresh to get new avatar
      window.location.reload();
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast.error('Error uploading avatar: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const upcomingEvents = registrations.filter(reg => !isPast(parseISO(reg.event.target_date)));
  const pastEvents = registrations.filter(reg => isPast(parseISO(reg.event.target_date)));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead title="Dashboard" description="Manage your tickets and profile." />
      <Navbar />

      <main className="pt-24 pb-24 px-4 md:px-8">
        <div className="max-w-md mx-auto md:max-w-2xl lg:max-w-4xl space-y-8">

          <div className="bg-card text-card-foreground p-6 rounded-none border border-border shadow-none">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-border">
                  {user?.avatar_url ? (
                    <img src={getImageUrl(user.avatar_url)} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white text-3xl font-bold">
                      {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-1">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white">
                  Hello, {user?.name || 'User'}
                </h1>

                <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-sm text-muted-foreground justify-center md:justify-start">
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {user?.email}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-center md:justify-end">
              <Drawer open={isEditingProfile} onOpenChange={setIsEditingProfile}>
                <DrawerTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full border-foreground hover:bg-foreground hover:text-background transition-colors">
                    Edit Profile <Edit2 className="w-3 h-3 ml-2" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                      <DrawerTitle>Edit Profile</DrawerTitle>
                      <DrawerDescription>Make changes to your profile here. Click save when you're done.</DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 space-y-6">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative group cursor-pointer">
                          <div className="w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-border">
                            {user?.avatar_url ? (
                              <img src={getImageUrl(user.avatar_url)} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white text-3xl font-bold">
                                {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                              </div>
                            )}
                            {uploadingAvatar && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                              </div>
                            )}
                          </div>
                          <label className="absolute bottom-0 right-0 p-2 bg-foreground text-background rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg">
                            <Camera className="w-4 h-4" />
                            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                          </label>
                        </div>

                        <div className="space-y-2 w-full">
                          <label className="text-sm font-medium">Display Name</label>
                          <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="bg-transparent border border-input rounded-md px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus:ring-2 focus:ring-ring focus:border-input w-full text-foreground"
                            placeholder="Enter your name"
                          />
                        </div>
                      </div>
                    </div>
                    <DrawerFooter>
                      <MorphButton
                        onClick={handleSaveProfile}
                        isLoading={savingProfile}
                        text="Save Changes"
                        className="w-full rounded-md bg-[#E85A6B] text-white hover:bg-[#a00f40] border-0"
                      />
                      <DrawerClose asChild>
                        <Button variant="outline" className="w-full">Cancel</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </div>
                </DrawerContent>
              </Drawer>

              <Button onClick={() => toast.info('Password reset feature coming soon!')} variant="ghost" size="sm" className="rounded-full hover:bg-muted text-muted-foreground hidden md:inline-flex">
                Reset Password
              </Button>
              <Button
                onClick={() => {
                  signOut();
                  navigate('/');
                  toast.success('Signed out successfully');
                }}
                variant="ghost"
                size="sm"
                className="rounded-full hover:bg-red-50 text-red-600 hover:text-red-700"
              >
                Sign Out <LogOut className="w-3 h-3 ml-2" />
              </Button>
            </div>
          </div>

          {/* 2. Action Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-border">
            <button
              onClick={() => setActiveTab('tickipass')}
              className={`flex items-center gap-2 px-6 py-3 font-bold transition-all border-b-2 ${activeTab === 'tickipass'
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              <div className="flex items-center gap-2 uppercase tracking-wide text-xs">
                <QrCode className="w-4 h-4" /> TICKIPASS
              </div>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-6 py-3 font-bold transition-all border-b-2 ${activeTab === 'orders'
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              <div className="flex items-center gap-2 uppercase tracking-wide text-xs">
                <ShoppingBag className="w-4 h-4" /> Orders
              </div>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-6 py-3 font-bold transition-all border-b-2 ${activeTab === 'history'
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              <div className="flex items-center gap-2 uppercase tracking-wide text-xs">
                <History className="w-4 h-4" /> History
              </div>
            </button>
          </div>

          {/* 3. Content Area */}
          <div className="space-y-6">
            {activeTab === 'tickipass' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-8">
                  <h2 className="text-lg font-bold uppercase tracking-wider mb-2">Your Event Passes</h2>
                  <p className="text-muted-foreground text-sm">All your tickets are available below.</p>
                </div>

                {registrations.length === 0 ? (
                  <div className="border border-dashed border-border p-12 text-center flex flex-col items-center">
                    <div className="w-20 h-20 mb-6 bg-muted rounded-full flex items-center justify-center">
                      <Ticket className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No tickets yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-xs mx-auto text-sm">
                      Your event tickets will appear here.
                    </p>
                    <Button onClick={() => navigate('/discover')} className="rounded-full px-8 bg-foreground text-background hover:bg-foreground/90 uppercase tracking-wider text-xs font-bold py-6">
                      Explore Events
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {registrations.map(reg => (
                      <motion.div
                        key={reg.id}
                        whileHover={{ y: -4 }}
                        className="bg-card text-card-foreground rounded-none border border-border overflow-hidden group cursor-pointer"
                        onClick={() => navigate(`/event/${reg.event.id}`)}
                      >
                        <div className="h-48 overflow-hidden relative grayscale group-hover:grayscale-0 transition-all duration-500">
                          {/* Use getImageUrl helper */}
                          <img
                            src={getImageUrl(reg.event.background_image_url) || ''}
                            alt={reg.event.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex items-end p-6">
                            <div className="text-white">
                              <h3 className="font-bold text-xl leading-none mb-2">{reg.event.title}</h3>
                              <div className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-80">
                                <Calendar className="w-3 h-3" /> {reg.event.date}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 flex justify-between items-center border-t border-border">
                          <div className="text-xs text-muted-foreground">
                            <span className="uppercase tracking-wider font-bold">Ticket ID:</span> {reg.id.slice(0, 8)}
                          </div>
                          <div className="flex items-center gap-1 text-[#E85A6B] font-bold text-xs uppercase tracking-wider">
                            View <ChevronRight className="w-3 h-3" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-sm font-bold uppercase tracking-wider mb-4 text-muted-foreground">Past Orders</h2>
                {registrations.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground border border-dashed border-border">No orders found.</div>
                ) : (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Image</TableHead>
                          <TableHead>Event</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {registrations.map((reg) => (
                          <TableRow key={reg.id}>
                            <TableCell>
                              <div className="w-16 h-10 bg-muted rounded overflow-hidden">
                                {reg.event.background_image_url ? (
                                  <img
                                    src={getImageUrl(reg.event.background_image_url) || ''}
                                    alt={reg.event.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">IMG</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{reg.event.title}</TableCell>
                            <TableCell>
                              {reg.registered_at && typeof reg.registered_at === 'string'
                                ? format(parseISO(reg.registered_at), 'PPP')
                                : 'Date N/A'}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] uppercase font-bold tracking-wider rounded">Paid</span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-sm font-bold uppercase tracking-wider mb-4 text-muted-foreground">Event History</h2>
                {pastEvents.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground border border-dashed border-border">No past events.</div>
                ) : (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Image</TableHead>
                          <TableHead>Event</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pastEvents.map((reg) => (
                          <TableRow key={reg.id} className="opacity-60 hover:opacity-100 transition-opacity">
                            <TableCell>
                              <div className="w-16 h-10 bg-muted rounded overflow-hidden grayscale hover:grayscale-0 transition-all">
                                <img
                                  src={getImageUrl(reg.event.background_image_url) || ''}
                                  alt={reg.event.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{reg.event.title}</TableCell>
                            <TableCell>{reg.event.date}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="link"
                                size="sm"
                                className="p-0 h-auto text-xs"
                                onClick={() => navigate(`/event/${reg.event.id}`)}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </main>

      <div className="md:hidden pb-16">
        {/* Spacing for mobile nav */}
      </div>
      <Footer />
      <CartButton />
      <CartDrawer />
    </div>
  );
};

export default Dashboard;
