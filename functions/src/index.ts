import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

/**
 * Trigger: When a listing is updated.
 * Goal: Check if status changed to 'completed' (Verified).
 * Action: Calculate carbon points and credit the 'giver' and 'receiver' (if applicable).
 */
export const onListingCompleted = functions.firestore
    .document("listings/{listingId}")
    .onUpdate(async (change, context) => {
        const newData = change.after.data();
        const previousData = change.before.data();

        // 1. Check if status changed to 'completed'
        if (newData.status === "completed" && previousData.status !== "completed") {
            const listingId = context.params.listingId;
            console.log(`Listing ${listingId} completed. Processing rewards...`);

            const carbonSaved = newData.carbonSaved || 0;
            // Points Logic: 10 points per kg saved + 50 base points for participation
            const pointsToAward = Math.round(carbonSaved * 10) + 50;

            const batch = db.batch();

            // 2. Award Points to Giver
            if (newData.giverId) {
                const giverRef = db.collection("users").doc(newData.giverId);
                batch.update(giverRef, {
                    walletBalance: admin.firestore.FieldValue.increment(pointsToAward),
                    totalCarbonSaved: admin.firestore.FieldValue.increment(carbonSaved),
                });

                // Log Transaction
                const giverTxRef = db.collection("transactions").doc();
                batch.set(giverTxRef, {
                    userId: newData.giverId,
                    amount: pointsToAward,
                    type: "credit",
                    description: `Eco-Share: ${newData.title}`,
                    date: admin.firestore.FieldValue.serverTimestamp(),
                    listingId: listingId
                });
            }

            // 3. Award Points to Receiver (Incentivize pickup)
            if (newData.claimedBy) {
                const receiverRef = db.collection("users").doc(newData.claimedBy);
                // Receivers get half points just for picking up (demo logic)
                const receiverPoints = Math.floor(pointsToAward / 2);

                batch.update(receiverRef, {
                    walletBalance: admin.firestore.FieldValue.increment(receiverPoints),
                });

                // Log Transaction
                const receiverTxRef = db.collection("transactions").doc();
                batch.set(receiverTxRef, {
                    userId: newData.claimedBy,
                    amount: receiverPoints,
                    type: "credit",
                    description: `Pickup Bonus: ${newData.title}`,
                    date: admin.firestore.FieldValue.serverTimestamp(),
                    listingId: listingId
                });
            }

            // 4. Commit Validation
            await batch.commit();
            console.log(`Awarded ${pointsToAward} points to giver and ${Math.floor(pointsToAward / 2)} to receiver.`);
        }

        return null;
    });
