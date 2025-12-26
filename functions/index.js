// functions/index.js
// DEPLOY THIS TO FIREBASE FUNCTIONS

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// You must set this config: firebase functions:config:set stripe.secret="sk_live_..."
const stripe = require('stripe')(functions.config().stripe.secret);

exports.createStripeCheckoutSession = functions.https.onCall(async (data, context) => {
    // 1. Security Check
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    }

    const { priceId, userId } = data;
    const origin = 'https://replateiq.ai'; // Update or make dynamic

    try {
        // 2. Create Session
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            customer_email: context.auth.token.email,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            metadata: {
                firebaseUserId: userId
            },
            success_url: `${origin}/profile?success=true`,
            cancel_url: `${origin}/profile?canceled=true`,
        });

        return { sessionId: session.id };
    } catch (error) {
        console.error("Stripe Error:", error);
        throw new functions.https.HttpsError('internal', 'Unable to create checkout session');
    }
});

exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = functions.config().stripe.webhook_secret;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session.metadata.firebaseUserId;

        // FULFILLMENT: Update Firestore
        await admin.firestore().collection('users').doc(userId).update({
            // Logic to determine tier based on price ID would go here or be passed in metadata
            subscriptionTier: 'pro',
            isLifetimeMember: true
        });
    }

    res.json({ received: true });
});

exports.verifyTransaction = functions.https.onCall(async (data, context) => {
    // 1. Auth Check
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');

    const { listingId, code } = data;
    const db = admin.firestore();

    try {
        await db.runTransaction(async (t) => {
            const listingRef = db.collection('listings').doc(listingId);
            const listingDoc = await t.get(listingRef);

            if (!listingDoc.exists) throw new functions.https.HttpsError('not-found', 'Listing not found');
            const listing = listingDoc.data();

            // 2. Validation
            if (listing.giverId !== context.auth.uid) throw new functions.https.HttpsError('permission-denied', 'Only the Giver can verify.');
            if (listing.status !== 'claimed') throw new functions.https.HttpsError('failed-precondition', 'Listing is not in claimed state.');
            if (listing.claimCode !== code) throw new functions.https.HttpsError('invalid-argument', 'Incorrect Verification Code.');

            const giverRef = db.collection('users').doc(listing.giverId);
            const receiverRef = db.collection('users').doc(listing.claimedBy);

            const [giverDoc, receiverDoc] = await Promise.all([t.get(giverRef), t.get(receiverRef)]);

            // 3. Calculate Points (10 points per kg CO2e approx)
            const points = Math.round((listing.carbonSaved || 0) * 10) + 5;
            const splitPoints = Math.floor(points / 2);

            const timestamp = new Date().toISOString();
            const verificationHash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

            // 4. Update Giver
            const giverHistory = giverDoc.data().pointsHistory || [];
            t.update(giverRef, {
                walletBalance: admin.firestore.FieldValue.increment(splitPoints),
                pointsHistory: [{
                    id: Date.now().toString(),
                    date: timestamp,
                    amount: splitPoints,
                    description: `Food Rescued: ${listing.title} (50% Share)`,
                    type: 'earned',
                    standard: 'ReplateIQ Verified',
                    verificationHash
                }, ...giverHistory]
            });

            // 5. Update Receiver
            const receiverHistory = receiverDoc.data().pointsHistory || [];
            t.update(receiverRef, {
                walletBalance: admin.firestore.FieldValue.increment(splitPoints),
                pointsHistory: [{
                    id: (Date.now() + 1).toString(),
                    date: timestamp,
                    amount: splitPoints,
                    description: `Verified Pickup: ${listing.title} (50% Share)`,
                    type: 'earned',
                    standard: 'ReplateIQ Verified',
                    verificationHash
                }, ...receiverHistory]
            });

            // 6. Close Listing
            t.update(listingRef, { status: 'completed' });
        });

        return { success: true };
    } catch (error) {
        console.error("Verification Error:", error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});
