"use strict";
// Middleware de sécurité pour FotoLouJay
// Validation des photos capturées uniquement
Object.defineProperty(exports, "__esModule", { value: true });
exports.genererTokenSecurite = exports.loggerSecurite = exports.validerSecuritePhotos = void 0;
/**
 * Middleware de validation de sécurité pour les photos
 */
const validerSecuritePhotos = (req, res, next) => {
    try {
        const { sourceType, securityLevel } = req.body;
        const files = req.files;
        const singleFile = req.file;
        console.log('🔒 Validation sécurité photos:', {
            sourceType,
            securityLevel,
            hasFiles: !!files,
            hasSingleFile: !!singleFile,
            body: Object.keys(req.body)
        });
        // Vérification des métadonnées de sécurité
        if (sourceType && sourceType !== 'camera_capture_only') {
            return res.status(400).json({
                success: false,
                message: '🚫 Source de photo non autorisée. Utilisez uniquement l\'appareil photo.',
                code: 'INVALID_SOURCE_TYPE'
            });
        }
        if (securityLevel && securityLevel !== 'authenticated_photos') {
            return res.status(400).json({
                success: false,
                message: '🚫 Niveau de sécurité insuffisant pour les photos.',
                code: 'INVALID_SECURITY_LEVEL'
            });
        }
        // Validation des fichiers uploadés
        const allFiles = [
            ...((files === null || files === void 0 ? void 0 : files.photo) || []),
            ...((files === null || files === void 0 ? void 0 : files.photosSupplementaires) || []),
            ...(singleFile ? [singleFile] : [])
        ];
        if (allFiles.length === 0) {
            return res.status(400).json({
                success: false,
                message: '📸 Au moins une photo capturée est requise.',
                code: 'NO_PHOTO_PROVIDED'
            });
        }
        // Validation de chaque fichier
        for (const file of allFiles) {
            const validation = validerFichierPhoto(file);
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: validation.error,
                    code: 'INVALID_PHOTO_FILE'
                });
            }
        }
        // Ajouter des métadonnées de sécurité à la requête
        req.body.securityValidated = true;
        req.body.validationTimestamp = Date.now();
        req.body.photosCount = allFiles.length;
        console.log('✅ Validation sécurité réussie:', {
            photosCount: allFiles.length,
            sourceType,
            securityLevel
        });
        next();
    }
    catch (error) {
        console.error('❌ Erreur validation sécurité:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la validation de sécurité des photos.',
            code: 'SECURITY_VALIDATION_ERROR'
        });
    }
};
exports.validerSecuritePhotos = validerSecuritePhotos;
/**
 * Valider un fichier photo individuel
 */
function validerFichierPhoto(file) {
    const warnings = [];
    // Vérifier le type MIME
    const typesAutorises = ['image/jpeg', 'image/png'];
    if (!typesAutorises.includes(file.mimetype)) {
        return {
            isValid: false,
            error: `Format ${file.mimetype} non autorisé. Utilisez l'appareil photo (JPEG/PNG uniquement).`,
            warnings
        };
    }
    // Vérifier la taille du fichier
    const tailleMin = 5000; // 5KB
    const tailleMax = 2 * 1024 * 1024; // 2MB
    if (file.size < tailleMin) {
        return {
            isValid: false,
            error: 'Photo trop petite. Utilisez l\'appareil photo pour capturer une vraie photo.',
            warnings
        };
    }
    if (file.size > tailleMax) {
        return {
            isValid: false,
            error: 'Photo trop volumineuse. Les photos capturées ne devraient pas dépasser 2MB.',
            warnings
        };
    }
    // Vérifications heuristiques pour détecter les photos non authentiques
    // Vérifier le nom du fichier (patterns suspects)
    const nomSuspect = /screenshot|capture|image_editor|photoshop|gimp|edited/i.test(file.originalname);
    if (nomSuspect) {
        warnings.push('Nom de fichier suspect détecté');
    }
    // Ratio de compression inhabituel (très haute compression = suspect)
    const ratioCompression = file.size / (file.originalname.length * 100);
    if (ratioCompression < 0.1) {
        warnings.push('Ratio de compression inhabituel');
    }
    // Pour PNG, vérifier si c'est probablement une capture d'écran
    if (file.mimetype === 'image/png') {
        // Les captures d'écran PNG sont souvent plus petites que les vraies photos
        if (file.size < 50000) { // 50KB
            warnings.push('PNG de petite taille (possiblement une capture d\'écran)');
        }
    }
    return {
        isValid: true,
        warnings
    };
}
/**
 * Middleware de logging pour les tentatives de sécurité
 */
const loggerSecurite = (req, res, next) => {
    const originalSend = res.send;
    res.send = function (data) {
        // Logger les échecs de sécurité
        if (res.statusCode >= 400) {
            console.warn('🚨 Tentative de sécurité échouée:', {
                url: req.originalUrl,
                method: req.method,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                statusCode: res.statusCode,
                body: {
                    sourceType: req.body.sourceType,
                    securityLevel: req.body.securityLevel,
                    hasFiles: !!(req.files || req.file)
                }
            });
        }
        return originalSend.call(this, data);
    };
    next();
};
exports.loggerSecurite = loggerSecurite;
/**
 * Générer un token de sécurité pour les photos authentiques
 */
const genererTokenSecurite = (userId, fichiers) => {
    const timestamp = Date.now();
    const filesHash = fichiers.map(f => f.originalname + f.size).join('');
    const random = Math.random().toString(36).substring(2);
    return `fotoljay_${userId}_${timestamp}_${random}_${Buffer.from(filesHash).toString('base64').substring(0, 8)}`;
};
exports.genererTokenSecurite = genererTokenSecurite;
