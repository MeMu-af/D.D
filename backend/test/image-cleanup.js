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

// Export for use in test suite
module.exports = {
    cleanupTestImages,
    isTestImage,
    getFileAgeHours
}; 