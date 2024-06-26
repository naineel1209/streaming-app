"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fluent_ffmpeg_1 = require("fluent-ffmpeg");
var fs_1 = require("fs");
//ffmpeg
// const outputFile = fs.createWriteStream("./output/assests_1.mp3")
// const read = ffmpeg("./assets/assests_1.mp4").toFormat("mp3").pipe(outputFile);
// outputFile.on("finish", () => {
//   console.log("File created");
// })
//remove audio from the video
// const outputFile = fs.createWriteStream("./output/assets_1.mp3")
// const proc = ffmpeg("./assets/assests_2.mp4").preset("flashvideo").noAudio().on("end", () => {
//   console.log("file converted successfully");
// }).on("error", (err) => {
//   console.log("error ", err);
// }).pipe(outputFile, {end: true});
// ffmpeg("./assets/assests_1.mp4").noAudio().saveToFile("./output/assets_1.mp4");
//withAudioQuality
// const proc = ffmpeg("./assets/assests_1.mp4").audioQuality(0).audioBitrate('40').audioChannels(2).audioFrequency(44100).audioCodec('libmp3lame').saveToFile("./output/x_m.mp4");
//withVideoBitrate
// const proc = ffmpeg("./assets/assests_35.mp4").fps(10).videoBitrate('1000k').saveToFile("./output/bear.mp4");
///progress
var readStream = fs_1.default.createReadStream("./assets/The Mamas & The Papas - California Dreamin'-(1080p).mp4");
// const proc = ffmpeg(readStream)
// .on("progress", (info) => {
//   console.log(info)
// })
// .on("end", () => {
//   console.log("file converted successfully");
// })
// .on("error", (err) => {
//   console.log("error ", err);
// })
// .toFormat("mp3")
// .save("./output/assests_31.mp3");
var proc = (0, fluent_ffmpeg_1.default)(readStream)
    .on("progress", function (info) {
    console.log(info);
})
    .on("end", function () {
    console.log("file converted successfully");
})
    .on("error", function (err) {
    console.log("error ", err);
})
    .videoBitrate("1000k")
    .videoCodec("libx264")
    .audioCodec("libmp3lame")
    .audioBitrate("128k")
    .outputFormat("webm")
    .saveToFile("./output/assets.webm");
