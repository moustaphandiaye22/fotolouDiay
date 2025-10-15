"use strict";
// Service d'authentification pour FotoLouJay
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
exports.ServiceAuth = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const message_1 = require("../enums/message");
const prisma = new client_1.PrismaClient();
class ServiceAuth {
    /**
     * Inscription d'un nouvel utilisateur
     */
    static inscrire(donnees) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Vérification si l'email existe déjà
                const utilisateurExistant = yield prisma.utilisateur.findUnique({
                    where: { email: donnees.email }
                });
                if (utilisateurExistant) {
                    return {
                        success: false,
                        message: message_1.MESSAGES_ERREUR.EMAIL_DEJA_UTILISE
                    };
                }
                // Hachage du mot de passe
                const motDePasseHache = yield bcryptjs_1.default.hash(donnees.motDePasse, 12);
                // Création de l'utilisateur
                const nouvelUtilisateur = yield prisma.utilisateur.create({
                    data: {
                        nom: donnees.nom,
                        prenom: donnees.prenom,
                        email: donnees.email,
                        telephone: donnees.telephone,
                        motDePasse: motDePasseHache,
                        role: message_1.RoleUtilisateur.UTILISATEUR
                    },
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                        email: true,
                        role: true
                    }
                });
                // Génération du token JWT
                const token = this.genererToken(nouvelUtilisateur.id, nouvelUtilisateur.email, nouvelUtilisateur.role);
                return {
                    success: true,
                    message: message_1.MESSAGES_SUCCES.UTILISATEUR_CREE,
                    data: {
                        utilisateur: {
                            id: nouvelUtilisateur.id,
                            nom: nouvelUtilisateur.nom,
                            prenom: nouvelUtilisateur.prenom || undefined,
                            email: nouvelUtilisateur.email,
                            role: nouvelUtilisateur.role
                        },
                        token
                    }
                };
            }
            catch (error) {
                console.error('Erreur lors de l\'inscription:', error);
                return {
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                };
            }
        });
    }
    /**
     * Connexion d'un utilisateur
     */
    static connecter(donnees) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Recherche de l'utilisateur par email
                const utilisateur = yield prisma.utilisateur.findUnique({
                    where: {
                        email: donnees.email,
                        estActif: true
                    },
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                        email: true,
                        motDePasse: true,
                        role: true
                    }
                });
                if (!utilisateur) {
                    return {
                        success: false,
                        message: message_1.MESSAGES_ERREUR.IDENTIFIANTS_INVALIDES
                    };
                }
                // Vérification du mot de passe
                const motDePasseValide = yield bcryptjs_1.default.compare(donnees.motDePasse, utilisateur.motDePasse);
                if (!motDePasseValide) {
                    return {
                        success: false,
                        message: message_1.MESSAGES_ERREUR.IDENTIFIANTS_INVALIDES
                    };
                }
                // Génération du token JWT
                const token = this.genererToken(utilisateur.id, utilisateur.email, utilisateur.role);
                return {
                    success: true,
                    message: message_1.MESSAGES_SUCCES.UTILISATEUR_CONNECTE,
                    data: {
                        utilisateur: {
                            id: utilisateur.id,
                            nom: utilisateur.nom,
                            prenom: utilisateur.prenom || undefined,
                            email: utilisateur.email,
                            role: utilisateur.role
                        },
                        token
                    }
                };
            }
            catch (error) {
                console.error('Erreur lors de la connexion:', error);
                return {
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                };
            }
        });
    }
    /**
     * Génération d'un token JWT
     */
    static genererToken(utilisateurId, email, role) {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET n\'est pas défini dans les variables d\'environnement');
        }
        const options = {
            expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        };
        return jsonwebtoken_1.default.sign({
            utilisateurId,
            email,
            role
        }, jwtSecret, options);
    }
    /**
     * Vérification d'un token JWT
     */
    static verifierToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
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
                if (!utilisateur) {
                    return { valide: false };
                }
                return {
                    valide: true,
                    utilisateur: {
                        id: utilisateur.id,
                        email: utilisateur.email,
                        role: utilisateur.role
                    }
                };
            }
            catch (error) {
                return { valide: false };
            }
        });
    }
    /**
     * Changement de mot de passe
     */
    static changerMotDePasse(utilisateurId, ancienMotDePasse, nouveauMotDePasse) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const utilisateur = yield prisma.utilisateur.findUnique({
                    where: { id: utilisateurId },
                    select: { motDePasse: true }
                });
                if (!utilisateur) {
                    return {
                        success: false,
                        message: message_1.MESSAGES_ERREUR.UTILISATEUR_NON_TROUVE
                    };
                }
                // Vérification de l'ancien mot de passe
                const ancienMotDePasseValide = yield bcryptjs_1.default.compare(ancienMotDePasse, utilisateur.motDePasse);
                if (!ancienMotDePasseValide) {
                    return {
                        success: false,
                        message: message_1.MESSAGES_ERREUR.IDENTIFIANTS_INVALIDES
                    };
                }
                // Hachage du nouveau mot de passe
                const nouveauMotDePasseHache = yield bcryptjs_1.default.hash(nouveauMotDePasse, 12);
                // Mise à jour du mot de passe
                yield prisma.utilisateur.update({
                    where: { id: utilisateurId },
                    data: { motDePasse: nouveauMotDePasseHache }
                });
                return {
                    success: true,
                    message: 'Mot de passe modifié avec succès'
                };
            }
            catch (error) {
                console.error('Erreur lors du changement de mot de passe:', error);
                return {
                    success: false,
                    message: message_1.MESSAGES_ERREUR.ERREUR_SERVEUR
                };
            }
        });
    }
}
exports.ServiceAuth = ServiceAuth;
