import React from 'react';
import { Star, MoreHorizontal, MessageSquare, ThumbsUp } from 'lucide-react';

export const ReviewModerator = () => {
    const reviews = [
        {
            id: 1,
            user: 'Sarah M.',
            event: 'Sunset Techno Bash',
            rating: 5,
            date: '2h ago',
            content: 'Absolutely insane energy! The lights, the sound, everything was perfect. Can\'t wait for the next one!',
            likes: 12,
            replied: false,
        },
        {
            id: 2,
            user: 'Mike T.',
            event: 'Underground Rave 2026',
            rating: 4,
            date: '1d ago',
            content: 'Great music but the bar line was a bit long. Otherwise top notch.',
            likes: 4,
            replied: true,
        },
        {
            id: 3,
            user: 'Alex D.',
            event: 'Sunset Techno Bash',
            rating: 5,
            date: '3d ago',
            content: 'Best night of my life. Period.',
            likes: 24,
            replied: false,
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">User Reviews</h2>
                <div className="flex gap-2">
                    <select className="bg-transparent border border-border rounded-lg px-3 py-2 text-sm font-medium">
                        <option>All Events</option>
                        <option>Sunset Techno Bash</option>
                    </select>
                    <select className="bg-transparent border border-border rounded-lg px-3 py-2 text-sm font-medium">
                        <option>Newest First</option>
                        <option>Highest Rated</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Summary Card */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm text-center">
                        <div className="text-5xl font-black text-foreground mb-2">4.8</div>
                        <div className="flex justify-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-5 h-5 fill-black text-black" />)}
                        </div>
                        <p className="text-sm text-muted-foreground">Average Rating based on 128 reviews</p>
                    </div>

                    <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
                        <h3 className="font-bold mb-4">Rating Breakdown</h3>
                        <div className="space-y-3">
                            {[5, 4, 3, 2, 1].map(stars => (
                                <div key={stars} className="flex items-center gap-3">
                                    <span className="text-sm font-bold w-3">{stars}</span>
                                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-black rounded-full"
                                            style={{ width: stars === 5 ? '75%' : stars === 4 ? '15%' : '5%' }}
                                        />
                                    </div>
                                    <span className="text-xs text-muted-foreground w-8 text-right">
                                        {stars === 5 ? '75%' : stars === 4 ? '15%' : '5%'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Review List */}
                <div className="md:col-span-2 space-y-4">
                    {reviews.map(review => (
                        <div key={review.id} className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center font-bold text-gray-600">
                                        {review.user[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">{review.user}</div>
                                        <div className="text-xs text-muted-foreground">{review.event} • {review.date}</div>
                                    </div>
                                </div>
                                <button className="text-muted-foreground hover:text-foreground">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex gap-1 mb-3">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                ))}
                            </div>

                            <p className="text-foreground/90 mb-4 leading-relaxed">"{review.content}"</p>

                            <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                <div className="flex gap-4">
                                    <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-black transition-colors">
                                        <ThumbsUp className="w-4 h-4" /> Helpful ({review.likes})
                                    </button>
                                </div>
                                {review.replied ? (
                                    <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">Replied</span>
                                ) : (
                                    <button className="flex items-center gap-1.5 text-xs font-bold text-black hover:underline">
                                        <MessageSquare className="w-4 h-4" /> Reply
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
