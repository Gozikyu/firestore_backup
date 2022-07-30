// Start writing Firebase Functions
//  https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

import * as functions from "firebase-functions";
import * as firestore from "@google-cloud/firestore";
const client = new firestore.v1.FirestoreAdminClient();

// Replace BUCKET_NAME
const bucket = "gs://my_first_project_backup";
exports.scheduledFirestoreExport = functions.pubsub
  .schedule("0 9 * * *")
  .onRun(async () => {
    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
    if (typeof projectId !== "string") {
      throw Error("Invalid ProjectId");
    }
    const databaseName = client.databasePath(projectId, "(default)");
    try {
      const responses = await client.exportDocuments({
        name: databaseName,
        outputUriPrefix: bucket,
        // Leave collectionIds empty to export all collections
        // or set to a list of collection IDs to export,
        // collectionIds: ['users', 'posts']
        collectionIds: [],
      });
      const response = responses[0];
      console.log(`Operation Name: ${response["name"]}`);
    } catch (err) {
      console.error(err);
      throw new Error("Export operation failed");
    }
  });
