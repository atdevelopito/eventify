import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useRole } from '@/components/RoleContext';
import api from '@/lib/api';
import { Check, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { PromoCodeModal } from '@/components/PromoCodeModal';

export const Subscription = () => {
    const { user, subscription } = useRole();
    const [loading, setLoading] = useState(false);
    const [selectedPlanForPromo, setSelectedPlanForPromo] = useState<string | null>(null);

    const handleUpgradeClick = (planId: string) => {
        if (!user) {
            toast.error("Please sign in to upgrade");
            return;
        }
        if (planId === 'free') {
            handleSubscribe('free');
            return;
        }
        setSelectedPlanForPromo(planId);
    };

    const handlePromoSuccess = () => {
        if (selectedPlanForPromo) {
            handleSubscribe(selectedPlanForPromo as any);
        }
    };

    const handleSubscribe = async (planId: 'free' | 'pro' | 'enterprise') => {
        if (!user) {
            toast.error("Please sign in to upgrade");
            return;
        }

        setLoading(true);
        try {
            await api.post('/subscriptions/upgrade', { plan_id: planId });

            toast.success(`Successfully switched to ${planId.toUpperCase()} plan`);
            // Reload page to refresh context (a bit crude but works for now without complex context updates)
            window.location.reload();

        } catch (error) {
            console.error('Error updating subscription:', error);
            toast.error('Failed to update subscription');
        } finally {
            setLoading(false);
        }
    };

    const currentPlan = subscription?.plan_id || 'free';

    const plans = [
        {
            id: 'free',
            name: 'Free',
            price: 'BDT 0',
            description: 'Perfect for getting started',
            features: [
                'Create up to 3 events',
                'Basic analytics',
                'Standard support',
                'Community access'
            ]
        },
        {
            id: 'pro',
            name: 'Pro',
            price: 'BDT 500',
            period: '/month',
            description: 'For power users and serious organizers',
            features: [
                'Unlimited events',
                'Advanced analytics',
                'Email your followers',
                'Priority support',
                'Custom branding'
            ],
            popular: true
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            price: 'Custom',
            description: 'For large organizations and agencies',
            features: [
                'Dedicated account manager',
                'SSO & Advanced Security',
                'Custom integrations',
                'SLA support',
                'White-label solution'
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-medium mb-4 text-[#1A1A1A]">
                            Simple, transparent pricing
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Choose the plan that's right for you. Change or cancel at any time.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`relative p-8 border ${plan.popular
                                    ? 'border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
                                    : 'border-gray-200'
                                    } bg-white flex flex-col`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 right-0 bg-[#E85A6B] text-black text-xs font-bold px-3 py-1 uppercase tracking-wider border-l border-b border-black">
                                        Most Popular
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className="text-xl font-medium mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold">{plan.price}</span>
                                        {plan.period && <span className="text-gray-500">{plan.period}</span>}
                                    </div>
                                    <p className="text-gray-500 mt-4">{plan.description}</p>
                                </div>

                                <ul className="space-y-4 mb-8 flex-1">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-[#E5FFE5] flex items-center justify-center shrink-0">
                                                <Check className="w-3 h-3 text-green-600" />
                                            </div>
                                            <span className="text-sm text-gray-600">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleUpgradeClick(plan.id)}
                                    disabled={loading || currentPlan === plan.id}
                                    className={`w-full py-3 px-6 text-sm font-medium uppercase tracking-wider transition-all
                                        ${currentPlan === plan.id
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                            : plan.popular
                                                ? 'bg-black text-white border border-black hover:bg-[#E85A6B] hover:text-black'
                                                : 'bg-white text-black border border-black hover:bg-black hover:text-white'
                                        }
                                    `}
                                >
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                    ) : currentPlan === plan.id ? (
                                        'Current Plan'
                                    ) : (
                                        plan.id === 'free' ? 'Downgrade' : 'Upgrade'
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </main>



            <Footer />

            <PromoCodeModal
                isOpen={!!selectedPlanForPromo}
                onClose={() => setSelectedPlanForPromo(null)}
                onSuccess={handlePromoSuccess}
                planId={selectedPlanForPromo || ''}
            />
        </div >
    );
};
