import { config } from "dotenv";
config();
import { getBucket } from './mongoUploader/connect2mongo.ts'

async function deleteBucket() {
    if (!process.env.MONGO_URI) {
        return ("URI not found");
    }
    const bucket = await getBucket(process.env.MONGO_URI, "videos");
    await bucket.drop();
    return "Bucket deleted";
}

deleteBucket().then((res) => {
    console.log(res);
}).catch((err) => {
    console.log(err);
})