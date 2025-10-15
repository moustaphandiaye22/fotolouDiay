"use strict";
// Middleware d'authentification pour FotoLouJay
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifierProprieteProduit = exports.authentificationOptionnelle = exports.verifierRole = exports.verifierToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const message_1 = require("../enums/message");
const prisma = new client_1.PrismaClient();
/**
 * Middleware de vérification du token JWT
 */
const verifierToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Récupération du token depuis l'en-tête Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: message_1.MESSAGES_ERREUR.TOKEN_INVALIDE
            });
        }
        const token = authHeader.substring(7); // Supprimer "Bearer "
        // Vérification et décodage du token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Vérification de l'existence de l'utilisateur
        const utilisateur = yield prisma.utilisateur.findUnique({
            where: {
                id: decoded.utilisateurId,
                estActif: true
            },
            select: {
                id: true,
                email: true,
                role: true,
                estActif: true
            }
        });
        if (!utilisateur) {
            return res.status(401).json({
                success: false,
                message: message_1.MESSAGES_ERREUR.UTILISATEUR_NON_TROUVE
            });
        }
        // Ajout des informations utilisateur à la requête
        req.utilisateur = {
            id: utilisateur.id,
            email: utilisateur.email,
            role: utilisateur.role
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({
                success: false,
                message: message_1.MESSAGES_ERREUR.TOKEN_EXPIRE
            });
        }
        return res.status(401).json({
            success: false,
            message: message_1.MESSAGES_ERREUR.TOKEN_INVALIDE
        });
    }
});
exports.verifierToken = verifierToken;
/**
 * Middleware de vérification des rôles
 */
const verifierRole = (...rolesAutorises) => {
    return (req, res, next) => {
        if (!req.utilisateur) {
            return res.status(401).json({
                success: false,
                message: message_1.MESSAGES_ERREUR.TOKEN_INVALIDE
            });
        }
        if (!rolesAutorises.includes(req.utilisateur.role)) {
            return res.status(403).json({
                success: false,
                message: message_1.MESSAGES_ERREUR.ACCES_REFUSE
            });
        }
        next();
    };
};
exports.verifierRole = verifierRole;
/**
 * Middleware optionnel d'authentification (pour les routes publiques avec fonctionnalités supplémentaires pour les utilisateurs connectés)
 */
const authentificationOptionnelle = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(); // Pas de token, mais on continue
        }
        const token = authHeader.substring(7);
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const utilisateur = yield prisma.utilisateur.findUnique({
            where: {
                id: decoded.utilisateurId,
                estActif: true
            },
            select: {
                id: true,
                email: true,
                role: true
            }
        });
        if (utilisateur) {
            req.utilisateur = {
                id: utilisateur.id,
                email: utilisateur.email,
                role: utilisateur.role
            };
        }
        next();
    }
    catch (error) {
        // En cas d'erreur, on continue sans utilisateur connecté
        next();
    }
});
exports.authentificationOptionnelle = authentificationOptionnelle;
/**
 * Middleware de vérification de propriété d'un produit
 */
const verifierProprieteProduit = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const produitId = parseInt(req.params.id);
        const utilisateurId = (_a = req.utilisateur) === null || _a === void 0 ? void 0 : _a.id;
        if (!utilisateurId) {
            return res.status(401).json({
                success: false,
                message: message_1.MESSAGES_ERREUR.TOKEN_INVALIDE
            });
        }
        // Les modérateurs et administrateurs peuvent modifier tous les produits
        if (((_b = req.utilisateur) === null || _b === void 0 ? void 0 : _b.role) === message_1.RoleUtilisateur.MODERATEUR ||
            ((_c = req.utilisateur) === null || _c === void 0 ? void 0 : _c.role) === message_1.RoleUtilisateur.ADMINISTRATEUR) {
            return next();
        }
        // Vérification de la propriété pour les utilisateurs normaux
        const produit = yield prisma.produit.findUnique({
            where: { id: produitId },
            select: { utilisateurId: true }
        });
        if (!produit) {
            return res.status(404).json({
                success: false,
                message: message_1.MESSAGES_ERREUR.PRODUIT_NON_TROUVE
            });
        }
        if (produit.utilisateurId !== utilisateurId) {
            return res.status(403).json({
                success: false,
                message: message_1.MESSAGES_ERREUR.PRODUIT_NON_AUTORISE
            });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
        });
    }
});
exports.verifierProprieteProduit = verifierProprieteProduit;
