import { useState, useEffect } from "react";
import { PageHeader, DataTable, Column, StatusBadge, EmptyState, Card } from "@/components/organizer/shared";
import { format } from "date-fns";
import { MoreHorizontal, MessageSquare, Flag, EyeOff, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import api from "@/lib/axios";
import { useRole } from "@/components/RoleContext";

export function ReviewsPage() {
    const { user, loading: authLoading } = useRole();
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReview, setSelectedReview] = useState<any | null>(null);
    const [isRespondOpen, setIsRespondOpen] = useState(false);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!user) return;
            try {
                const res = await api.get('/organizer/reviews');
                setReviews(res.data);
            } catch (error) {
                console.error("Failed to fetch reviews", error);
            } finally {
                setLoading(false);
            }
        };
        if (!authLoading) {
            fetchReviews();
        }
    }, [user, authLoading]);

    const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
        : 0;

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${star <= rating
                            ? "text-[#E85A6B] fill-[#E85A6B]" // Pink stars
                            : "text-gray-200"
                            }`}
                    />
                ))}
            </div>
        );
    };

    const columns: Column<any>[] = [
        {
            key: "attendee",
            header: "Reviewer",
            cell: (review) => (
                <div>
                    <p className="font-semibold text-gray-900 text-sm">{review.attendeeName}</p>
                    <p className="text-xs text-gray-500">{review.eventTitle}</p>
                </div>
            ),
        },
        {
            key: "rating",
            header: "Rating",
            cell: (review) => renderStars(review.rating),
        },
        {
            key: "comment",
            header: "Comment",
            cell: (review) => (
                <div className="max-w-md">
                    <p className="text-sm text-gray-600 line-clamp-2">
                        {review.comment}
                    </p>
                    {review.response && (
                        <p className="text-xs text-[#E85A6B] mt-1 pl-2 border-l-2 border-[#E85A6B]">
                            You replied: {review.response}
                        </p>
                    )}
                </div>
            ),
        },
        {
            key: "date",
            header: "Date",
            cell: (review) => (
                <span className="text-xs text-gray-400">
                    {review.createdAt ? format(new Date(review.createdAt), "MMM d, yyyy") : "-"}
                </span>
            ),
        },
        {
            key: "actions",
            header: "",
            cell: (review) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setSelectedReview(review); setIsRespondOpen(true); }}>
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Respond
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
            className: "w-10",
        },
    ];

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E85A6B]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 min-h-screen bg-white text-black p-1">
            <PageHeader
                title="Reviews"
                description="Monitor attendee satisfaction and feedback"
            />

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1 p-6 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col items-center justify-center text-center">
                    <span className="text-5xl font-bold text-gray-900 mb-2">{avgRating.toFixed(1)}</span>
                    <div className="mb-2">{renderStars(Math.round(avgRating))}</div>
                    <p className="text-sm text-gray-500">Based on {reviews.length} reviews</p>
                </div>

                {/* Placeholder for Rating Distribution - can be implemented if data supported it */}
                <div className="col-span-2 p-6 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col justify-center">
                    <div className="text-center text-gray-400 text-sm">
                        Detailed rating analytics coming soon
                    </div>
                </div>
            </div>

            {/* Recent Reviews */}
            <DataTable
                data={reviews}
                columns={columns}
                searchable
                searchPlaceholder="Search reviews..."
                searchKey="attendeeName"
                emptyState={
                    <EmptyState
                        icon="star"
                        title="No reviews yet"
                        description="Reviews will appear here after attendees submit feedback"
                    />
                }
            />

            {/* Respond Dialog */}
            <Dialog open={isRespondOpen} onOpenChange={setIsRespondOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Respond to Review</DialogTitle>
                    </DialogHeader>
                    {selectedReview && (
                        <div className="space-y-4 py-4">
                            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-sm">{selectedReview.attendeeName}</span>
                                    {renderStars(selectedReview.rating)}
                                </div>
                                <p className="text-sm text-gray-600 italic">"{selectedReview.comment}"</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Your Response</Label>
                                <Textarea
                                    placeholder="Write your response..."
                                    rows={4}
                                    className="resize-none"
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRespondOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => setIsRespondOpen(false)} className="bg-[#E85A6B] hover:bg-[#d64556]">
                            Send Response
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
