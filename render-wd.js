#!/usr/bin/env node

/**
 * WeDesign .wd Terminal Renderer
 * Usage: node render-wd.js <path-to-file.wd>
 */

const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];

if (!filePath) {
  console.error('Usage: node render-wd.js <path-to-file.wd>');
  process.exit(1);
}

try {
  const rawData = fs.readFileSync(path.resolve(filePath), 'utf8');
  const data = JSON.parse(rawData);

  if (!data.frames || !Array.isArray(data.frames)) {
    throw new Error('Invalid .wd file: No frames detected.');
  }

  const frames = data.frames;
  const fps = data.fps || 15;
  const delay = 1000 / fps;
  let currentFrame = 0;

  // Hide cursor
  process.stdout.write('\x1B[?25l');

  // Clear terminal
  process.stdout.write('\x1B[2J\x1B[H');

  console.log(`\x1b[1;32m[SYSTEM_UPLINK]\x1b[0m Rendering ${filePath} (${frames.length} frames @ ${fps} FPS)`);
  
  // Wait a bit before starting
  setTimeout(() => {
    const interval = setInterval(() => {
      // Move cursor to top-left
      process.stdout.write('\x1B[H');
      
      // Render frame
      process.stdout.write(frames[currentFrame]);

      // Progress bar info
      const progress = Math.floor(((currentFrame + 1) / frames.length) * 100);
      process.stdout.write(`\n\x1b[1;30mFRAME: ${currentFrame + 1}/${frames.length} [${progress}%] | CTRL+C to Abort\x1b[0m\n`);

      currentFrame++;

      if (currentFrame >= frames.length) {
        currentFrame = 0; // Loop back to start
      }
    }, delay);

    // Handle Exit
    process.on('SIGINT', () => {
      clearInterval(interval);
      process.stdout.write('\x1B[?25h\n\n\x1b[1;31m[UPLINK_ABORTED]\x1b[0m\n');
      process.exit(0);
    });
  }, 1000);

} catch (err) {
  console.error(`\x1b[1;31m[CRITICAL_FAILURE]\x1b[0m ${err.message}`);
  process.exit(1);
}
