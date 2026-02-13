import { Router } from 'express';
import { getJobs, createJob, getJobById } from '../controllers/jobController';

const router = Router();

router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/', createJob);

export default router;
