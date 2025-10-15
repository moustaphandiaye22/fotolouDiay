"use strict";
// Enums pour le système de paiement FotoLouJay
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatutTransaction = exports.TypeTransaction = exports.StatutPaiement = exports.PrestatairePaiement = void 0;
var PrestatairePaiement;
(function (PrestatairePaiement) {
    PrestatairePaiement["WAVE"] = "WAVE";
    PrestatairePaiement["ORANGE_MONEY"] = "ORANGE_MONEY";
    PrestatairePaiement["PAYTECH"] = "PAYTECH";
    PrestatairePaiement["CARTE"] = "CARTE";
})(PrestatairePaiement || (exports.PrestatairePaiement = PrestatairePaiement = {}));
var StatutPaiement;
(function (StatutPaiement) {
    StatutPaiement["EN_ATTENTE"] = "EN_ATTENTE";
    StatutPaiement["CONFIRME"] = "CONFIRME";
    StatutPaiement["ANNULE"] = "ANNULE";
    StatutPaiement["ECHEC"] = "ECHEC";
    StatutPaiement["EXPIRE"] = "EXPIRE"; // Paiement expiré
})(StatutPaiement || (exports.StatutPaiement = StatutPaiement = {}));
var TypeTransaction;
(function (TypeTransaction) {
    TypeTransaction["DEBIT"] = "DEBIT";
    TypeTransaction["CREDIT"] = "CREDIT";
    TypeTransaction["REMBOURSEMENT"] = "REMBOURSEMENT"; // Remboursement
})(TypeTransaction || (exports.TypeTransaction = TypeTransaction = {}));
var StatutTransaction;
(function (StatutTransaction) {
    StatutTransaction["EN_ATTENTE"] = "EN_ATTENTE";
    StatutTransaction["SUCCES"] = "SUCCES";
    StatutTransaction["ECHEC"] = "ECHEC";
    StatutTransaction["ANNULE"] = "ANNULE"; // Transaction annulée
})(StatutTransaction || (exports.StatutTransaction = StatutTransaction = {}));
