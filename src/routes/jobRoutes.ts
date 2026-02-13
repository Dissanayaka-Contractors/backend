import { Router } from 'express';
import { getJobs, createJob, getJobById, deleteJob } from '../controllers/jobController';

const router = Router();

router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/', createJob);
router.delete('/:id', deleteJob);

export default router;
