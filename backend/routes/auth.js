import express from 'express';
import { login } from '../controller/auth.js';
import User from '../models/user.js';

const router = express.Router();
router.post('/login', login);

export default router;