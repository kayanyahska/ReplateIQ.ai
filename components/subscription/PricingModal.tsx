import React from 'react';
import { X, Check, ShieldCheck, Zap, TrendingUp, Sparkles, Building2 } from 'lucide-react';
import { SubscriptionTier } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { SUBSCRIPTION_CONFIG } from '../../services/subscriptionConfig';
import { usePayment } from '../../hooks/usePayment';
import { Loader2 } from 'lucide-react';
import MockPaymentModal from './MockPaymentModal';

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const { initiateCheckout, isProcessing, showMockModal, setShowMockModal, mockDetails, handleMockSuccess } = usePayment();

    if (!isOpen) return null;

    const handleUpgrade = async (tier: SubscriptionTier) => {
        // Use real Price IDs here (e.g., stored in config or env)
        const priceId = tier === SubscriptionTier.PRO ? 'price_pro_123' : 'price_biz_456';
        await initiateCheckout(priceId, tier);
        // Note: usePayment hook handles the mock modal trigger internally
    };

    const currentTier = user?.subscriptionTier || SubscriptionTier.FREE;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-emerald-50 to-white">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <Sparkles className="text-emerald-500 fill-emerald-500" />
                            Upgrade your Impact
                        </h2>
                        <p className="text-gray-500 text-sm">Choose the plan that fits your sustainability goals.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <X size={24} className="text-gray-400" />
                    </button>
                </div>

                {/* Tiers Container */}
                <div className="p-6 md:p-8 overflow-y-auto bg-gray-50 flex-1">
                    <div className="grid md:grid-cols-3 gap-6">

                        {/* FREE TIER */}
                        <div className={`relative bg-white rounded-2xl p-6 border-2 transition-all hover:shadow-xl ${currentTier === 'free' ? 'border-emerald-500 ring-4 ring-emerald-50' : 'border-gray-100'}`}>
                            <div className="mb-4">
                                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">{SUBSCRIPTION_CONFIG.free.name}</span>
                                <h3 className="text-3xl font-bold text-gray-800 mt-2">${SUBSCRIPTION_CONFIG.free.price} <span className="text-sm font-normal text-gray-400">/mo</span></h3>
                            </div>
                            <ul className="space-y-3 mb-8">
                                {SUBSCRIPTION_CONFIG.free.features.map((f, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600"><Check size={16} className="text-emerald-500 mt-0.5" /> <span>{f}</span></li>
                                ))}
                                {!SUBSCRIPTION_CONFIG.free.canSellCredits && <li className="flex items-start gap-2 text-sm text-gray-400"><X size={16} className="mt-0.5" /> <span>No Marketplace Access</span></li>}
                            </ul>
                            <button
                                disabled={currentTier === 'free'}
                                className={`w-full py-3 rounded-xl font-bold transition ${currentTier === 'free' ? 'bg-gray-100 text-gray-400' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                            >
                                {currentTier === 'free' ? 'Current Plan' : 'Downgrade'}
                            </button>
                        </div>

                        {/* PRO TIER */}
                        <div className={`relative bg-white rounded-2xl p-6 border-2 transition-all hover:shadow-xl transform md:-translate-y-4 md:scale-105 z-10 ${currentTier === 'pro' ? 'border-blue-500 ring-4 ring-blue-50' : 'border-blue-100'}`}>
                            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-indigo-600 h-1.5"></div>
                            <div className="mb-4">
                                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide flex items-center gap-1 w-fit"><Zap size={12} /> {SUBSCRIPTION_CONFIG.pro.name}</span>
                                <h3 className="text-3xl font-bold text-gray-800 mt-2">${SUBSCRIPTION_CONFIG.pro.price} <span className="text-sm font-normal text-gray-400">/mo</span></h3>
                            </div>
                            <ul className="space-y-3 mb-8">
                                {SUBSCRIPTION_CONFIG.pro.features.map((f, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 font-medium"><Check size={16} className="text-blue-500 mt-0.5" /> <span>{f}</span></li>
                                ))}
                            </ul>
                            <button
                                onClick={() => handleUpgrade(SubscriptionTier.PRO)}
                                disabled={currentTier === 'pro' || isProcessing}
                                className={`w-full py-3 rounded-xl font-bold shadow-lg transition flex items-center justify-center ${currentTier === 'pro' ? 'bg-gray-100 text-gray-400' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl hover:scale-[1.02]'}`}
                            >
                                {isProcessing ? <Loader2 className="animate-spin" size={20} /> : (currentTier === 'pro' ? 'Current Plan' : 'Upgrade to Pro')}
                            </button>
                        </div>

                        {/* BUSINESS TIER */}
                        <div className={`relative bg-white rounded-2xl p-6 border-2 transition-all hover:shadow-xl ${currentTier === 'business' ? 'border-purple-500 ring-4 ring-purple-50' : 'border-gray-100'}`}>
                            <div className="mb-4">
                                <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide flex items-center gap-1 w-fit"><Building2 size={12} /> {SUBSCRIPTION_CONFIG.business.name}</span>
                                <h3 className="text-3xl font-bold text-gray-800 mt-2">${SUBSCRIPTION_CONFIG.business.price} <span className="text-sm font-normal text-gray-400">/mo</span></h3>
                            </div>
                            <ul className="space-y-3 mb-8">
                                {SUBSCRIPTION_CONFIG.business.features.map((f, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600"><Check size={16} className="text-purple-500 mt-0.5" /> <span>{f}</span></li>
                                ))}
                            </ul>
                            <button
                                onClick={() => handleUpgrade(SubscriptionTier.BUSINESS)}
                                disabled={currentTier === 'business' || isProcessing}
                                className={`w-full py-3 rounded-xl font-bold transition flex items-center justify-center ${currentTier === 'business' ? 'bg-gray-100 text-gray-400' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
                            >
                                {isProcessing ? <Loader2 className="animate-spin" size={20} /> : (currentTier === 'business' ? 'Current Plan' : 'Upgrade to Business')}
                            </button>
                        </div>
                    </div>

                </div>

                <div className="p-4 bg-gray-50 text-center text-xs text-gray-400 border-t border-gray-100">
                    Secure payment processing powered by Stripe. Cancel anytime.
                </div>
            </div>

            {/* Mock Payment Overlay */}
            <MockPaymentModal
                isOpen={showMockModal}
                onClose={() => setShowMockModal(false)}
                onConfirm={async () => {
                    await handleMockSuccess();
                    onClose(); // Close the pricing modal too after success
                }}
                price={mockDetails.price}
                planName={mockDetails.planName}
            />
        </div>
    );
};

export default PricingModal;
