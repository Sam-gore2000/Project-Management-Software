const express = require('express');
const router = express.Router({ mergeParams: true });
const chatController = require('../controllers/chatController');
const { authenticate, isProjectMember } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authenticate);
router.use(isProjectMember);

router.get('/', chatController.getMessages);
router.get('/poll', chatController.getNewMessages);
router.post('/', upload.single('file'), chatController.sendMessage);
router.delete('/:id', chatController.deleteMessage);

module.exports = router;
