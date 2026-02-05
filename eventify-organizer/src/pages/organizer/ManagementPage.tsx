import { useState, useEffect } from "react";
import { PageHeader, Card } from "@/components/organizer/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Bell, CreditCard, Shield, Users, Mail, Loader2, Trash2 } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useRole } from "@/components/RoleContext";

export function ManagementPage() {
    const { user } = useRole();
    const [team, setTeam] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Invite State
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("Collaborator");
    const [inviting, setInviting] = useState(false);

    useEffect(() => {
        fetchTeam();
    }, []);

    const fetchTeam = async () => {
        try {
            const res = await api.get('/team');
            setTeam(res.data);
        } catch (error) {
            console.error("Failed to fetch team", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async () => {
        if (!inviteEmail) return toast.error("Email is required");
        setInviting(true);
        try {
            await api.post('/team', { email: inviteEmail, role: inviteRole });
            toast.success("Invitation sent");
            setIsInviteOpen(false);
            setInviteEmail("");
            fetchTeam();
        } catch (error) {
            toast.error("Failed to invite member");
        } finally {
            setInviting(false);
        }
    };

    const handleRemoveMember = async (email: string) => {
        if (!confirm(`Remove ${email} from the team?`)) return;
        try {
            await api.delete(`/team/${email}`);
            toast.success("Team member removed");
            setTeam(team.filter(m => m.email !== email));
        } catch (error) {
            toast.error("Failed to remove member");
        }
    };

    return (
        <div className="space-y-6 max-w-4xl pb-10">
            <PageHeader
                title="Settings & Management"
                description="Manage team access, billing, and account preferences"
            />

            <Tabs defaultValue="team" className="space-y-6">
                <TabsList className="bg-gray-100 p-1">
                    <TabsTrigger value="team">Team</TabsTrigger>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="billing">Billing</TabsTrigger>
                </TabsList>

                <TabsContent value="team" className="space-y-6">
                    <Card
                        title="Team Members"
                        description="Manage who can access your organizer dashboard."
                        action={
                            <Button size="sm" onClick={() => setIsInviteOpen(true)} className="bg-[#E85A6B] hover:bg-[#d64556]">
                                <Users className="w-4 h-4 mr-2" />
                                Invite Member
                            </Button>
                        }
                    >
                        <div className="space-y-1">
                            {/* Owner - Always visible if current user */}
                            {user && (
                                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-100 mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#E85A6B]/10 flex items-center justify-center text-[#E85A6B] font-bold text-xs">
                                            {user.name ? user.name.charAt(0).toUpperCase() : "ME"}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{user.name || "You"} <span className="text-xs text-gray-500">(You)</span></p>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-semibold px-2 py-1 bg-gray-200 rounded text-gray-700">Owner</span>
                                </div>
                            )}

                            {team.length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-4">No other team members yet.</p>
                            )}

                            {team.map((member) => (
                                <div key={member.email} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs">
                                            {member.email.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{member.email}</p>
                                            <p className="text-xs text-gray-500 capitalize">{member.role} • {member.status}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => handleRemoveMember(member.email)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="account" className="space-y-6">
                    <Card title="Security">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                                        <p className="text-xs text-gray-500">Secure your account with 2FA.</p>
                                    </div>
                                </div>
                                <Switch disabled />
                            </div>
                            <Button variant="outline">Change Password</Button>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6">
                    <Card title="Email Preferences">
                        <div className="space-y-4">
                            {[
                                { title: "New registrations", desc: "Get notified when someone registers" },
                                { title: "Payment received", desc: "Notifications for successful payments" },
                                { title: "Event reminders", desc: "Reminders before your events" },
                            ].map((item) => (
                                <div key={item.title} className="flex items-center justify-between py-2">
                                    <div>
                                        <p className="font-medium text-sm text-gray-900">{item.title}</p>
                                        <p className="text-xs text-gray-500">{item.desc}</p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                            ))}
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="billing" className="space-y-6">
                    <Card title="Current Plan">
                        <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between mb-4">
                            <div>
                                <p className="font-semibold text-gray-900">Standard Plan</p>
                                <p className="text-xs text-gray-500">Transaction fees apply</p>
                            </div>
                            <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded">Active</span>
                        </div>
                    </Card>
                    <Card title="Payment Method">
                        <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-3">
                                <CreditCard className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="font-medium text-gray-900">Payout Account</p>
                                    <p className="text-xs text-gray-500">Not configured</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm">Configure</Button>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Email Address</Label>
                            <Input
                                placeholder="colleague@example.com"
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select value={inviteRole} onValueChange={setInviteRole}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Admin">Admin</SelectItem>
                                    <SelectItem value="Collaborator">Collaborator</SelectItem>
                                    <SelectItem value="Viewer">Viewer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
                        <Button onClick={handleInvite} disabled={inviting} className="bg-[#E85A6B] hover:bg-[#d64556]">
                            {inviting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Send Invitation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
