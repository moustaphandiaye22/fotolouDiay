import { Router } from 'express';
import { ContactController } from '../controllers/contact.controller';
import { verifierToken } from '../middlewares/auth.middleware';

const router = Router();

// Routes publiques
router.post('/', ContactController.createContactMessage);

// Routes protégées (admin/modérateur uniquement)
router.get('/', verifierToken, ContactController.getContactMessages);
router.get('/stats', verifierToken, ContactController.getContactStats);
router.put('/:id/process', verifierToken, ContactController.markAsProcessed);
router.put('/:id/ignore', verifierToken, ContactController.markAsIgnored);

export default router;