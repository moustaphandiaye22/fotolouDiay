"use strict";
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
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const winston_1 = __importDefault(require("winston"));
// Import des routes
const utilisateur_routes_1 = require("./routes/utilisateur.routes");
const produit_routes_1 = require("./routes/produit.routes");
const notification_routes_1 = require("./routes/notification.routes");
const auth_routes_1 = require("./routes/auth.routes");
const payment_routes_1 = require("./routes/payment.routes");
const contact_routes_1 = __importDefault(require("./routes/contact.routes"));
// Configuration des variables d'environnement
dotenv_1.default.config();
// Configuration du logger
const logger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    defaultMeta: { service: 'fotoloujay-backend' },
    transports: [
        new winston_1.default.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston_1.default.transports.File({ filename: 'logs/combined.log' }),
        new winston_1.default.transports.Console({
            format: winston_1.default.format.simple()
        })
    ]
});
// Initialisation de Prisma
exports.prisma = new client_1.PrismaClient();
// Création de l'application Express
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Configuration des middlewares
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin)
            return callback(null, true);
        const allowedOrigins = [
            'http://localhost:4200',
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:4200',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173',
            'https://fotoloujay-frontend.vercel.app',
            'https://fotoloujay-frontend-git-main.vercel.app'
        ];
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        else {
            console.log('CORS blocked for origin:', origin);
            return callback(new Error('Not allowed by CORS'), false);
        }
    },
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Servir les fichiers statiques (images uploadées)
app.use('/uploads', express_1.default.static('uploads'));
// Middleware de logging des requêtes
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path} - ${req.ip}`);
    next();
});
// Routes de l'API
app.use('/api/auth', auth_routes_1.routesAuth);
app.use('/api/utilisateurs', utilisateur_routes_1.routesUtilisateur);
app.use('/api/produits', produit_routes_1.routesProduit);
app.use('/api/notifications', notification_routes_1.routesNotification);
app.use('/api/paiements', payment_routes_1.routesPaiement);
app.use('/api/contacts', contact_routes_1.default);
// Route de santé
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'FotoLouJay Backend est en cours d\'exécution',
        timestamp: new Date().toISOString()
    });
});
// Middleware de gestion des erreurs 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route non trouvée',
        path: req.originalUrl
    });
});
// Middleware de gestion des erreurs globales
app.use((error, req, res, next) => {
    logger.error('Erreur non gérée:', error);
    res.status(error.status || 500).json(Object.assign({ success: false, message: error.message || 'Erreur interne du serveur' }, (process.env.NODE_ENV === 'development' && { stack: error.stack })));
});
// Démarrage du serveur
const demarrerServeur = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Test de la connexion à la base de données
        yield exports.prisma.$connect();
        logger.info('Connexion à la base de données établie');
        app.listen(PORT, () => {
            logger.info(`🚀 Serveur FotoLouJay démarré sur le port ${PORT}`);
            logger.info(`📡 API disponible sur http://localhost:${PORT}/api`);
        });
    }
    catch (error) {
        logger.error('Erreur lors du démarrage du serveur:', error);
        process.exit(1);
    }
});
// Gestion de l'arrêt propre du serveur
process.on('SIGINT', () => __awaiter(void 0, void 0, void 0, function* () {
    logger.info('Arrêt du serveur en cours...');
    yield exports.prisma.$disconnect();
    process.exit(0);
}));
process.on('SIGTERM', () => __awaiter(void 0, void 0, void 0, function* () {
    logger.info('Arrêt du serveur en cours...');
    yield exports.prisma.$disconnect();
    process.exit(0);
}));
// Démarrage de l'application
demarrerServeur();
exports.default = app;
