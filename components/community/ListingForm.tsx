
import React from 'react';
import { Plus, Wand2, Loader2, ChefHat, X, Camera, Recycle, Flame, Info, Navigation, MapPin } from 'lucide-react';
import { DishPrediction, CarbonAnalysis, CarbonScenario } from '../../types';

interface ListingFormProps {
    dishName: string;
    setDishName: (val: string) => void;
    quantity: number;
    setQuantity: (val: number) => void;
    foodImage: string | undefined;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    analysis: CarbonAnalysis | null;
    isLoading: boolean;
    isPredicting: boolean;
    ingredients: string[];
    calories: number | null;
    refinements: DishPrediction['refinements'];
    handlePredictDish: () => void;
    handleRefineIngredient: (target: string, selection: string) => void;
    handleRemoveIngredient: (idx: number) => void;
    newIngredient: string;
    setNewIngredient: (val: string) => void;
    handleAddIngredient: () => void;
    streetAddress: string;
    setStreetAddress: (val: string) => void;
    setIsAddressFocused: (val: boolean) => void;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    setZipCode: (val: string) => void;
    isZipLoading: boolean;
    addressSuggestions: string[];
    showSuggestions: boolean;
    handleSelectAddress: (addr: string) => void;
    handleAnalyze: () => void;
    selectedScenario: CarbonScenario | null;
    initiateAction: (scenario: CarbonScenario) => void;
    handlePostListing: () => void;
    handleOpenVerify: () => void;
    setSelectedScenario: (val: CarbonScenario | null) => void;
    setAnalysis: (val: CarbonAnalysis | null) => void;
    setFoodImage: (val: string | undefined) => void;
    isAnalyzingImage: boolean;
    handleSmartImageAnalysis: (file: File) => void;
}

export const ListingForm: React.FC<ListingFormProps> = (props) => {
    const {
        dishName, setDishName, quantity, setQuantity, foodImage, handleImageUpload, analysis, isLoading,
        isPredicting, ingredients, calories, refinements, handlePredictDish, handleRefineIngredient,
        handleRemoveIngredient, newIngredient, setNewIngredient, handleAddIngredient,
        streetAddress, setStreetAddress, setIsAddressFocused, city, state, country, zipCode, setZipCode,
        isZipLoading, addressSuggestions, showSuggestions, handleSelectAddress, handleAnalyze,
        selectedScenario, initiateAction, handlePostListing, handleOpenVerify, setSelectedScenario, setAnalysis, setFoodImage,
        isAnalyzingImage, handleSmartImageAnalysis
    } = props;

    const manualInputRef = React.useRef<HTMLInputElement>(null);
    const smartInputRef = React.useRef<HTMLInputElement>(null);

    if (analysis) {
        return (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 animate-fade-in">
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl p-6 text-white shadow-lg mb-6">
                    <div className="flex items-start gap-4">
                        <div className="bg-white/20 p-3 rounded-full"><Recycle size={32} className="text-emerald-100" /></div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">Eco Recommendation</h3>
                            <p className="text-emerald-50 leading-relaxed text-sm">{analysis.recommendation}</p>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 text-lg mb-4">Choose Action</h3>
                    <div className="space-y-3">
                        {analysis.scenarios.map((scenario, idx) => (
                            <div key={idx} className={`relative p-4 rounded-xl border-2 transition-all ${scenario.isRecommended ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                                {scenario.isRecommended && (<div className="absolute -top-3 right-4 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Best Choice</div>)}
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${scenario.isRecommended ? 'bg-emerald-100' : 'bg-gray-50'}`}>
                                        <Info size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1"><h4 className="font-bold text-gray-800 text-sm">{scenario.action}</h4><span className="font-mono text-sm font-bold text-gray-600">{scenario.co2e} kg</span></div>
                                        <p className="text-xs text-gray-500">{scenario.description}</p>
                                    </div>
                                </div>
                                {selectedScenario === scenario ? (
                                    <div className="mt-4 flex gap-2 animate-fade-in">
                                        {(scenario.icon !== 'trash' && scenario.icon !== 'snowflake') ? (
                                            <>
                                                <button onClick={handlePostListing} className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-700 transition">Post to Hub</button>
                                                <button onClick={handleOpenVerify} className="flex-1 bg-white border border-emerald-600 text-emerald-700 py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-50 transition">Direct Trade</button>
                                            </>
                                        ) : (
                                            <button onClick={() => initiateAction(scenario)} className="w-full bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-700 transition">Confirm Action</button>
                                        )}
                                    </div>
                                ) : (
                                    <button onClick={() => initiateAction(scenario)} className="w-full mt-3 py-2 rounded-lg text-sm font-bold border border-gray-200 text-gray-500 hover:text-emerald-600 hover:border-emerald-500 transition">Select</button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <button onClick={() => { setAnalysis(null); setSelectedScenario(null); setFoodImage(undefined); }} className="text-gray-400 font-bold hover:text-gray-600 text-sm mx-auto block mt-6">Cancel</button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h3 className="font-bold text-gray-800 mb-6 text-xl flex items-center gap-2"><Plus className="bg-emerald-100 text-emerald-600 rounded-full p-1" size={24} /> Post a Listing</h3>
            <div className="space-y-5">
                <div className="relative">
                    <label className="block text-sm font-bold text-gray-700 mb-2">What food do you have?</label>
                    <div className="flex gap-2">
                        <input type="text" value={dishName} onChange={(e) => setDishName(e.target.value)} placeholder="e.g. Leftover Lasagna" className="flex-1 p-3.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition" />
                        <button onClick={handlePredictDish} disabled={isPredicting || !dishName} className="bg-purple-50 text-purple-700 border border-purple-100 p-3.5 rounded-xl hover:bg-purple-100 transition active:scale-95 disabled:opacity-50 shadow-sm" title="Auto-detect Ingredients">
                            {isPredicting ? <Loader2 className="animate-spin" size={24} /> : <Wand2 size={24} />}
                        </button>
                    </div>
                </div>

                {refinements.length > 0 && (
                    <div className="bg-purple-50 p-5 rounded-xl border border-purple-100 animate-fade-in">
                        <h4 className="text-purple-900 font-bold text-sm mb-3 flex items-center gap-2"><ChefHat size={16} /> Refine Details</h4>
                        <div className="space-y-3">
                            {refinements.map((ref, idx) => (
                                <div key={idx} className="bg-white p-3 rounded-lg shadow-sm border border-purple-100">
                                    <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">{ref.category}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {ref.options.map((opt, oIdx) => (
                                            <button key={oIdx} onClick={() => handleRefineIngredient(ref.targetIngredient, opt)} className="text-xs font-medium bg-gray-50 hover:bg-purple-600 hover:text-white border border-gray-200 px-3 py-1.5 rounded-full transition">{opt}</button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(ingredients.length > 0 || calories !== null) && (
                    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-sm font-bold text-gray-700">Ingredients</label>
                            {calories && (<span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded-full flex items-center gap-1"><Flame size={12} /> ~{calories} kcal</span>)}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {ingredients.map((ing, idx) => (
                                <span key={idx} className="bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-1 shadow-sm font-medium">
                                    {ing}<button onClick={() => handleRemoveIngredient(idx)} className="hover:text-red-500 ml-1 bg-gray-100 rounded-full p-0.5"><X size={10} /></button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input type="text" value={newIngredient} onChange={(e) => setNewIngredient(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()} placeholder="Add extra ingredient..." className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500" />
                            <button onClick={handleAddIngredient} className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-lg transition"><Plus size={16} /></button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Servings</label>
                        <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} min={1} className="w-full p-3.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Zip Code</label>
                        <div className="relative">
                            <input type="text" placeholder="Zip" value={zipCode} onChange={(e) => setZipCode(e.target.value.replace(/[^0-9]/g, ''))} maxLength={5} className="w-full p-3.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
                            {isZipLoading && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-emerald-600" />}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">Address</label>
                    <div className="relative group z-20">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="Start typing your address..." value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} onFocus={() => setIsAddressFocused(true)} onBlur={() => setTimeout(() => setIsAddressFocused(false), 200)} className="w-full pl-10 pr-3 py-3.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition" />
                        {showSuggestions && addressSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto z-50">
                                {addressSuggestions.map((suggestion, idx) => (
                                    <button key={idx} type="button" onClick={() => handleSelectAddress(suggestion)} className="w-full text-left px-4 py-3 hover:bg-emerald-50 text-sm text-gray-700 font-medium flex items-center gap-2">
                                        <Navigation size={14} className="text-emerald-500" /> {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {city && (<div className="flex gap-2 text-xs font-bold text-gray-400 bg-gray-50 p-2 rounded-lg"><span>{city}, {state}, {country}</span></div>)}
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Photo (Optional)</label>
                    <div className="flex gap-2 mb-2">
                        {/* Manual Upload */}
                        <label className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex-1 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 transition h-32 relative overflow-hidden group bg-gray-50">
                            {foodImage ? (
                                <img src={foodImage} alt="Preview" className="w-full h-full object-cover absolute top-0 left-0" />
                            ) : (
                                <>
                                    <Camera size={24} className="text-gray-400 mb-2 group-hover:text-emerald-500 transition" />
                                    <span className="text-xs text-gray-400 font-medium group-hover:text-emerald-600">Tap to upload</span>
                                </>
                            )}
                            {foodImage && (<div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><span className="text-white text-xs font-bold">Change Photo</span></div>)}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    console.log("Manual image upload triggered", e.target.files);
                                    handleImageUpload(e);
                                }}
                            />
                        </label>

                        {/* Smart AI Upload */}
                        <label className={`flex-1 bg-purple-50 border-2 border-purple-100 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-100 transition h-32 relative group ${isAnalyzingImage ? 'cursor-not-allowed opacity-75 pointer-events-none' : ''}`}>
                            {isAnalyzingImage ? (
                                <div className="text-center">
                                    <Loader2 size={24} className="animate-spin text-purple-600 mx-auto mb-2" />
                                    <span className="text-xs text-purple-600 font-bold block animate-pulse">Analyzing...</span>
                                </div>
                            ) : (
                                <>
                                    <Wand2 size={24} className="text-purple-400 mb-2 group-hover:text-purple-600 transition" />
                                    <span className="text-xs text-purple-500 font-bold group-hover:text-purple-700">Snap-to-List</span>
                                    <span className="text-[10px] text-purple-400 mt-1">Auto-fill details</span>
                                </>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    console.log("Smart image upload triggered", e.target.files);
                                    if (e.target.files?.[0]) handleSmartImageAnalysis(e.target.files[0]);
                                    e.target.value = '';
                                }}
                                disabled={isAnalyzingImage}
                            />
                        </label>
                    </div>
                </div>

                <button onClick={handleAnalyze} disabled={!dishName || !streetAddress || !city || isLoading || ingredients.length === 0} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed relative">
                    {isLoading ? <Loader2 className="animate-spin" /> : <Recycle />}
                    Calculate Impact
                </button>
            </div>
        </div>
    );
};
