import React from 'react';
import { ShieldCheck, ArrowRight, Leaf } from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import { SUBSCRIPTION_CONFIG } from '../../services/subscriptionConfig';
import { usePayment } from '../../hooks/usePayment';
import { Loader2 } from 'lucide-react';
import MockPaymentModal from './MockPaymentModal';

const LifetimeGate: React.FC = () => {
    const { user } = useAuth();
    const { initiateCheckout, isProcessing, showMockModal, setShowMockModal, mockDetails, handleMockSuccess } = usePayment();

    if (!user || user.isLifetimeMember) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-emerald-900 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative overflow-hidden text-center animate-scale-in">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-green-500"></div>

                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                    <ShieldCheck size={32} />
                </div>

                <h1 className="text-2xl font-bold text-gray-800 mb-2">Lifetime Membership</h1>
                <p className="text-gray-500 mb-8 leading-relaxed">
                    To maintain a trusted community of food rescuers, ReplateIQ requires a verified one-time entry fee.
                </p>

                <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-800">Lifetime Access</span>
                        <span className="text-2xl font-bold text-emerald-600">${SUBSCRIPTION_CONFIG.FEES.LIFETIME_ACCESS.toFixed(2)}</span>
                    </div>
                    <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm text-gray-600"><Leaf size={14} className="text-emerald-500" /> Verified Community Badge</li>
                        <li className="flex items-center gap-2 text-sm text-gray-600"><Leaf size={14} className="text-emerald-500" /> Unlimited Food Rescue</li>
                        <li className="flex items-center gap-2 text-sm text-gray-600"><Leaf size={14} className="text-emerald-500" /> Carbon Impact Tracking</li>
                    </ul>
                </div>

                <button
                    onClick={() => initiateCheckout('price_lifetime_500', 'lifetime')}
                    disabled={isProcessing}
                    className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 hover:shadow-lg hover:scale-[1.02] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isProcessing ? <Loader2 className="animate-spin" /> : <>Pay ${SUBSCRIPTION_CONFIG.FEES.LIFETIME_ACCESS.toFixed(2)} & Enter <ArrowRight size={20} /></>}
                </button>

                <p className="text-xs text-center text-gray-400 mt-4">Safe & Secure Payment</p>
            </div>

            <MockPaymentModal
                isOpen={showMockModal}
                onClose={() => setShowMockModal(false)}
                onConfirm={handleMockSuccess}
                price={mockDetails.price}
                planName={mockDetails.planName}
            />
        </div>
    );
};

export default LifetimeGate;
