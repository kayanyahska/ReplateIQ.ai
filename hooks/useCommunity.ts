
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { analyzeCarbonFootprint, predictDishDetails, analyzeFoodImage, findSmartMatches } from '../services/geminiService';
import { searchAddress, lookupZip } from '../services/mockLocationService';
import { compressImage, uploadImageToStorage } from '../services/imageUtils';
import { CarbonAnalysis, CarbonScenario, FoodListing, DishPrediction, SmartMatchResult } from '../types';

export const useCommunity = () => {
    const { user, earnPoints, submitRating, listings, postListing, claimListing, unclaimListing, completeListing, deleteListing, messages, sendMessage, isTyping, communityUsers } = useAuth();

    // Form State
    const [dishName, setDishName] = useState("");
    const [quantity, setQuantity] = useState(2);
    const [foodImage, setFoodImage] = useState<string | undefined>(undefined);
    const [foodImageFile, setFoodImageFile] = useState<File | undefined>(undefined);
    const [analysis, setAnalysis] = useState<CarbonAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // AI Prediction State
    const [isPredicting, setIsPredicting] = useState(false);
    const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
    const [isMatching, setIsMatching] = useState(false);
    const [smartMatches, setSmartMatches] = useState<SmartMatchResult[]>([]);
    const [ingredients, setIngredients] = useState<string[]>([]);
    const [calories, setCalories] = useState<number | null>(null);
    const [refinements, setRefinements] = useState<DishPrediction['refinements']>([]);
    const [newIngredient, setNewIngredient] = useState("");

    // Location State
    const [streetAddress, setStreetAddress] = useState("");
    const [isAddressFocused, setIsAddressFocused] = useState(false);
    const [zipCode, setZipCode] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [country, setCountry] = useState("");
    const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isZipLoading, setIsZipLoading] = useState(false);
    const [searchLocation, setSearchLocation] = useState("");

    // UI/Interaction State
    const [userRole, setUserRole] = useState<'giver' | 'receiver'>('giver');
    const [giverTab, setGiverTab] = useState<'active' | 'history'>('active');
    const [receiverTab, setReceiverTab] = useState<'browse' | 'history'>('browse');
    const [modalMode, setModalMode] = useState<'verify' | 'rate' | 'claim' | 'message' | 'pickup' | 'unclaim-confirm' | null>(null);
    const [selectedScenario, setSelectedScenario] = useState<CarbonScenario | null>(null);
    const [activeListing, setActiveListing] = useState<FoodListing | null>(null);
    const [listingToDelete, setListingToDelete] = useState<FoodListing | null>(null);

    // Verification & Rating
    const [verificationCode, setVerificationCode] = useState("");
    const [verificationError, setVerificationError] = useState<string | null>(null);
    const [userRating, setUserRating] = useState(0);
    const [claimedCode, setClaimedCode] = useState<string | null>(null);
    const [pointsEarned, setPointsEarned] = useState<number | null>(null);

    // Messaging
    const [messageText, setMessageText] = useState("");
    const [activeConversationUser, setActiveConversationUser] = useState<string | null>(null);

    // Initialize Location from User Profile
    useEffect(() => {
        if (user?.location) {
            const parts = user.location.split(',');
            if (parts.length > 0) setStreetAddress(parts[0].trim());
            const zipMatch = user.location.match(/\b\d{5}\b/);
            if (zipMatch) setSearchLocation(zipMatch[0]);
        }
    }, [user]);

    // Address Search
    useEffect(() => {
        if (streetAddress.length > 1 && isAddressFocused) {
            const timeoutId = setTimeout(async () => {
                const results = await searchAddress(streetAddress);
                setAddressSuggestions(results);
                setShowSuggestions(true);
            }, 300);
            return () => clearTimeout(timeoutId);
        } else {
            setShowSuggestions(false);
        }
    }, [streetAddress, isAddressFocused]);

    // Zip Lookup
    useEffect(() => {
        if (zipCode.length === 5) {
            const fetchZip = async () => {
                setIsZipLoading(true);
                const result = await lookupZip(zipCode);
                if (result) {
                    setCity(result.city);
                    setState(result.state);
                    setCountry(result.country);
                }
                setIsZipLoading(false);
            };
            fetchZip();
        }
    }, [zipCode]);

    // AI Helpers
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    // Remove data url prefix for Gemini
                    const base64 = reader.result.split(',')[1];
                    resolve(base64);
                }
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleSmartImageAnalysis = async (file: File) => {
        setIsAnalyzingImage(true);
        try {
            // Set Preview immediately
            setFoodImage(URL.createObjectURL(file));
            setFoodImageFile(file); // Store raw file for upload

            const base64 = await fileToBase64(file);
            const result = await analyzeFoodImage(base64);

            setDishName(result.title);
            // Parse quantity integer from string if possible or keep as 1, user can edit
            const q = parseInt(result.quantity);
            if (!isNaN(q)) setQuantity(q);

            setCalories(result.calories);
            // We don't get ingredients from Vision yet (simplification), but could ask for it. 
            // For now, let's trigger the text prediction based on the TITLE to get ingredients
            // OR we can just rely on the user filling it.
            // Let's call predictDishDetails in parallel to get ingredients from the TITLE vision gave us!

            const details = await predictDishDetails(result.title);
            setIngredients(details.ingredients);

        } catch (e) {
            console.error("Smart Analysis Failed", e);
            alert("Could not analyze image. Please fill details manually.");
        } finally {
            setIsAnalyzingImage(false);
        }
    };

    const handleFindMatches = async () => {
        if (!user) return;
        setIsMatching(true);
        try {
            // Mock Profile for now - In production, this comes from User Context
            const mockProfile = {
                name: user.name || "User",
                restrictions: [],
                healthGoals: ["General Health"] as any // Cast to satisfy enum if strict
            };
            // Only send available listings that are NOT mine
            const available = listings.filter(l => l.status === 'available' && l.giverId !== user.id);
            const matches = await findSmartMatches(available, mockProfile);
            setSmartMatches(matches.sort((a, b) => b.matchScore - a.matchScore));
        } catch (e) {
            console.error("Matching Failed", e);
        } finally {
            setIsMatching(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFoodImage(URL.createObjectURL(file));
            setFoodImageFile(file);
        }
    };

    // Helper Actions
    const handlePredictDish = async () => {
        if (!dishName.trim()) return;
        setIsPredicting(true);
        try {
            const result = await predictDishDetails(dishName);
            setIngredients(result.ingredients);
            setCalories(result.calories);
            setRefinements(result.refinements);
        } catch (e) {
            console.error(e);
        } finally {
            setIsPredicting(false);
        }
    };

    const handleAnalyze = async () => {
        const fullLocality = `${streetAddress}, ${city}, ${state} ${zipCode}`;
        if (!dishName || !streetAddress || !city) return;
        setIsLoading(true);
        setSelectedScenario(null);
        setPointsEarned(null);
        try {
            const result = await analyzeCarbonFootprint(dishName, quantity, fullLocality);
            setAnalysis(result);
        } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    const handlePostListing = async () => {
        if (!analysis || !selectedScenario) return;

        setIsLoading(true);
        try {
            let finalImageUrl = foodImage;

            // Upload Image if exists
            if (foodImageFile) {
                const compressed = await compressImage(foodImageFile);
                const path = `listings/${user?.id || 'anon'}/${Date.now()}.jpg`;
                finalImageUrl = await uploadImageToStorage(compressed, path);
            }

            const fullLocation = `${streetAddress}, ${city}, ${state} ${zipCode}`;
            const wasteScenario = analysis.scenarios.find(s => s.icon === 'trash');
            const aiWasteEmission = wasteScenario ? wasteScenario.co2e : 0;
            const baselineEmission = Math.max(aiWasteEmission, 0.8 * analysis.quantity);
            const actualSavings = Math.max(0, baselineEmission - selectedScenario.co2e);

            await postListing({
                title: analysis.dishName,
                quantity: analysis.quantity,
                location: fullLocation,
                image: finalImageUrl,
                distance: "0.5km",
                tags: ["Free", selectedScenario.icon === 'bike' ? "Eco-Ride" : "Pickup"],
                carbonSaved: parseFloat(actualSavings.toFixed(2)),
                ingredients: ingredients,
                caloriesPerServing: calories || 0
            });
            resetForm();
            alert("Successfully posted to Community Hub!");
        } catch (e) {
            console.error("Post listing failed", e);
            alert("Failed to post listing. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setAnalysis(null); setSelectedScenario(null); setDishName(""); setFoodImage(undefined); setFoodImageFile(undefined);
        setIngredients([]); setCalories(null); setRefinements([]);
    };

    const completePersonalAction = async (scenario: CarbonScenario) => {
        // For personal actions (not verified by a peer), we might still trust the client 
        // OR send a specific "logAction" event to the server. 
        // For now, we'll leave this as a visual update, but strictly speaking 
        // this should also be a server call if points are real currency.
        // Updated: Just submit the rating. The Server (Cloud Function) will see the 'completed' status
        // and automatically award the points to the wallet.
        // We just update local "visual" state for the modal success message if needed, 
        // or rely on the real-time listener to update the balance.
        await submitRating(userRating);

        // UX: Show the "Predicted" points just for gratification, but don't write them to DB from here.
        const predictedPoints = activeListing ? Math.round(activeListing.carbonSaved * 10) + 50 : 50;
        setPointsEarned(predictedPoints);

        setModalMode(null);
        // Keep activeListing/analysis clear logic for after the success screen
    };

    const handleVerifyCode = async () => {
        const l = await completeListing(verificationCode);
        if (l) {
            setActiveListing(l);
            setModalMode('rate');
        } else {
            setVerificationError("Invalid Code");
        }
    };

    const handleRateAndComplete = async () => {
        if (userRating === 0) return;
        await submitRating(userRating);
        const p = activeListing ? Math.round(activeListing.carbonSaved * 10) + 50 : 50;
        setPointsEarned(p);
        setModalMode(null);
        setActiveListing(null);
    };

    const handleConfirmDelete = async () => {
        if (listingToDelete) {
            await deleteListing(listingToDelete.id);
            setListingToDelete(null);
        }
    };

    const handleSendMessage = () => {
        if (!activeListing || !activeConversationUser) return;
        sendMessage(activeListing.id, messageText, activeConversationUser);
        setMessageText("");
    };

    const handleUnclaim = async () => {
        if (activeListing) {
            await unclaimListing(activeListing.id);
            setActiveListing(null);
            setModalMode(null);
        }
    };

    return {
        // State
        dishName, setDishName, quantity, setQuantity, foodImage, setFoodImage, analysis, setAnalysis, isLoading,
        isPredicting, isAnalyzingImage, isMatching, smartMatches, ingredients, setIngredients, calories, setCalories, refinements, setRefinements, newIngredient, setNewIngredient,
        streetAddress, setStreetAddress, isAddressFocused, setIsAddressFocused, zipCode, setZipCode, city, state, country,
        addressSuggestions, showSuggestions, setShowSuggestions, isZipLoading, searchLocation, setSearchLocation,
        userRole, setUserRole, giverTab, setGiverTab, receiverTab, setReceiverTab,
        modalMode, setModalMode, selectedScenario, setSelectedScenario, activeListing, setActiveListing,
        verificationCode, setVerificationCode, verificationError, setVerificationError, userRating, setUserRating,
        claimedCode, setClaimedCode, pointsEarned, setPointsEarned, messageText, setMessageText,
        activeConversationUser, setActiveConversationUser, listingToDelete, setListingToDelete,

        // Actions
        handlePredictDish, handleAnalyze, handlePostListing, completePersonalAction, resetForm,
        handleVerifyCode, handleRateAndComplete, handleConfirmDelete, handleSendMessage, handleUnclaim,
        handleSmartImageAnalysis, handleFindMatches, handleImageUpload,

        // Context
        user, listings, messages, sendMessage, isTyping, communityUsers,
        earnPoints, submitRating, postListing, claimListing, unclaimListing, completeListing, deleteListing
    };
};
