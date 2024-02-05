import { config } from "dotenv";
config();
import { getBucket } from "./mongoUploader/connect2mongo";

async function runAll() {
    if (!process.env.MONGO_URI) {
        return "URI not found";
    }

    const bucket = await getBucket(process.env.MONGO_URI, "videos");
    const data = await bucket.find({}).toArray();
}