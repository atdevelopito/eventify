import React, { useState } from 'react';
import { X, Loader2, Check } from 'lucide-react';
import { toast } from '@/components/ui/toast';

interface PromoCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    planId: string;
}

export const PromoCodeModal: React.FC<PromoCodeModalProps> = ({ isOpen, onClose, onSuccess, planId }) => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Mock promo code check
        // In a real app, verify against a 'promo_codes' table
        if (code.trim().toUpperCase() === 'ORGPRO2024') {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Fake network delay
            onSuccess();
            onClose();
        } else {
            setError('Invalid promo code');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white border border-black w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-black transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-medium mb-2">Upgrade to {planId.toUpperCase()}</h2>
                <p className="text-gray-600 mb-6">Enter your organizer promo code to activate this plan.</p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium uppercase tracking-wider mb-2">
                            Promo Code
                        </label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => {
                                setCode(e.target.value);
                                setError(null);
                            }}
                            placeholder="Enter code (Hint: ORGPRO2024)"
                            className={`w-full px-4 py-3 border ${error ? 'border-red-500' : 'border-black'} focus:outline-none bg-gray-50 text-lg uppercase placeholder:normal-case`}
                            autoFocus
                        />
                        {error && (
                            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                <X className="w-4 h-4" /> {error}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !code.trim()}
                        className="w-full bg-black text-white py-4 font-medium uppercase tracking-wider hover:bg-[#FA76FF] hover:text-black transition-colors disabled:opacity-50 disabled:hover:bg-black disabled:hover:text-white flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            <>
                                Activate Plan
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
