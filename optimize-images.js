const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');
const imagesToOptimize = [
  'mainIcon.png',
  'mainsplash.png',
  'adaptive-icon.png'
];

async function optimizeImage(filename) {
  const inputPath = path.join(assetsDir, filename);
  const outputPath = path.join(assetsDir, `optimized-${filename}`);
  
  console.log(`Optimizing ${filename}...`);
  
  try {
    // Create optimized version
    await sharp(inputPath)
      .resize(1024, 1024) // Ensure it's 1024x1024
      .png({ 
        quality: 80,
        compressionLevel: 9, // Maximum compression
        adaptiveFiltering: true,
        palette: true // Use palette-based quantization for smaller file size
      })
      .toFile(outputPath);
    
    // Get file sizes
    const originalSize = fs.statSync(inputPath).size;
    const optimizedSize = fs.statSync(outputPath).size;
    const savingsPercent = ((originalSize - optimizedSize) / originalSize * 100).toFixed(2);
    
    console.log(`${filename}: ${(originalSize/1024/1024).toFixed(2)}MB → ${(optimizedSize/1024/1024).toFixed(2)}MB (${savingsPercent}% savings)`);
    
    // Replace original with optimized version
    fs.renameSync(outputPath, inputPath);
    console.log(`Replaced ${filename} with optimized version`);
  } catch (error) {
    console.error(`Error optimizing ${filename}:`, error);
  }
}

async function main() {
  // Install sharp if not installed
  if (!fs.existsSync(path.join(__dirname, 'node_modules', 'sharp'))) {
    console.log('Sharp package not found. Installing...');
    console.log('This may take a moment...');
    require('child_process').execSync('npm install sharp --save-dev', { stdio: 'inherit' });
  }
  
  console.log('Starting image optimization...');
  
  // Process each image
  for (const image of imagesToOptimize) {
    if (fs.existsSync(path.join(assetsDir, image))) {
      await optimizeImage(image);
    } else {
      console.log(`${image} not found in assets directory, skipping`);
    }
  }
  
  console.log('Image optimization complete!');
}

main().catch(err => {
  console.error('Error in optimization process:', err);
  process.exit(1);
});

