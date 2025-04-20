const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/multerConfig');

router.post('/', authMiddleware, upload.single('media'), postController.createPost);

module.exports = router;