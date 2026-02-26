import express from 'express';
import {
  getAllProjects,
  getAllProjectsWithInactive,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  updateProjectsOrder,
  toggleProjectActive,
  toggleProjectFavorite,
  updateProjectTags
} from '../controllers/projectsController.js';

const router = express.Router();

router.get('/all-including-inactive', getAllProjectsWithInactive);
router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/order', updateProjectsOrder);
router.patch('/:id/toggle', toggleProjectActive);
router.patch('/:id/favorite', toggleProjectFavorite);
router.patch('/:id/tags', updateProjectTags);

export default router;
