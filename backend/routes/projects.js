const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const projectController = require('../controllers/projectController');
const { authenticate, authorize, isProjectMember } = require('../middleware/auth');

router.use(authenticate);

router.get('/', projectController.getProjects);
router.post('/', [
  body('name').trim().notEmpty().withMessage('Project name is required'),
], projectController.createProject);

router.get('/:id', isProjectMember, projectController.getProject);
router.put('/:id', isProjectMember, projectController.updateProject);
router.delete('/:id', authorize('Admin', 'Manager'), projectController.deleteProject);

router.post('/:id/members', authorize('Admin', 'Manager'), projectController.addMember);
router.delete('/:id/members/:userId', authorize('Admin', 'Manager'), projectController.removeMember);

module.exports = router;
