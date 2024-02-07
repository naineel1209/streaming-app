import { path } from '@ffmpeg-installer/ffmpeg';
import ffmpeg from "fluent-ffmpeg";
ffmpeg.setFfmpegPath(path);
import fs from "fs";
import express, { NextFunction } from "express";
import { createServer } from "http";


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
const readStream = fs.createReadStream("./assets/The Mamas & The Papas - California Dreamin'-(1080p).mp4");

// const proc = ffmpeg(readStream)
//   .on("progress", (info) => {
//     console.log(info)
//   })
//   .on("end", () => {
//     console.log("file converted successfully");
//   })
//   .on("error", (err) => {
//     console.log("error ", err);
//   })
//   .toFormat("webm")
//   .saveToFile(`./output/assests_${Math.floor(Math.random() * 100)}.webm`);

ffmpeg("./assets/The Mamas & The Papas - California Dreamin'-(1080p).mp4").videoCodec('libvpx') //libvpx-vp9 could be used too
  .videoBitrate(1000, true) //Outputting a constrained 1Mbit VP8 video stream
  .outputOptions(
    '-minrate', '1000',
    '-maxrate', '1000',
    '-threads', '10', //Use number of real cores available on the computer - 1
    '-flags', '+global_header', //WebM won't love if you if you don't give it some headers
    '-psnr') //Show PSNR measurements in output. Anything above 40dB indicates excellent fidelity
  .on('progress', function (progress) {
    console.log('Processing: ' + progress.percent + '% done');
  })
  .on('error', function (err) {
    console.log('An error occurred: ' + err.message);
  })
  .on('end', function (err, stdout, stderr) {
    console.log(stdout);
    console.log('Processing finished.');
    var regex = /LPSNR=Y:([0-9\.]+) U:([0-9\.]+) V:([0-9\.]+) \*:([0-9\.]+)/
    var psnr = stdout.match(regex);
    console.log('This WebM transcode scored a PSNR of: ');
    console.log(psnr[4] + 'dB');
  })
  .save('futbol.webm');

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


