import { Router } from 'express';
import { registerUser, loginUser, getMe, verifyEmail } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify', verifyEmail);
router.get('/me', protect, getMe);

export default router;
