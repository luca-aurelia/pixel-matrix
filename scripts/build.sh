# Clean out the dist folder.
rm -r dist

# Compile to UMD.
babel source/PixelMatrix.js --out-file dist/PixelMatrix.umd.js

# Copy the ES2015 module into the dist folder.
cp source/PixelMatrix.js dist/PixelMatrix.module.js