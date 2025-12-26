
import { collection, doc, setDoc, writeBatch } from "firebase/firestore";
import { db as firebaseFirestore } from "./firebaseConfig";
import { User, B2BListing, ProjectCategory } from "../types";

const DEMO_USERS: Partial<User>[] = [
    { id: "user_1", name: "Sarah Jenkins", email: "sarah@example.com", role: 'user', location: "Brooklyn, NY, USA", walletBalance: 150, pointsHistory: [] },
    { id: "user_2", name: "Mike Chen", email: "mike@example.com", role: 'user', location: "Austin, TX, USA", walletBalance: 320, pointsHistory: [] },
    { id: "user_3", name: "Priya Patel", email: "priya@example.com", role: 'user', location: "San Jose, CA, USA", walletBalance: 85, pointsHistory: [] },
    { id: "user_4", name: "David Smith", email: "david@example.com", role: 'user', location: "London, UK", walletBalance: 210, pointsHistory: [] },
    { id: "user_5", name: "Anita Roy", email: "anita@example.com", role: 'user', location: "Mumbai, IN", walletBalance: 500, pointsHistory: [] },
];

const DEMO_LISTINGS: B2BListing[] = [
    {
        id: "list_1",
        sellerId: "user_5",
        sellerName: "Anita Roy",
        sellerVerified: true,
        amount: 250,
        pricePerCredit: 12.50,
        vintage: 2024,
        status: 'active',
        createdAt: new Date().toISOString(),
        serialNumberRange: "RIQ-IN-2024-001",
        project: {
            id: "PROJ-RIQ-COMMUNITY",
            name: "ReplateIQ Community Aggregation",
            category: ProjectCategory.AvoidedEmissions,
            location: "Mumbai, India",
            country: "India",
            standard: "ReplateIQ Verified",
            methodology: "RIQ-Avoidance-001",
            sdgGoals: [12, 13],
            image: "https://images.unsplash.com/photo-1542601906990-b4d3fb7d5763?auto=format&fit=crop&w=800",
            description: "Community sourced food waste diversion."
        }
    },
    {
        id: "list_2",
        sellerId: "enterprise_1",
        sellerName: "GreenFuture Corp",
        sellerVerified: true,
        amount: 5000,
        pricePerCredit: 18.00,
        vintage: 2023,
        status: 'active',
        createdAt: new Date().toISOString(),
        serialNumberRange: "VCS-1892-2023",
        project: {
            id: "PROJ-VCS-FOREST",
            name: "Amazon Reforestation Project",
            category: ProjectCategory.Reforestation,
            location: "Brazil",
            country: "Brazil",
            standard: "VCS",
            methodology: "VM0015",
            sdgGoals: [13, 15],
            image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800",
            description: "Large scale reforestation in the Amazon basin."
        }
    },
    {
        id: "list_3",
        sellerId: "enterprise_2",
        sellerName: "CleanWind Energy",
        sellerVerified: true,
        amount: 1200,
        pricePerCredit: 15.75,
        vintage: 2024,
        status: 'active',
        createdAt: new Date().toISOString(),
        serialNumberRange: "GS-402-2024",
        project: {
            id: "PROJ-GS-WIND",
            name: "Gujarat Wind Power",
            category: ProjectCategory.RenewableEnergy,
            location: "Gujarat, India",
            country: "India",
            standard: "Gold Standard",
            methodology: "ACM0002",
            sdgGoals: [7, 13],
            image: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?auto=format&fit=crop&w=800",
            description: "Grid-connected wind power generation."
        }
    }
];

export const seedDatabase = async () => {
    if (!firebaseFirestore) return;
    const batch = writeBatch(firebaseFirestore);

    // 1. Seed Users
    DEMO_USERS.forEach(u => {
        const ref = doc(firebaseFirestore, "users", u.id!);
        batch.set(ref, { ...u, walletId: `WAL-${Math.floor(Math.random() * 10000)}` }, { merge: true });
    });

    // 2. Seed B2B Listings
    DEMO_LISTINGS.forEach(l => {
        const ref = doc(firebaseFirestore, "b2b_listings", l.id);
        batch.set(ref, l);
    });

    await batch.commit();
    console.log("Database Seeded!");
    alert("Database Seeded Successfully! Reload the dashboard.");
};
