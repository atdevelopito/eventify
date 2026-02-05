import React, { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, Save, Globe, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { toast } from '@/components/ui/toast';

interface ProfileData {
    display_name: string;
    bio: string;
    avatar_url: string;
    social_links: {
        website: string;
        facebook: string;
        twitter: string;
        instagram: string;
        youtube: string;
    };
}

interface OrganizerProfileEditorProps {
    userId: string | undefined;
}

export const OrganizerProfileEditor: React.FC<OrganizerProfileEditorProps> = ({ userId }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<ProfileData>({
        display_name: '',
        bio: '',
        avatar_url: '',
        social_links: {
            website: '',
            facebook: '',
            twitter: '',
            instagram: '',
            youtube: '',
        }
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (userId) {
            fetchProfile();
        }
    }, [userId]);

    const fetchProfile = async () => {
        try {
            // Use profile ID (userId) to fetch. 
            // If userId matches current user, we could use /me, but /:userId works too if public/private is handled.
            // profileRoutes now supports GET /:userId
            const { data } = await api.get(`/profiles/${userId}`);

            if (data) {
                const social = (data.social_links as any) || {};
                setProfile({
                    display_name: data.display_name || '',
                    bio: data.bio || '',
                    avatar_url: data.avatar_url || '',
                    social_links: {
                        website: social.website || '',
                        facebook: social.facebook || '',
                        twitter: social.twitter || '',
                        instagram: social.instagram || '',
                        youtube: social.youtube || '',
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            // toast.error('Failed to load profile'); 
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: keyof ProfileData, value: string) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const handleSocialChange = (field: keyof ProfileData['social_links'], value: string) => {
        setProfile(prev => ({
            ...prev,
            social_links: {
                ...prev.social_links,
                [field]: value
            }
        }));
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !userId) return;

        // Validate
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        try {
            toast.loading("Uploading avatar...");

            const formData = new FormData();
            formData.append('image', file);

            const { data: uploadPath } = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
            const publicUrl = `${backendUrl}${uploadPath}`;

            setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
            toast.dismiss();
            toast.success("Avatar uploaded");

        } catch (error) {
            console.error('Error uploading avatar:', error);
            toast.dismiss();
            toast.error('Failed to upload avatar');
        }
    };

    const handleSave = async () => {
        if (!userId) return;
        setSaving(true);
        try {
            // PUT /profiles/me updates the CURRENT user's profile.
            // Ensure userId matches current logged in user.
            // The Editor is presumably for the current user.
            await api.put('/profiles/me', {
                display_name: profile.display_name,
                bio: profile.bio,
                avatar_url: profile.avatar_url,
                // social_links: profile.social_links // profileRoutes Update logic needs to support social_links?
                // Step 345 shows profileRoutes PUT /me accepts display_name, avatar_url, bio.
                // It does NOT explicitly destructure social_links.
                // But Mongoose model might allow it if schema has it?
                // I need to update profileRoutes.js to handle social_links too.
                // Or I update it right now in the same tool call? 
                // I can't update two files in one replace_file_content.
                // I will update profileRoutes.js in next step or previous step.
                // Wait, I just edited profileRoutes.js in this turn for GET.
                // I should have edited PUT too.
                // I will add social_links support to profileRoutes in a separate call or same if I can combine edits? No, separate files.
            });

            // I need to send social_links. I'll pass it, and fix backend to accept it.
            // Actually I should make a separate tool call to fix backend PUT first or concurrently.

            const { data } = await api.put('/profiles/me', {
                display_name: profile.display_name,
                bio: profile.bio,
                avatar_url: profile.avatar_url,
                social_links: profile.social_links
            });

            toast.success('Profile updated successfully');
        } catch (error: any) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile: ' + (error.message || 'Unknown error'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Public Profile</CardTitle>
                    <CardDescription>
                        Update your public organizer profile. This information will be visible to everyone.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    {/* Avatar */}
                    <div className="flex items-center gap-6">
                        <Avatar className="w-24 h-24 border">
                            <AvatarImage src={profile.avatar_url} />
                            <AvatarFallback>{profile.display_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="w-4 h-4 mr-2" /> Change Avatar
                            </Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                            />
                            <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size of 5MB.</p>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="display_name">Display Name</Label>
                            <Input
                                id="display_name"
                                value={profile.display_name}
                                onChange={(e) => handleChange('display_name', e.target.value)}
                                placeholder="Your organizer name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                value={profile.bio}
                                onChange={(e) => handleChange('bio', e.target.value)}
                                maxLength={500}
                                className="h-32"
                                placeholder="Tell us about yourself..."
                            />
                            <p className="text-xs text-muted-foreground text-right">{profile.bio.length}/500</p>
                        </div>
                    </div>

                    <div className="border-t pt-6">
                        <h3 className="text-lg font-medium mb-4">Social Links</h3>
                        <div className="grid gap-4">
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Website URL"
                                    value={profile.social_links.website}
                                    onChange={(e) => handleSocialChange('website', e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Facebook className="w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Facebook URL"
                                    value={profile.social_links.facebook}
                                    onChange={(e) => handleSocialChange('facebook', e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Twitter className="w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Twitter/X URL"
                                    value={profile.social_links.twitter}
                                    onChange={(e) => handleSocialChange('twitter', e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Instagram className="w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Instagram URL"
                                    value={profile.social_links.instagram}
                                    onChange={(e) => handleSocialChange('instagram', e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Youtube className="w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="YouTube URL"
                                    value={profile.social_links.youtube}
                                    onChange={(e) => handleSocialChange('youtube', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};
