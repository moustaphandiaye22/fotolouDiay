import { Router } from 'express';
import { verifierToken, verifierRole } from '../middlewares/auth.middleware';
import { RoleUtilisateur } from '../enums/message';
import { ControleurNotification } from '../controllers/notification.controller';

export const routesNotification = Router();

routesNotification.get('/', verifierToken, ControleurNotification.obtenirNotifications);

routesNotification.post(
  '/',
  verifierToken,
  verifierRole(RoleUtilisateur.MODERATEUR, RoleUtilisateur.ADMINISTRATEUR),
  ControleurNotification.creerNotification
);

routesNotification.get('/non-lus/count', verifierToken, ControleurNotification.obtenirNombreNonLues);

routesNotification.put('/:id/lire', verifierToken, ControleurNotification.marquerCommeLue);

routesNotification.delete('/:id', verifierToken, ControleurNotification.supprimerNotification);