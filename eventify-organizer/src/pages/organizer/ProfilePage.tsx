import { useState, useEffect } from "react";
import { PageHeader, Card } from "@/components/organizer/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Globe, Twitter, Linkedin, Instagram, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { useRole } from "@/components/RoleContext"; // Or wherever AuthContext is
import { toast } from "sonner";

export function ProfilePage() {
    const { user, checkAuth: refreshUser } = useRole(); // user is from context, but we might want fresh dashboard data
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        name: "",
        organization_name: "",
        bio: "",
        website: "",
        social_links: {
            twitter: "",
            linkedin: "",
            instagram: ""
        }
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // We could use 'user' from context, but fetching from /dashboard confirms fresh DB state
                // Actually the context usually calls check-auth or similar.
                // Let's rely on the user object from context but if it's missing fields, fetch.
                // Or just use the one we just updated in backend -> /api/user/dashboard
                const res = await api.get('/user/dashboard'); // Helper endpoint
                const userData = res.data.user;

                setFormData({
                    name: userData.name || "",
                    organization_name: userData.organization_name || "",
                    bio: userData.bio || "",
                    website: userData.website || "",
                    social_links: {
                        twitter: userData.social_links?.twitter || "",
                        linkedin: userData.social_links?.linkedin || "",
                        instagram: userData.social_links?.instagram || ""
                    }
                });
            } catch (error) {
                console.error("Error fetching profile", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSocialChange = (platform: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            social_links: { ...prev.social_links, [platform]: value }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/user/profile', formData);
            toast.success("Profile updated successfully");
            refreshUser(); // Update global context if possible
        } catch (error) {
            console.error("Save error", error);
            toast.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        try {
            const res = await api.post('/user/profile-picture', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Profile picture updated");
            refreshUser(); // Update visual immediately in sidebar etc
            // Ideally also update local state if we showed it from there, but we rely on context usually 
            // We can force reload or wait for refreshUser
            window.location.reload(); // Simplest way to propagate avatar changes everywhere if context sync is complex
        } catch (error) {
            toast.error("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6 max-w-3xl pb-10">
            <PageHeader
                title="Profile"
                description="Manage your organizer profile and public information"
            />

            <Card title="Profile Photo">
                <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20 border border-gray-100">
                        <AvatarImage src={user?.avatar_url ? `http://localhost:5000${user.avatar_url}` : ""} />
                        <AvatarFallback className="bg-gray-100 text-gray-400 text-2xl font-bold">
                            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="relative">
                            <input
                                type="file"
                                id="avatar-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                disabled={uploading}
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                className="relative overflow-hidden hover:border-[#E85A6B] hover:text-[#E85A6B]"
                                onClick={() => document.getElementById('avatar-upload')?.click()}
                                disabled={uploading}
                            >
                                {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Camera className="w-4 h-4 mr-2" />}
                                {uploading ? "Uploading..." : "Change Photo"}
                            </Button>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2">JPG, PNG or WEBP. Max 2MB.</p>
                    </div>
                </div>
            </Card>

            <Card title="Basic Information">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                            />
                        </div>
                        {/* 
                         We store 'name' as single field in DB for now. 
                         If user wants First/Last split, we'd need schema update. 
                         Keeping it simple as per current user_routes.
                        */}
                    </div>
                    <div className="space-y-2">
                        <Label>Organization Name</Label>
                        <Input
                            value={formData.organization_name}
                            onChange={(e) => handleChange('organization_name', e.target.value)}
                            placeholder="e.g. Eventify Inc."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Bio</Label>
                        <Textarea
                            value={formData.bio}
                            onChange={(e) => handleChange('bio', e.target.value)}
                            placeholder="Tell us about yourself..."
                            rows={3}
                        />
                    </div>
                    <div className="pt-2">
                        <Button onClick={handleSave} disabled={saving} className="bg-[#E85A6B] hover:bg-[#d64556]">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Save Changes
                        </Button>
                    </div>
                </div>
            </Card>

            <Card title="Social Links">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-gray-400" />
                        <Input
                            value={formData.website}
                            onChange={(e) => handleChange('website', e.target.value)}
                            placeholder="https://yourwebsite.com"
                            className="flex-1"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <Twitter className="w-5 h-5 text-gray-400" />
                        <Input
                            value={formData.social_links.twitter}
                            onChange={(e) => handleSocialChange('twitter', e.target.value)}
                            placeholder="@username"
                            className="flex-1"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <Linkedin className="w-5 h-5 text-gray-400" />
                        <Input
                            value={formData.social_links.linkedin}
                            onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                            placeholder="linkedin.com/in/username"
                            className="flex-1"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <Instagram className="w-5 h-5 text-gray-400" />
                        <Input
                            value={formData.social_links.instagram}
                            onChange={(e) => handleSocialChange('instagram', e.target.value)}
                            placeholder="@username"
                            className="flex-1"
                        />
                    </div>
                    <div className="pt-2">
                        <Button onClick={handleSave} disabled={saving} className="bg-[#E85A6B] hover:bg-[#d64556]">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Save Changes
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
