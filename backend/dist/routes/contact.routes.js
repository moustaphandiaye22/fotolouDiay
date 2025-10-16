"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contact_controller_1 = require("../controllers/contact.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Routes publiques
router.post('/', contact_controller_1.ContactController.createContactMessage);
// Routes protégées (admin/modérateur uniquement)
router.get('/', auth_middleware_1.verifierToken, contact_controller_1.ContactController.getContactMessages);
router.get('/stats', auth_middleware_1.verifierToken, contact_controller_1.ContactController.getContactStats);
router.put('/:id/process', auth_middleware_1.verifierToken, contact_controller_1.ContactController.markAsProcessed);
router.put('/:id/ignore', auth_middleware_1.verifierToken, contact_controller_1.ContactController.markAsIgnored);
exports.default = router;
