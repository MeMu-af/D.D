const express = require('express');
const router = express.Router();
const { cleanupTestImages } = require('../test/image-cleanup');

// Manual cleanup endpoint
router.post('/cleanup-test-images', async (req, res) => {
    const result = await cleanupTestImages();
    res.json(result);
});

// Schedule automatic cleanup (runs every 6 hours)
setInterval(async () => {
    console.log('Running scheduled test image cleanup...');
    const result = await cleanupTestImages();
    console.log('Scheduled cleanup result:', result);
}, 6 * 60 * 60 * 1000);

module.exports = router; 