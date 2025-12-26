
import React from 'react';
import { FoodListing } from '../../types';
import { Leaf, Flame, MapPin, Star, MessageCircle } from 'lucide-react';

interface ListingCardProps {
    item: FoodListing;
    onMessage: (item: FoodListing) => void;
    onClaim: (item: FoodListing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({ item, onMessage, onClaim }) => {
    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group">
            <div className="h-56 w-full overflow-hidden relative bg-gray-50">
                {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200"><Leaf size={64} /></div>
                )}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-emerald-950/60 via-transparent to-transparent opacity-70"></div>
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-white/20">
                    <Leaf size={12} className="fill-emerald-700" /> Saves {item.carbonSaved}kg
                </div>
                {item.caloriesPerServing && (
                    <div className="absolute bottom-4 left-4 bg-emerald-950/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10">
                        <Flame size={12} className="text-orange-400 fill-orange-400" /> {item.caloriesPerServing} kcal
                    </div>
                )}
            </div>
            <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-xl leading-tight group-hover:text-emerald-700 transition line-clamp-1">{item.title}</h4>
                        <span className="text-xs font-bold text-gray-400 mt-1 block uppercase tracking-wide">{item.quantity} Servings</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                            <Star size={12} className="fill-yellow-500 text-yellow-500" />
                            <span className="font-bold text-xs">{item.giverRating.toFixed(1)}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-5 font-medium">
                    <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                        <MapPin size={14} className="text-gray-400" /> {item.location.split(',')[0]}
                    </span>
                    <span className="bg-gray-50 px-2.5 py-1.5 rounded-lg">{item.distance} away</span>
                </div>
                {item.ingredients && item.ingredients.length > 0 && (
                    <div className="mb-6 flex-1">
                        <div className="flex flex-wrap gap-2">
                            {item.ingredients.slice(0, 3).map((ing, i) => (
                                <span key={i} className="text-[10px] font-bold bg-white text-gray-600 px-2.5 py-1 rounded-md border border-gray-100 shadow-sm">{ing}</span>
                            ))}
                            {item.ingredients.length > 3 && (<span className="text-[10px] font-bold text-gray-400 px-1 py-1">+{item.ingredients.length - 3} more</span>)}
                        </div>
                    </div>
                )}
                <div className="mt-auto grid grid-cols-2 gap-3">
                    <button onClick={() => onMessage(item)} className="bg-white border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-bold hover:bg-gray-50 hover:border-gray-300 transition">Message</button>
                    <button onClick={() => onClaim(item)} className="bg-emerald-600 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:shadow-xl transition">Claim</button>
                </div>
            </div>
        </div>
    );
};
