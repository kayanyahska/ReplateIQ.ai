
import React, { useState } from 'react';
import { Navigation, X, Footprints, Bike, Bus, Car, ThumbsUp, ThumbsDown, AlertTriangle } from 'lucide-react';
import { FoodListing } from '../../types';

interface ClaimModalProps {
    listing: FoodListing | null;
    onClose: () => void;
    onClaimConfirm: (transport: 'walk' | 'bike' | 'transit' | 'car') => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({ listing, onClose, onClaimConfirm }) => {
    const [selectedTransport, setSelectedTransport] = useState<'walk' | 'bike' | 'transit' | 'car' | null>(null);
    const [pickupAnalysis, setPickupAnalysis] = useState<{ netImpact: number, travelEmissions: number, isWorthIt: boolean } | null>(null);

    const analyzePickup = () => {
        if (!listing || !selectedTransport) return;
        const distStr = listing.distance.toLowerCase().replace('km', '').trim();
        const distance = parseFloat(distStr) || 1.0;
        const roundTrip = distance * 2;
        let factor = 0;
        if (selectedTransport === 'car') factor = 0.192;
        if (selectedTransport === 'transit') factor = 0.105;
        const travelEmissions = roundTrip * factor;
        const netImpact = listing.carbonSaved - travelEmissions;
        setPickupAnalysis({
            travelEmissions: parseFloat(travelEmissions.toFixed(2)),
            netImpact: parseFloat(netImpact.toFixed(2)),
            isWorthIt: netImpact > 0
        });
    };

    return (
        <>
            <div className="bg-emerald-700 p-5 flex justify-between items-center shrink-0">
                <h3 className="text-white font-bold flex items-center gap-2 text-lg"><Navigation size={20} /> Pickup Planner</h3>
                <button onClick={onClose} className="text-emerald-200 hover:text-white bg-emerald-800/50 p-1 rounded-full"><X size={20} /></button>
            </div>
            <div className="p-6 md:p-8 overflow-y-auto">
                <h4 className="font-bold text-gray-800 text-xl mb-2 text-center">How will you pick this up?</h4>
                <p className="text-sm text-gray-500 text-center mb-8">We calculate the net carbon impact of your trip.</p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                    {(['walk', 'bike', 'transit', 'car'] as const).map(mode => (
                        <button key={mode} onClick={() => { setSelectedTransport(mode); setPickupAnalysis(null); }} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all duration-200 ${selectedTransport === mode ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-md scale-105' : 'border-gray-100 text-gray-500 hover:bg-gray-50 hover:border-gray-200'}`}>
                            {mode === 'walk' && <Footprints size={28} />}
                            {mode === 'bike' && <Bike size={28} />}
                            {mode === 'transit' && <Bus size={28} />}
                            {mode === 'car' && <Car size={28} />}
                            <span className="capitalize font-bold text-sm">{mode === 'transit' ? 'Bus/Train' : mode}</span>
                        </button>
                    ))}
                </div>
                {selectedTransport && !pickupAnalysis && (
                    <button onClick={analyzePickup} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-700 transition animate-fade-in">Analyze Trip Impact</button>
                )}
                {pickupAnalysis && (
                    <div className="animate-fade-in space-y-4">
                        <div className={`p-5 rounded-2xl border-2 ${pickupAnalysis.isWorthIt ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex items-center justify-center gap-2 mb-4">
                                {pickupAnalysis.isWorthIt ? (<div className="bg-green-100 text-green-700 p-2.5 rounded-full"><ThumbsUp size={24} /></div>) : (<div className="bg-red-100 text-red-700 p-2.5 rounded-full"><ThumbsDown size={24} /></div>)}
                                <span className={`text-2xl font-black ${pickupAnalysis.isWorthIt ? 'text-green-800' : 'text-red-800'}`}>{pickupAnalysis.isWorthIt ? 'Worth It!' : 'Not Recommended'}</span>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between"><span className="text-gray-600 font-medium">Food Carbon Saved:</span><span className="font-bold text-emerald-600">+{listing?.carbonSaved}kg</span></div>
                                <div className="flex justify-between"><span className="text-gray-600 font-medium">Travel Emissions:</span><span className="font-bold text-red-500">-{pickupAnalysis.travelEmissions} kg</span></div>
                                <div className="border-t border-gray-300/50 pt-3 flex justify-between font-bold text-base"><span>Net Impact:</span><span className={pickupAnalysis.isWorthIt ? 'text-green-700' : 'text-red-700'}>{pickupAnalysis.netImpact > 0 ? '+' : ''}{pickupAnalysis.netImpact} kg</span></div>
                            </div>
                        </div>
                        {!pickupAnalysis.isWorthIt && (
                            <div className="flex items-start gap-2 text-xs font-medium text-red-600 bg-red-50 p-3 rounded-xl"><AlertTriangle size={16} className="mt-0.5 shrink-0" />Driving for this pickup creates more pollution than saving the food prevents. Consider walking or biking!</div>
                        )}
                        <button onClick={() => selectedTransport && onClaimConfirm(selectedTransport)} className={`w-full py-4 rounded-xl font-bold shadow-lg text-white text-lg transition ${pickupAnalysis.isWorthIt ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-400 hover:bg-gray-500'}`}>{pickupAnalysis.isWorthIt ? 'Confirm & Claim' : 'Claim Anyway'}</button>
                    </div>
                )}
            </div>
        </>
    );
};
