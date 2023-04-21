import * as functions from "firebase-functions";
import * as sdk from "firebase-admin";
sdk.initializeApp();
const db = sdk.firestore();
exports.onReviewUpdate = functions.firestore.document("Reviews/{reviewId}")
    .onUpdate(async (change) => {

        const data = change.after.data();
        const previousData = change.before.data();
        console.log(data);
        console.log(previousData);
        if (previousData && data && (previousData.rating != data.rating)) {
            // this is an update lets recalculate the rate
            const documentId = data.restaurant.id as string;
            const restaurantDocument = await db.collection("Restaurants").doc(documentId).get();
            const restaurant = restaurantDocument.data();
            console.log(restaurant);
            if (restaurantDocument.exists && restaurant) {

                const numberOfReviewers = restaurant.numberOfReviewers as number;
                const rate = restaurant.rate as number;
                const total = rate * numberOfReviewers;

                const adjustedTotal = total - previousData.rating + data.rating;
                const adjustedRate = adjustedTotal / numberOfReviewers;
                restaurantDocument.ref.set({ rate: adjustedRate }, { merge: true })

            }
        }
    });
