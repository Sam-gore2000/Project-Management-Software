const express = require('express');
const router = express.Router();
const uc = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/', uc.getUsers);
router.post('/', authorize('Admin','Manager'), uc.createUser);
router.put('/:id', authorize('Admin','Manager'), uc.updateUser);
router.delete('/:id', authorize('Admin'), uc.deleteUser);

module.exports = router;
