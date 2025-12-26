import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { SubscriptionTier } from '../../types';
import { Settings, RefreshCw, UserCheck, CreditCard } from 'lucide-react';

const DevTools: React.FC = () => {
    const { user, updateUser, payLifetimeFee } = useAuth();
    const [isOpen, setIsOpen] = React.useState(false);

    if (!user) return null;

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 left-4 z-[200] bg-gray-900 text-white p-2 rounded-full shadow-lg hover:bg-black transition opacity-50 hover:opacity-100"
                title="Open Dev Tools"
            >
                <Settings size={20} />
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 left-4 z-[200] bg-white rounded-xl shadow-2xl border border-gray-200 w-72 overflow-hidden animate-fade-in text-left">
            <div className="bg-gray-900 text-white p-3 flex justify-between items-center">
                <h3 className="text-sm font-bold flex items-center gap-2">
                    <Settings size={14} /> Developer Tools
                </h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white text-xs">Close</button>
            </div>

            <div className="p-4 space-y-4">

                {/* SUBSCRIPTION TOGGLE */}
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Set Subscription Tier</label>
                    <div className="grid grid-cols-3 gap-1">
                        {[SubscriptionTier.FREE, SubscriptionTier.PRO, SubscriptionTier.BUSINESS].map(tier => (
                            <button
                                key={tier}
                                onClick={() => updateUser({ subscriptionTier: tier })}
                                className={`px-2 py-1.5 text-[10px] uppercase font-bold rounded border ${user.subscriptionTier === tier ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                            >
                                {tier}
                            </button>
                        ))}
                    </div>
                </div>

                {/* LIFETIME TOGGLE */}
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Membership Status</label>
                    <button
                        onClick={() => updateUser({ isLifetimeMember: !user.isLifetimeMember })}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold border ${user.isLifetimeMember ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}
                    >
                        {user.isLifetimeMember ? 'Verified Member' : 'Unpaid Entry Fee'}
                        <UserCheck size={14} />
                    </button>
                </div>

                {/* AI LIMIT RESET */}
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block flex justify-between">
                        AI Usage <span>{user.aiScanCount} Used</span>
                    </label>
                    <button
                        onClick={() => updateUser({ aiScanCount: 0 })}
                        className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-xs font-bold transition"
                    >
                        <RefreshCw size={14} /> Reset Daily Count
                    </button>
                </div>

            </div>
        </div>
    );
};

export default DevTools;
