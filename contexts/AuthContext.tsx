
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, PointTransaction, FoodListing, ChatMessage, B2BListing, CarbonStandard, CarbonProject, ProjectCategory, TradeOffer, SubscriptionTier } from '../types';
import { db } from '../services/db';
import { SUBSCRIPTION_CONFIG } from '../services/subscriptionConfig';

interface AuthContextType {
    user: User | null;
    login: (email: string, password?: string) => Promise<void>;
    signup: (email: string, name: string, location: string, password?: string, role?: 'user' | 'enterprise') => Promise<void>;
    updateUser: (data: Partial<User>) => void;
    logout: () => void;
    resetPassword: (email: string) => Promise<void>;
    earnPoints: (amount: number, description: string) => void;
    redeemPoints: (amount: number, description: string) => boolean;
    transferCredits: (region: string, amount: number) => Promise<void>;

    // Handshake Protocol
    offers: TradeOffer[];
    pendingOfferCount: number;
    activeBids: TradeOffer[];
    broadcastOffer: (region: string, price: number) => Promise<void>;
    updateOfferPrice: (offerId: string, newPrice: number) => Promise<void>;
    acceptTradeOffer: (offerId: string) => Promise<void>;
    rejectTradeOffer: (offerId: string) => Promise<void>;

    // B2B Market
    b2bListings: B2BListing[];
    createB2BListing: (amount: number, price: number, vintage: number) => Promise<void>;
    buyB2BListing: (listingId: string, amount: number, retire: boolean) => Promise<void>;

    submitRating: (rating: number) => Promise<void>;
    getAllUsers: () => Promise<User[]>;
    communityUsers: User[];

    // Community Features
    listings: FoodListing[];
    postListing: (listing: Omit<FoodListing, 'id' | 'createdAt' | 'giverId' | 'giverName' | 'giverRating' | 'status' | 'carbonSaved'>) => void;
    claimListing: (id: string, method: string) => Promise<string | null>;
    unclaimListing: (id: string) => Promise<void>;
    completeListing: (code: string) => Promise<FoodListing | undefined>;
    deleteListing: (listingId: string) => Promise<void>;

    // Chat Features
    messages: ChatMessage[];
    sendMessage: (listingId: string, text: string, receiverId: string) => Promise<void>;
    isTyping: boolean;

    isLoading: boolean;
    // SUBSCRIPTION & LIMITS
    upgradeTier: (tier: SubscriptionTier) => Promise<void>;
    payLifetimeFee: () => Promise<void>;
    checkAiLimit: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [listings, setListings] = useState<FoodListing[]>([]);
    const [b2bListings, setB2BListings] = useState<B2BListing[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [communityUsers, setCommunityUsers] = useState<User[]>([]);
    const [offers, setOffers] = useState<TradeOffer[]>([]);
    const [activeBids, setActiveBids] = useState<TradeOffer[]>([]);
    const [isTyping, setIsTyping] = useState(false);

    // --- AUTH INITIALIZATION ---
    useEffect(() => {
        const unsubscribeAuth = db.onAuthStateChanged((user) => {
            setUser(user);
            setIsLoading(false);
        });
        return () => unsubscribeAuth();
    }, []);

    // --- DATA SUBSCRIPTIONS (REQUIRE AUTH) ---
    useEffect(() => {
        if (!user) {
            // Clear data on logout
            setListings([]);
            setB2BListings([]);
            setMessages([]);
            setCommunityUsers([]);
            setOffers([]);
            setActiveBids([]);
            return;
        }

        // 1. Common Subscriptions (All Auth Users)
        // Eco-Share Hub
        const unsubscribeListings = db.subscribeToListings((data) => {
            setListings(data);
        });

        // Chat
        const unsubscribeChats = db.subscribeToMessages((data) => {
            setMessages(data);
        });

        // 2. Role Specific Subscriptions
        let unsubscribeB2B = () => { };
        let unsubscribeUsers = () => { };
        let unsubscribeRoleSpecific = () => { };

        if (user.role === 'enterprise') {
            // ENTERPRISE ONLY: B2B Market, Community Aggregation (All Users), Active Bids
            unsubscribeB2B = db.subscribeToB2BListings((data) => {
                setB2BListings(data);
            });

            unsubscribeUsers = db.subscribeToUsers((data) => {
                // Filter users for community aggregation
                setCommunityUsers(data.filter(u => u.role === 'user' || !u.role));
            });

            unsubscribeRoleSpecific = db.subscribeToEnterpriseBids(user.id, setActiveBids);
        } else {
            // INDIVIDUAL USER ONLY: Trade Requests (Offers)
            unsubscribeRoleSpecific = db.subscribeToUserOffers(user.id, setOffers);
        }

        return () => {
            unsubscribeListings();
            unsubscribeChats();
            unsubscribeB2B();
            unsubscribeUsers();
            unsubscribeRoleSpecific();
        };
    }, [user]); // Re-run when user changes (login/logout)

    // --- AUTH METHODS ---

    const login = async (email: string, password?: string) => {
        await db.login(email, password);
    };

    const signup = async (email: string, name: string, location: string, password?: string, role: 'user' | 'enterprise' = 'user') => {
        const newUser: User = {
            id: Date.now().toString(),
            email,
            name,
            location,
            password,
            role,
            walletBalance: role === 'enterprise' ? 0 : 100,
            pointsHistory: [{
                id: Date.now().toString(),
                date: new Date().toISOString(),
                amount: role === 'enterprise' ? 0 : 100,
                description: "Account Created",
                type: 'earned',
                standard: 'ReplateIQ Verified'
            }],
            rating: 5.0,
            ratingCount: 0,
            // SUBSCRIPTION DEFAULTS
            isLifetimeMember: false, // Must pay $5
            subscriptionTier: SubscriptionTier.FREE,
            aiScanCount: 0,
            lastAiResetDate: new Date().toISOString()
        };

        await db.signup(newUser);
    };

    const logout = async () => {
        await db.logout();
    };

    const resetPassword = async (email: string) => {
        return new Promise<void>((resolve) => setTimeout(resolve, 1000));
    };

    const updateUser = async (data: Partial<User>) => {
        if (!user) return;
        await db.updateUser(user.id, data);
    };

    const getAllUsers = async () => {
        return await db.getAllUsers();
    };

    // --- POINTS & WALLET ---

    const earnPoints = async (amount: number, description: string) => {
        if (!user) return;
        await db.addPoints(user.id, amount, description);
    };

    const redeemPoints = (amount: number, description: string): boolean => {
        if (!user || user.walletBalance < amount) return false;
        const newBalance = user.walletBalance - amount;
        const history = [{
            id: Date.now().toString(),
            date: new Date().toISOString(),
            amount,
            description,
            type: 'redeemed'
        } as PointTransaction, ...user.pointsHistory];
        updateUser({ walletBalance: newBalance, pointsHistory: history });
        return true;
    };

    // Handshake Protocol
    const broadcastOffer = async (region: string, price: number) => {
        if (!user || user.role !== 'enterprise') return;
        await db.broadcastOffer(user.id, user.name, region, price);
    };

    const updateOfferPrice = async (offerId: string, newPrice: number) => {
        if (!user || user.role !== 'enterprise') return;
        await db.updateOfferPrice(offerId, newPrice);
    };

    const acceptTradeOffer = async (offerId: string) => {
        if (!user) return;
        await db.acceptTradeOffer(offerId, user.id);
    };

    const rejectTradeOffer = async (offerId: string) => {
        if (!user) return;
        await db.rejectTradeOffer(offerId);
    };

    // Legacy
    const transferCredits = async (region: string, amount: number) => {
        if (!user) return;
        await db.transferCredits(user.id, region, amount);
    };

    const createB2BListing = async (amount: number, price: number, vintage: number) => {
        if (!user) return;
        const project = db.getCommunityProject();
        const listing: B2BListing = {
            id: Date.now().toString(),
            sellerId: user.id,
            sellerName: user.name,
            sellerVerified: user.kycVerified || false,
            amount,
            pricePerCredit: price,
            project,
            vintage,
            serialNumberRange: "",
            status: 'active',
            createdAt: new Date().toISOString()
        };
        await db.createB2BListing(listing);
    };

    const buyB2BListing = async (listingId: string, amount: number, retire: boolean) => {
        if (!user) return;
        await db.buyB2BListing(user.id, listingId, amount, retire);
    };

    const submitRating = async (rating: number) => {
        console.log(`Rating submitted: ${rating}`);
    };

    // --- SUBSCRIPTION LOGIC ---
    const payLifetimeFee = async () => {
        if (!user) return;
        // Mock Payment: In prod, this would be Stripe
        await updateUser({ isLifetimeMember: true });
    };

    const upgradeTier = async (tier: SubscriptionTier) => {
        if (!user) return;
        // Mock Payment: In prod, this would be Stripe
        await updateUser({ subscriptionTier: tier });
    };

    const checkAiLimit = (): boolean => {
        if (!user) return false;

        // 0. RESET COUNTER IF NEW DAY
        const now = new Date();
        const lastReset = new Date(user.lastAiResetDate || now.toISOString());
        const isNewDay = now.getDate() !== lastReset.getDate() || now.getMonth() !== lastReset.getMonth();

        if (isNewDay) {
            // Reset logic should ideally be server-side or happen on read, but client-lazy-reset works for MVP
            updateUser({ aiScanCount: 0, lastAiResetDate: now.toISOString() });
            return true; // Fresh start!
        }

        // 1. CHECK LIMITS
        if (user.subscriptionTier === SubscriptionTier.BUSINESS) return true;

        const limit = SUBSCRIPTION_CONFIG[user.subscriptionTier]?.aiLimit || 3;
        return user.aiScanCount < limit;
    };

    // --- LISTINGS & CHAT ---
    const postListing = async (data: any) => { if (user) await db.addListing({ ...data, giverId: user.id, giverName: user.name, giverRating: user.rating, status: 'available', createdAt: new Date().toISOString(), id: Date.now().toString() }); };


    const claimListing = async (id: string, method: string): Promise<string | null> => {
        if (!user) return null;

        // Critical: Check if already claimed to prevent race conditions (client-side check)
        const currentListing = listings.find(l => l.id === id);
        if (!currentListing || currentListing.status === 'claimed') {
            // If we really wanted to be robust, we'd check DB here, but for now client check + optimistic
            return null;
        }

        const code = Math.floor(1000 + Math.random() * 9000).toString();

        try {
            await db.updateListing(id, {
                status: 'claimed',
                claimedBy: user.id,
                claimedByName: user.name,
                claimCode: code,
                pickupMethod: method
            });

            // Receiver calculates conversation: Sender=Me, Receiver=Giver
            await sendMessage(id, `System: I've claimed this item via ${method}.`, currentListing.giverId);
            return code;
        } catch (error) {
            console.error("Claim failed:", error);
            return null;
        }
    };

    const unclaimListing = async (id: string) => {
        if (!user) return;
        try {
            const listing = listings.find(l => l.id === id);
            // If listing isn't found in local state, we might still want to try to unclaim via DB if possible,
            // but for now let's strict check.
            if (!listing) {
                console.error("Listing not found in context");
                return;
            }

            await db.unclaimListing(id);
            // Receiver is Giver
            await sendMessage(id, `System: I have unclaimed this item.`, listing.giverId);
        } catch (error: any) {
            console.error("Unclaim Error:", error);
            // alert(`Unclaim Failed: ${error.message || error}`);
        }
    };

    const completeListing = async (code: string): Promise<FoodListing | undefined> => {
        const listing = listings.find(l => l.status === 'claimed' && l.claimCode === code);
        if (listing) {
            try {
                const success = await db.verifyTransaction(listing.id, code);
                if (success) {
                    return { ...listing, status: 'completed' };
                }
            } catch (e) {
                console.error("Verification failed", e);
            }
        }
        return undefined;
    };

    const deleteListing = async (id: string) => { if (user) await db.deleteListing(id); };

    const sendMessage = async (id: string, text: string, receiverId: string) => {
        if (user) {
            await db.sendMessage({ id: Date.now().toString(), listingId: id, senderId: user.id, senderName: user.name, receiverId, text, timestamp: new Date().toISOString() });
        }
    };

    return (
        <AuthContext.Provider value={{
            user, login, signup, updateUser, logout, resetPassword,
            earnPoints, redeemPoints, transferCredits, createB2BListing, buyB2BListing, b2bListings,
            offers, activeBids, broadcastOffer, acceptTradeOffer, rejectTradeOffer, updateOfferPrice,
            pendingOfferCount: offers.length,
            submitRating, getAllUsers, communityUsers,
            listings, postListing, claimListing, unclaimListing, completeListing, deleteListing,
            messages, sendMessage, isTyping,
            isLoading,
            upgradeTier, payLifetimeFee, checkAiLimit
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
