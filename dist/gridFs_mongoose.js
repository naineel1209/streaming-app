import fs from "node:fs";
import mongoose from "mongoose";
async function start(URI) {
    await mongoose.connect(URI);
    const conn = mongoose.connection;
    const Grid = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: "videos"
    });
    const readStream = fs.createReadStream("./assets/assests_18.mkv");
    const uploadStream = Grid.openUploadStream("assests_18.mkv");
    readStream.pipe(uploadStream);
    readStream.on("error", () => {
        console.log("Error in reading the file");
    });
    readStream.on("end", () => {
        console.log("File uploaded successfully");
    });
    uploadStream.on("error", () => {
        console.log("Error in uploading the file");
    });
    uploadStream.on("finish", () => {
        console.log("File uploaded successfully");
    });
}
async function getVideo(URI) {
    await mongoose.connect(URI);
    const conn = mongoose.connection;
    const Grid = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: "videos"
    });
    const downloadStream = Grid.openDownloadStream(new mongoose.Types.ObjectId("65bf6e059ce518911579ae02"), {
        start: 0,
    });
    const writeStream = fs.createWriteStream("./output/assests_18.mkv");
    downloadStream.pipe(writeStream);
    downloadStream.on("error", () => {
        console.log("Error in reading the file");
    });
    downloadStream.on("end", () => {
        console.log("File downloaded successfully");
    });
    writeStream.on("error", () => {
        console.log("Error in uploading the file");
    });
    writeStream.on("finish", () => {
        console.log("File downloaded successfully");
    });
    return;
}
getVideo("mongodb+srv://naineel:naineels12@nodeexpressprojects.euigymj.mongodb.net/GRID_FS?retryWrites=true&w=majority");
