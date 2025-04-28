const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const unlink = promisify(fs.unlink);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Fix path resolution to point to the correct uploads/images directory
const UPLOADS_PATH = path.resolve(process.cwd(), 'uploads/images');
const MAX_AGE_HOURS = 24; // Images older than 24 hours will be deleted

// Helper function to check if file is a test image
const isTestImage = (filename) => {
    return filename.includes('test-image.jpg');
};

// Helper function to get file age in hours
const getFileAgeHours = async (filePath) => {
    const stats = await stat(filePath);
    const now = new Date();
    const fileDate = stats.mtime;
    const diffMs = now - fileDate;
    return diffMs / (1000 * 60 * 60); // Convert to hours
};

// Cleanup function
const cleanupTestImages = async () => {
    try {
        console.log('Starting image cleanup...');
        console.log('Looking in directory:', UPLOADS_PATH);
        
        const files = await readdir(UPLOADS_PATH);
        console.log('Found files:', files);
        
        let deletedCount = 0;
        let errorCount = 0;

        for (const file of files) {
            if (isTestImage(file)) {
                const filePath = path.join(UPLOADS_PATH, file);
                console.log('Deleting test image:', filePath);
                
                try {
                    await unlink(filePath);
                    console.log(`Deleted test image: ${file}`);
                    deletedCount++;
                } catch (err) {
                    console.error(`Error deleting ${file}:`, err);
                    errorCount++;
                }
            }
        }

        const result = {
            success: true,
            deletedCount,
            errorCount,
            message: `Cleanup completed. Deleted ${deletedCount} files, ${errorCount} errors.`
        };
        console.log('Cleanup result:', result);
        return result;
    } catch (err) {
        console.error('Cleanup error:', err);
        return {
            success: false,
            error: err.message
        };
    }
};

// Function to create a test image if it doesn't exist
function createTestImage() {
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    
    // Only create if it doesn't exist or is empty
    if (!fs.existsSync(testImagePath) || fs.statSync(testImagePath).size === 0) {
        // Create a simple 1x1 pixel JPEG
        const jpegHeader = Buffer.from([
            0xFF, 0xD8, // SOI marker
            0xFF, 0xE0, // APP0 marker
            0x00, 0x10, // Length of APP0 segment
            0x4A, 0x46, 0x49, 0x46, 0x00, // "JFIF" marker
            0x01, 0x01, // Version
            0x00, // Units
            0x00, 0x01, // X density
            0x00, 0x01, // Y density
            0x00, 0x00, // Thumbnail
            0xFF, 0xDB, // DQT marker
            0x00, 0x43, // Length
            0x00, // Table ID
            // Basic quantization table
            0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07,
            0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C, 0x14,
            0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12, 0x13,
            0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A,
            0x1C, 0x1C, 0x20, 0x24, 0x2E, 0x27, 0x20, 0x22,
            0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29, 0x2C,
            0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39,
            0x3D, 0x38, 0x32, 0x3C, 0x2E, 0x33, 0x34, 0x32,
            0xFF, 0xC0, // SOF marker
            0x00, 0x0B, // Length
            0x08, // Precision
            0x00, 0x01, // Height
            0x00, 0x01, // Width
            0x01, // Number of components
            0x01, 0x11, 0x00, // Component 1
            0xFF, 0xC4, // DHT marker
            0x00, 0x1F, // Length
            0x00, // Table class and ID
            0x00, 0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01,
            0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
            0x08, 0x09, 0x0A, 0x0B,
            0xFF, 0xDA, // SOS marker
            0x00, 0x08, // Length
            0x01, // Number of components
            0x01, 0x00, // Component 1
            0x00, 0x3F, 0x00, // Spectral selection
            0xFF, 0xD9 // EOI marker
        ]);

        fs.writeFileSync(testImagePath, jpegHeader);
        console.log('Created test image:', testImagePath);
    }
}

// Export for use in test suite
module.exports = {
    cleanupTestImages,
    isTestImage,
    getFileAgeHours,
    createTestImage
}; 