#!/usr/bin/env node

/**
 * WeDesign Real-time Webcam ASCII Renderer
 * Usage: node realtime-cam-ascii.js
 * 
 * Note: Requires a webcam capture tool (like imagesnap on macOS).
 */

const NodeWebcam = require('node-webcam');
const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');

const ASCII_CHARS = "@%#*+=-:. ";
const WIDTH = 80;
const HEIGHT = 40;

const opts = {
  width: 640,
  height: 480,
  quality: 100,
  delay: 0,
  saveShots: false,
  output: "jpeg",
  device: false,
  callbackReturn: "buffer",
  verbose: false
};

const webcam = NodeWebcam.create(opts);

// Hide cursor
process.stdout.write('\x1B[?25l');
// Clear terminal
process.stdout.write('\x1B[2J\x1B[H');

console.log('\x1b[1;32m[SYSTEM_UPLINK]\x1b[0m Starting Real-time Neural Webcam Stream...');
console.log('\x1b[1;30mPress CTRL+C to Abort\x1b[0m');

async function processFrame(buffer) {
  try {
    const image = await Jimp.read(buffer);
    image.resize(WIDTH, HEIGHT).grayscale();

    let frame = "";
    for (let y = 0; y < image.bitmap.height; y++) {
      for (let x = 0; x < image.bitmap.width; x++) {
        const pixelColor = image.getPixelColor(x, y);
        const { r } = Jimp.intToRGBA(pixelColor);
        const charIndex = Math.floor((r / 255) * (ASCII_CHARS.length - 1));
        frame += ASCII_CHARS[charIndex];
      }
      frame += "\n";
    }

    // Move cursor to top
    process.stdout.write('\x1B[H');
    // Render frame
    process.stdout.write(frame);
    process.stdout.write(`\n\x1b[1;32m[STREAMING_ACTIVE]\x1b[0m WIDTH: ${WIDTH} | RES: ${image.bitmap.width}x${image.bitmap.height}\n`);
    
  } catch (err) {
    // console.error(err);
  }
}

function captureLoop() {
  webcam.capture("frame", (err, data) => {
    if (err) {
      process.stdout.write('\x1B[H');
      console.error(`\x1b[1;31m[UPLINK_ERROR]\x1b[0m ${err}`);
      console.log('\x1b[1;30mWaiting for camera availability...\x1b[0m');
      setTimeout(captureLoop, 1000);
      return;
    }
    
    processFrame(data).then(() => {
      // Immediate next frame
      setImmediate(captureLoop);
    });
  });
}

// Start loop
captureLoop();

// Handle Exit
process.on('SIGINT', () => {
  process.stdout.write('\x1B[?25h\n\n\x1b[1;31m[UPLINK_TERMINATED]\x1b[0m\n');
  process.exit(0);
});
