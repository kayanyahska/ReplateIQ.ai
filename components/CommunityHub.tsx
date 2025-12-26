
import React from 'react';
import { useCommunity } from '../hooks/useCommunity';
import { ListingCard } from './community/ListingCard';
import { ChatWindow } from './community/ChatWindow';
import { ClaimModal } from './community/ClaimModal';
import { ListingForm } from './community/ListingForm';
import {
    Leaf, Award, ShieldCheck, KeyRound, X, Star, MessageCircle, Truck,
    CheckCircle, Clock, MapPin, Search, HeartHandshake, History,
    AlertCircle, AlertTriangle, ExternalLink, Info, Flame, Brain, Sparkles, Loader2
} from 'lucide-react';

const CommunityHub: React.FC = () => {
    const hook = useCommunity();
    const {
        user, userRole, setUserRole, receiverTab, setReceiverTab, listings, claimedCode,
        modalMode, setModalMode, activeListing, verificationCode, setVerificationCode,
        verificationError, setVerificationError, handleVerifyCode, userRating, setUserRating,
        handleRateAndComplete, isTyping, pointsEarned, setAnalysis, setPointsEarned,
        setFoodImage, setIngredients, setCalories, setRefinements, completeListing,
        submitRating, earnPoints, deleteListing, listingToDelete, setListingToDelete,
        handleConfirmDelete, activeConversationUser, setActiveConversationUser,
        messages, messageText, setMessageText, handleSendMessage, handleUnclaim,
        searchLocation, setSearchLocation, giverTab, setGiverTab
    } = hook;

    // Helper for conversation partners
    const conversationPartners = activeListing && user?.id === activeListing.giverId
        ? Array.from(new Set(messages.filter(m => m.listingId === activeListing.id).map(m => m.senderId === user.id ? m.receiverId : m.senderId)))
            .filter((id): id is string => !!id)
            .map(id => {
                const messageFromUser = messages.find(m => m.senderId === id && m.senderName);
                const partner = hook.communityUsers.find(u => u.id === id);
                return { id, name: messageFromUser?.senderName || partner?.name || "User " + id.slice(0, 4) };
            })
        : [];

    const currentChatMessages = activeListing && activeConversationUser
        ? messages.filter(m => m.listingId === activeListing.id && (m.senderId === activeConversationUser || m.receiverId === activeConversationUser))
        : [];

    // Filter Logic
    const filteredListings = listings.filter(l => l.status === 'available' && l.giverId !== user?.id && (searchLocation === "" || l.location.toLowerCase().includes(searchLocation.toLowerCase())));
    const receiverHistory = listings.filter(l => l.claimedBy === user?.id && l.status === 'completed');
    const giverHistory = listings.filter(l => l.giverId === user?.id && (l.status === 'completed' || l.status === 'deleted'));
    const activeGiverListings = listings.filter(l => l.giverId === user?.id && l.status !== 'completed' && l.status !== 'deleted');

    const handleMessage = (listing: any) => {
        hook.setActiveListing(listing);
        hook.setModalMode('message');
        hook.setMessageText("");
        if (user?.id !== listing.giverId) {
            hook.setActiveConversationUser(listing.giverId);
        } else {
            hook.setActiveConversationUser(null);
        }
    };

    const handleInitClaim = (listing: any) => {
        hook.setActiveListing(listing);
        hook.setModalMode('pickup');
    };

    const handleConfirmClaim = async (transport: any) => {
        if (!activeListing) return;
        const code = await hook.claimListing(activeListing.id, transport);
        if (code) {
            hook.setClaimedCode(code);
            hook.setModalMode('claim');
        } else {
            alert("This item may have already been claimed.");
            hook.setModalMode(null);
        }
    };

    const handleViewClaimDetails = (listing: any) => { hook.setClaimedCode(listing.claimCode || ""); hook.setActiveListing(listing); hook.setModalMode('claim'); };
    const handleDeleteClick = (listing: any) => { setListingToDelete(listing); };

    const renderModalContent = () => {
        if (!modalMode) return null;
        if (modalMode === 'pickup') return (
            <ClaimModal
                listing={activeListing}
                onClose={() => setModalMode(null)}
                onClaimConfirm={handleConfirmClaim}
            />
        );
        if (modalMode === 'message') return (
            <ChatWindow
                listing={activeListing} currentUser={user}
                activeConversationUser={activeConversationUser} setActiveConversationUser={setActiveConversationUser}
                conversationPartners={conversationPartners} currentMessages={currentChatMessages}
                messageText={messageText} setMessageText={setMessageText}
                onSendMessage={() => hook.sendMessage(activeListing!.id, messageText, activeConversationUser!)}
                onClose={() => setModalMode(null)} isTyping={isTyping}
            />
        );

        // Keep simplified inline versions for the smaller modals for now to save space/time, or extract later if needed.
        if (modalMode === 'verify') return (<><div className="bg-emerald-700 p-5 flex justify-between items-center shrink-0"><h3 className="text-white font-bold flex items-center gap-2 text-lg"><ShieldCheck size={20} className="text-emerald-200" /> Verify Exchange</h3><button onClick={() => setModalMode(null)} className="text-emerald-200 hover:text-white bg-emerald-800/50 p-1 rounded-full"><X size={20} onClick={() => { setVerificationCode(""); setModalMode(null); }} /></button></div><div className="p-6 md:p-8"><div className="text-center mb-8"><div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm"><KeyRound size={36} /></div><h4 className="text-xl font-bold text-gray-800 mb-1">Enter Receiver's Eco-ID</h4><p className="text-sm text-gray-500">Ask the receiver for the 4-digit code to unlock your credits.</p></div><div className="space-y-6"><input type="text" maxLength={4} value={verificationCode} onChange={(e) => { setVerificationCode(e.target.value.replace(/[^0-9]/g, '')); setVerificationError(null); }} placeholder="0000" className="w-full text-center text-4xl font-mono tracking-[0.5em] p-6 bg-gray-50 text-gray-900 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none shadow-inner" />{verificationError && (<p className="text-red-500 text-sm text-center font-bold animate-pulse bg-red-50 py-2 rounded-lg">{verificationError}</p>)}<button onClick={async () => { const l = await hook.completeListing(verificationCode); if (l) { hook.setActiveListing(l); setModalMode('rate'); } else setVerificationError("Invalid Code"); }} disabled={verificationCode.length !== 4} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition disabled:opacity-50 disabled:shadow-none hover:-translate-y-0.5">Verify Code</button><button onClick={() => setModalMode(null)} className="w-full text-gray-400 font-bold text-sm py-2 hover:text-gray-600">Cancel</button></div></div></>);
        if (modalMode === 'rate') return (<><div className="bg-emerald-700 p-5 flex justify-between items-center shrink-0"><h3 className="text-white font-bold flex items-center gap-2 text-lg"><Star size={20} className="text-yellow-300 fill-yellow-300" /> Rate Receiver</h3></div><div className="p-6 md:p-8"><div className="text-center mb-8"><h4 className="text-2xl font-bold text-gray-800 mb-2">How was it?</h4><p className="text-gray-500">Rate {activeListing?.claimedBy ? "the receiver" : "the interaction"} to maintain community trust.</p></div><div className="flex justify-center gap-4 mb-10">{[1, 2, 3, 4, 5].map((star) => (<button key={star} onClick={() => setUserRating(star)} className="transition transform hover:scale-110 active:scale-95 group"><Star size={40} className={`${userRating >= star ? 'fill-yellow-400 text-yellow-500' : 'text-gray-200 group-hover:text-yellow-200'} transition-colors`} /></button>))}</div><button onClick={async () => { if (userRating === 0) return; await hook.submitRating(userRating); const p = activeListing ? Math.round(activeListing.carbonSaved * 10) + 5 : 50; hook.earnPoints(p, "Eco-Share"); setPointsEarned(p); setModalMode(null); hook.setActiveListing(null); }} disabled={userRating === 0} className="w-full bg-emerald-800 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-emerald-900 transition disabled:opacity-50">Submit & Claim Credits</button></div></>);
        if (modalMode === 'claim') return (<><div className="bg-teal-700 p-5 flex justify-between items-center shrink-0"><h3 className="text-white font-bold flex items-center gap-2 text-lg"><ShieldCheck size={20} /> Claim Details</h3><button onClick={() => setModalMode(null)} className="text-teal-200 hover:text-white bg-teal-800/50 p-1 rounded-full"><X size={20} /></button></div><div className="p-0 overflow-y-auto"><div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-white text-center shadow-inner"><p className="opacity-90 font-medium mb-2 uppercase tracking-wide text-xs">Verified Carbon Impact</p><div className="flex items-center justify-center gap-2 text-4xl font-extrabold mb-1"><Leaf className="fill-white" size={32} />{activeListing?.carbonSaved}kg CO2</div><div className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-medium mt-2 backdrop-blur-sm">Shared Credit: {(activeListing?.carbonSaved || 0) * 5} CC each</div></div><div className="p-6 md:p-8 space-y-6"><div className="flex items-center gap-5">{activeListing?.image ? (<img src={activeListing.image} alt="Food" className="w-20 h-20 rounded-2xl object-cover border border-gray-200 shadow-sm" />) : (<div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300"><Leaf size={32} /></div>)}<div><h4 className="font-bold text-gray-900 text-xl">{activeListing?.title}</h4><p className="text-gray-500 font-medium">{activeListing?.quantity} Servings • {activeListing?.giverName}</p></div></div>{activeListing && (activeListing.ingredients || activeListing.caloriesPerServing) && (<div className="bg-orange-50 border border-orange-100 rounded-2xl p-5"><div className="flex items-center gap-2 mb-3"><Info size={18} className="text-orange-500" /><h5 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Nutrition Info</h5></div>{activeListing.caloriesPerServing && (<div className="text-sm font-bold text-orange-700 mb-3 flex items-center gap-2"><Flame size={16} /> Est. {activeListing.caloriesPerServing} kcal per serving</div>)}{activeListing.ingredients && (<div className="flex flex-wrap gap-2">{activeListing.ingredients.map((ing: any, i: any) => (<span key={i} className="text-xs bg-white border border-orange-200 text-gray-600 px-3 py-1.5 rounded-lg shadow-sm font-medium">{ing}</span>))}</div>)}</div>)}</div></div><div className="border-t border-b border-gray-100 py-6 space-y-5"><div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Pickup Location</p><div className="flex items-start justify-between bg-gray-50 p-4 rounded-xl border border-gray-100"><div className="flex items-start gap-3 text-gray-800"><MapPin className="text-emerald-600 mt-1 shrink-0" size={20} /><div><p className="font-bold text-sm">{activeListing?.location}</p><p className="text-xs text-gray-500 mt-0.5">Approx. {activeListing?.distance} away</p></div></div><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeListing?.location || "")}`} target="_blank" rel="noreferrer" className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline bg-blue-50 px-2 py-1 rounded">Directions <ExternalLink size={10} /></a></div></div><div className="flex gap-2"><button onClick={() => setModalMode('message')} className="flex-1 bg-white text-emerald-700 py-4 rounded-xl font-bold border-2 border-emerald-100 flex items-center justify-center gap-2 hover:bg-emerald-50 hover:border-emerald-200 transition"><MessageCircle size={20} /> Chat</button>{activeListing?.claimedBy === user?.id && <button onClick={() => { setModalMode('unclaim-confirm'); }} className="flex-1 bg-red-50 text-red-600 py-4 rounded-xl font-bold border-2 border-red-50 flex items-center justify-center gap-2 hover:bg-red-100 hover:border-red-100 transition"><X size={20} /> Unclaim</button>}</div></div>{activeListing?.status === 'claimed' && activeListing?.claimedBy === user?.id && (<div className="bg-gray-100 p-6 rounded-2xl text-center border border-gray-200"><p className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-bold">Show this Eco-ID to Giver</p><span className="font-mono text-5xl font-black text-gray-800 tracking-widest">{claimedCode || activeListing.claimCode}</span></div>)}<button onClick={() => setModalMode(null)} className="w-full py-3 font-bold text-gray-400 hover:text-gray-600 transition">Close</button></>);
        if (modalMode === 'unclaim-confirm') return (<><div className="bg-red-50 p-5 flex justify-between items-center shrink-0"><h3 className="text-red-700 font-bold flex items-center gap-2 text-lg"><AlertTriangle size={20} /> Unclaim Item?</h3><button onClick={() => setModalMode('claim')} className="text-red-300 hover:text-red-500 bg-red-100 p-1 rounded-full"><X size={20} /></button></div><div className="p-8 text-center"><div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100"><Leaf size={32} className="text-red-400" /></div><h4 className="text-xl font-bold text-gray-800 mb-2">Are you sure?</h4><p className="text-gray-500 mb-8">This will release <strong>{activeListing?.title}</strong> back to the community.</p><div className="space-y-3"><button onClick={handleUnclaim} className="w-full bg-red-500 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-red-200 hover:bg-red-600 transition">Yes, Unclaim It</button><button onClick={() => setModalMode('claim')} className="w-full text-gray-400 font-bold hover:text-gray-600 transition">Keep It</button></div></div></>);
        return null;
    };

    return (
        <div className="animate-fade-in relative">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Eco-Share Hub</h2>
                <p className="text-gray-500 mt-1">Reduce waste, earn Carbon Points.</p>
                <div className="flex justify-center mt-6">
                    <div className="bg-gray-100 p-1.5 rounded-xl flex text-sm font-bold shadow-inner">
                        <button onClick={() => { setUserRole('giver'); hook.resetForm(); }} className={`px-8 py-2.5 rounded-lg transition-all duration-300 ${userRole === 'giver' ? 'bg-white text-emerald-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>I have food</button>
                        <button onClick={() => { setUserRole('receiver'); hook.resetForm(); }} className={`px-8 py-2.5 rounded-lg transition-all duration-300 ${userRole === 'receiver' ? 'bg-white text-emerald-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>I need food</button>
                    </div>
                </div>
            </div>

            {userRole === 'receiver' ? (
                <div className="space-y-8 animate-fade-in">
                    <div className="flex justify-center gap-3 mb-8">
                        <button onClick={() => setReceiverTab('browse')} className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border ${receiverTab === 'browse' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-105' : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-200 hover:text-emerald-600'}`}><Search size={16} />Find Food</button>
                        <button onClick={() => setReceiverTab('history')} className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border ${receiverTab === 'history' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-105' : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-200 hover:text-emerald-600'}`}><HeartHandshake size={16} />My Impact</button>
                    </div>

                    {receiverTab === 'browse' ? (
                        <>
                            {listings.filter(l => l.status === 'claimed' && l.claimedBy === user?.id).length > 0 && (
                                <div className="bg-orange-50 rounded-2xl border border-orange-100 p-6 mb-8 shadow-sm">
                                    <h3 className="font-bold text-orange-800 mb-4 flex items-center gap-2 text-lg"><Clock size={20} /> Your Pending Pickups</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{listings.filter(l => l.status === 'claimed' && l.claimedBy === user?.id).map(item => (<div key={item.id} className="bg-white p-4 rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition flex justify-between items-center cursor-pointer group" onClick={() => handleViewClaimDetails(item)}><div className="flex items-center gap-4">{item.image ? <img src={item.image} alt="mini" className="w-14 h-14 rounded-lg object-cover" /> : <div className="w-14 h-14 bg-orange-100 rounded-lg flex items-center justify-center"><Leaf size={20} className="text-orange-300" /></div>}<div><p className="font-bold text-gray-800 group-hover:text-orange-600 transition">{item.title}</p><div className="flex items-center gap-2 text-xs mt-1"><span className="text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded"><Leaf size={10} /> -{item.carbonSaved}kg</span></div></div></div><div className="bg-orange-100 text-orange-700 p-2 rounded-full group-hover:bg-orange-200 transition"><ShieldCheck size={20} /></div></div>))}</div>
                                </div>
                            )}

                            <div>
                                {/* Smart Matching Section */}
                                <div className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10"><Brain size={120} className="text-indigo-900" /></div>
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2"><Sparkles className="text-indigo-500 fill-indigo-200" size={20} /> Smart Picks For You</h3>
                                                <p className="text-sm text-indigo-700/80">AI-powered recommendations based on your health profile.</p>
                                            </div>
                                            <button onClick={hook.handleFindMatches} disabled={hook.isMatching} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed">
                                                {hook.isMatching ? <Loader2 size={16} className="animate-spin" /> : <Brain size={16} />}
                                                {hook.isMatching ? "Analyzing..." : "Find Matches"}
                                            </button>
                                        </div>

                                        {hook.smartMatches.length > 0 && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
                                                {hook.smartMatches.map((match, idx) => {
                                                    const listing = listings.find(l => l.id === match.listingId);
                                                    if (!listing) return null;
                                                    return (
                                                        <div key={idx} className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm hover:shadow-md transition">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div className={`px-2 py-1 rounded text-xs font-black uppercase tracking-wide ${match.matchScore > 80 ? 'bg-green-100 text-green-700' : match.matchScore > 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                                                                    {match.matchScore}% Match
                                                                </div>
                                                                <span className="text-[10px] text-gray-400 font-bold">AI Reason</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 mb-3">
                                                                {listing.image ? <img src={listing.image} className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center"><Leaf size={16} className="text-gray-300" /></div>}
                                                                <div>
                                                                    <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{listing.title}</h4>
                                                                    <p className="text-xs text-gray-500">{listing.quantity} Servings</p>
                                                                </div>
                                                            </div>
                                                            <p className="text-xs text-indigo-800 bg-indigo-50/50 p-2 rounded-lg italic">"{match.reason}"</p>
                                                            <button onClick={() => handleInitClaim(listing)} className="w-full mt-3 bg-indigo-50 text-indigo-700 py-2 rounded-lg text-xs font-bold hover:bg-indigo-100 transition">View to Claim</button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* End Smart Matching */}

                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                                    <h3 className="font-bold text-gray-800 flex items-center gap-2 text-xl"><MapPin size={24} className="text-emerald-600" /> Nearby Available Food</h3>
                                    <div className="relative w-full md:w-64"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} /><input type="text" value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)} placeholder="Filter by Zip Code..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 font-medium" /></div>
                                </div>
                                <div className="flex justify-end mb-4"><span className="text-sm font-medium text-gray-500">Showing {filteredListings.length} results</span></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {filteredListings.length === 0 && (<div className="col-span-full py-24 text-center text-gray-400 bg-white rounded-3xl border-2 border-dashed border-gray-100"><Leaf size={64} className="mx-auto mb-4 opacity-20" /><p className="text-lg font-medium">No food available in this location.</p><p className="text-sm opacity-60">Try changing your location filter.</p></div>)}
                                    {filteredListings.map((item) => (
                                        <ListingCard key={item.id} item={item} onMessage={handleMessage} onClaim={handleInitClaim} />
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div>
                            <h3 className="font-bold text-gray-800 text-xl mb-6 flex items-center gap-2"><History size={24} className="text-emerald-600" /> My Rescued Food</h3>
                            {receiverHistory.length === 0 ? (<div className="text-center py-20 bg-white rounded-3xl border border-gray-100"><Leaf size={48} className="mx-auto text-gray-300 mb-4" /><p className="text-gray-500 font-medium">You haven't rescued any food yet.</p><p className="text-sm text-gray-400">Start browsing to make an impact!</p></div>) : (<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{receiverHistory.map(item => (<div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col group hover:shadow-md transition"><div className="flex justify-between items-start mb-4"><div className="flex items-center gap-3"><div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg"><CheckCircle size={20} /></div><div><h4 className="font-bold text-gray-800 line-clamp-1">{item.title}</h4><p className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</p></div></div><span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">-{item.carbonSaved}kg CO2</span></div><div className="mt-auto pt-4 border-t border-gray-50 text-xs text-gray-500 flex justify-between"><span>From: {item.giverName}</span><span className="font-medium text-emerald-600">Completed</span></div></div>))}</div>)}
                        </div>
                    )}
                </div>
            ) : (
                <div className="animate-fade-in">
                    <div className="grid lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-5 space-y-6">
                            <div className="flex justify-between items-center lg:hidden"><button onClick={() => hook.setModalMode('verify')} className="flex items-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 hover:bg-emerald-100 transition"><ShieldCheck size={16} /> Verify Exchange</button></div>
                            {pointsEarned ? (
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 animate-fade-in">
                                    <div className="text-center py-10"><div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pop-in"><Award size={48} /></div><h3 className="text-3xl font-extrabold text-gray-800 mb-2">+{pointsEarned} Carbon Credits!</h3><p className="text-gray-500 mb-8">Transaction Verified & Added to Wallet</p><button onClick={() => { setAnalysis(null); setPointsEarned(null); setFoodImage(undefined); setIngredients([]); setCalories(null); setRefinements([]); }} className="bg-emerald-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-emerald-700 transition">Post Another</button></div>
                                </div>
                            ) : (
                                <ListingForm
                                    {...hook}
                                    handleImageUpload={hook.handleImageUpload}
                                    handleOpenVerify={() => hook.setModalMode('verify')}
                                />
                            )}
                        </div>

                        <div className="lg:col-span-7">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2 text-xl"><Clock size={24} className="text-emerald-600" /> My Listings</h3>
                                <div className="flex items-center gap-2"><div className="flex bg-gray-100 p-1 rounded-lg"><button onClick={() => setGiverTab('active')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${giverTab === 'active' ? 'bg-white shadow text-emerald-800' : 'text-gray-500'}`}>Active</button><button onClick={() => setGiverTab('history')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${giverTab === 'history' ? 'bg-white shadow text-emerald-800' : 'text-gray-500'}`}>History</button></div><button onClick={() => hook.setModalMode('verify')} className="hidden lg:flex items-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition shadow-sm"><ShieldCheck size={16} /> Verify</button></div>
                            </div>

                            {giverTab === 'active' ? (
                                <>
                                    {activeGiverListings.length === 0 ? (<div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border-2 border-dashed border-gray-200 text-center"><Leaf size={64} className="text-gray-200 mb-4" /><p className="text-gray-500 font-medium text-lg">No active listings.</p><p className="text-sm text-gray-400 mt-2">Post new food to share!</p></div>) : (<div className="grid md:grid-cols-2 gap-4">{activeGiverListings.map(item => (<div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-emerald-200 transition group hover:shadow-lg relative"><button onClick={(e) => { e.stopPropagation(); handleDeleteClick(item); }} className="absolute top-2 right-2 p-1.5 text-gray-400 bg-white border border-gray-200 rounded-lg hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 transition z-10 shadow-sm" title="Remove Post"><AlertCircle size={16} /></button><div className="flex items-start gap-4">{item.image ? (<img src={item.image} alt={item.title} className="w-20 h-20 rounded-xl object-cover shadow-sm" />) : (<div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100"><Leaf size={24} className="text-gray-300" /></div>)}<div className="flex-1 min-w-0"><div className="flex justify-between items-start pr-6"><h4 className="font-bold text-gray-800 text-lg truncate group-hover:text-emerald-700 transition">{item.title}</h4></div><div className="flex items-center gap-2 mt-1 mb-2">{item.status === 'claimed' ? (<span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">Claimed</span>) : (<span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">Active</span>)}<span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span></div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleMessage(item)} className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg hover:bg-emerald-100 transition flex items-center gap-1"><MessageCircle size={14} /> Messages</button>
                                            {item.status === 'claimed' && (<button onClick={() => hook.setModalMode('verify')} className="text-xs bg-orange-50 text-orange-700 font-bold px-3 py-2 rounded-lg border border-orange-200 hover:bg-orange-100 transition flex items-center gap-1"><KeyRound size={14} /> Verify</button>)}
                                        </div>
                                        {item.status === 'claimed' && (<div className="mt-2 p-2 rounded-lg border border-orange-100 bg-orange-50/50"><div className="text-xs text-gray-600">Claimed by: <strong>{item.claimedByName}</strong></div><div className="text-[10px] text-gray-500 flex items-center gap-1 mt-1"><Truck size={10} /> Pickup via {item.pickupMethod}</div></div>)}</div></div></div>))}</div>)}
                                </>
                            ) : (
                                <>
                                    {giverHistory.length === 0 ? (<div className="text-center py-20 bg-white rounded-3xl border border-gray-100"><History size={48} className="mx-auto text-gray-300 mb-4" /><p className="text-gray-500 font-medium">No completed exchanges yet.</p></div>) : (<div className="space-y-4">{giverHistory.map(item => (<div key={item.id} className={`bg-white p-4 rounded-xl border shadow-sm flex items-center justify-between transition ${item.status === 'deleted' ? 'border-red-100 opacity-75' : 'border-gray-100 opacity-80 hover:opacity-100'}`}><div className="flex items-center gap-4"><div className={`p-2 rounded-lg ${item.status === 'deleted' ? 'bg-red-50 text-red-500' : 'bg-emerald-100 text-emerald-600'}`}>{item.status === 'deleted' ? <X size={20} /> : <CheckCircle size={20} />}</div><div><h4 className="font-bold text-gray-800">{item.title}</h4>{item.status === 'deleted' ? (<p className="text-xs text-red-500 font-bold">Withdrawn from Hub</p>) : (<p className="text-xs text-gray-500">Given to: {item.claimedByName} • {new Date(item.createdAt).toLocaleDateString()}</p>)}</div></div><div className="text-right">{item.status === 'deleted' ? (<span className="block font-bold text-red-400 text-sm">Deleted</span>) : (<><span className="block font-bold text-emerald-600 text-sm">Completed</span><span className="text-xs text-gray-400">Saved {item.carbonSaved}kg CO2</span></>)}</div></div>))}</div>)}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {listingToDelete && (<div className="fixed inset-0 bg-emerald-950/40 z-[60] flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm" onClick={() => setListingToDelete(null)}><div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}><div className="text-center"><div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertCircle size={24} className="text-red-500" /></div><h3 className="text-lg font-bold text-gray-900 mb-2">Remove Listing?</h3><p className="text-sm text-gray-500 mb-6">Are you sure you want to delete <span className="font-bold">{listingToDelete.title}</span>? This action cannot be undone.</p><div className="flex gap-3"><button onClick={() => setListingToDelete(null)} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition">Cancel</button><button onClick={async () => { if (listingToDelete) { await deleteListing(listingToDelete.id); setListingToDelete(null); } }} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-100 border border-transparent transition">Delete</button></div></div></div></div>)}

            {modalMode && (
                <div className="fixed inset-0 bg-emerald-950/40 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm" onClick={() => { if (modalMode !== 'rate') { setModalMode(null); hook.setVerificationCode(""); hook.setActiveListing(null); hook.setSelectedScenario(null); } }}>
                    <div className={`bg-white rounded-3xl w-full max-w-sm md:max-w-md overflow-hidden shadow-2xl max-h-[90vh] flex flex-col ${modalMode === 'message' ? 'h-[600px]' : ''}`} onClick={e => e.stopPropagation()}>
                        {renderModalContent()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityHub;
