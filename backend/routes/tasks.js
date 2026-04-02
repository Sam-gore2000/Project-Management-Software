const express = require('express');
const router = express.Router({ mergeParams: true });
const { body } = require('express-validator');
const taskController = require('../controllers/taskController');
const { authenticate, isProjectMember } = require('../middleware/auth');

router.use(authenticate);
router.use(isProjectMember);

router.get('/', taskController.getTasks);
router.post('/', [
  body('title').trim().notEmpty().withMessage('Task title is required'),
], taskController.createTask);

router.get('/:id', taskController.getTask);
router.put('/:id', taskController.updateTask);
router.patch('/:id/status', taskController.updateTaskStatus);
router.delete('/:id', taskController.deleteTask);

router.get('/:taskId/comments', taskController.getComments);
router.post('/:taskId/comments', taskController.addComment);
router.delete('/comments/:id', taskController.deleteComment);

module.exports = router;
