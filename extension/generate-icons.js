// Simple icon generator for Chrome Extension
// Run this in Node.js with Canvas installed: npm install canvas

const fs = require('fs');
const path = require('path');

// Create SVG icon as base64 data URL
function createIconSVG(size) {
    const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#gradient)"/>
        <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#3b82f6"/>
                <stop offset="100%" style="stop-color:#8b5cf6"/>
            </linearGradient>
        </defs>
        <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" 
              fill="white" stroke="white" stroke-width="0.5"/>
    </svg>`;
    
    return svg;
}

// Create placeholder icon files (you'll need to convert these to PNG)
const sizes = [16, 32, 48, 128];
const iconsDir = path.join(__dirname, 'icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir);
}

console.log('Icon files created as SVG. Convert to PNG using:');
console.log('1. Online converter like https://convertio.co/svg-png/');
console.log('2. CLI tool: rsvg-convert');
console.log('3. Figma or Adobe Illustrator');

sizes.forEach(size => {
    const svg = createIconSVG(size);
    fs.writeFileSync(path.join(iconsDir, `icon${size}.svg`), svg.trim());
    console.log(`Created icon${size}.svg`);
});

console.log('\nNext steps:');
console.log('1. Convert SVG files to PNG');
console.log('2. Update manifest.json if needed');
console.log('3. Test extension in Chrome developer mode');
console.log('4. Submit to Chrome Web Store');
