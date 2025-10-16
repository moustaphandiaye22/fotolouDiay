import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { ProduitService } from '../../services/produit';
import { AuthService } from '../../services/auth';
import { ContactService } from '../../services/contact';
import { Product, RoleUtilisateur, PaymentProvider, PaymentInitiationRequest } from '../../models';
import { ContactMessage } from '../../models/contact.model';
import { PaymentDialog } from './payment-dialog';

@Component({
  selector: 'app-detail',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDialogModule
  ],
  templateUrl: './detail.html',
  styleUrl: './detail.css'
})
export class Detail implements OnInit {
  produit: Product | null = null;
  isLoading = false;
  errorMessage = '';
  currentUser: any = null;
  isOwner = false;
  canModerate = false;
  isProcessingPayment = false;
  paymentError = '';

  // Propriétés pour le dialog de contact
  showContactDialog = false;
  contactMessage: ContactMessage = {
    nom: '',
    email: '',
    telephone: '',
    sujet: 'INFORMATION',
    message: '',
    statut: 'EN_ATTENTE' as any
  };
  isSendingMessage = false;
  contactErrorMessage = '';
  contactSuccessMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private produitService: ProduitService,
    private authService: AuthService,
    private contactService: ContactService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduit(+id);
    }
    this.loadCurrentUser();
  }

  loadProduit(id: number) {
    this.isLoading = true;
    this.errorMessage = '';

    this.produitService.getProduit(id).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.produit = response.data.produit || response.data;
          this.checkPermissions();
        } else {
          this.errorMessage = response.message || 'Erreur lors du chargement du produit';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Erreur lors du chargement du produit';
      }
    });
  }

  loadCurrentUser() {
    if (this.authService.isLoggedIn()) {
      this.authService.getProfile().subscribe({
        next: (response) => {
          if (response.success) {
            this.currentUser = response.data;
            this.checkPermissions();
          }
        },
        error: (error) => {
          console.error('Erreur lors du chargement du profil:', error);
        }
      });
    }
  }

  checkPermissions() {
    if (this.produit && this.currentUser) {
      this.isOwner = this.produit.utilisateurId === this.currentUser.id;
      this.canModerate = this.currentUser.role === RoleUtilisateur.MODERATEUR ||
                        this.currentUser.role === RoleUtilisateur.ADMINISTRATEUR;
    }
  }

  editProduit() {
    if (this.produit) {
      this.router.navigate(['/produits', this.produit.id, 'edit']);
    }
  }

  deleteProduit() {
    if (this.produit && confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      this.produitService.deleteProduit(this.produit.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/produits']);
          }
        },
        error: (error) => {
          alert('Erreur lors de la suppression du produit');
        }
      });
    }
  }

  validerProduit() {
    if (this.produit && confirm('Êtes-vous sûr de vouloir valider ce produit ?')) {
      this.produitService.validerProduit(this.produit.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadProduit(this.produit!.id);
          }
        },
        error: (error) => {
          alert('Erreur lors de la validation du produit');
        }
      });
    }
  }

  rejeterProduit() {
    if (this.produit && confirm('Êtes-vous sûr de vouloir rejeter ce produit ?')) {
      this.produitService.rejeterProduit(this.produit.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadProduit(this.produit!.id);
          }
        },
        error: (error) => {
          alert('Erreur lors du rejet du produit');
        }
      });
    }
  }

  acheterProduit() {
    if (!this.produit || this.isProcessingPayment) {
      return;
    }

    this.paymentError = '';

    const dialogRef = this.dialog.open(PaymentDialog, {
      data: { produit: this.produit }
    });

    dialogRef.afterClosed().subscribe((provider?: PaymentProvider) => {
      if (provider) {
        this.initierPaiement(provider);
      }
    });
  }

  private initierPaiement(provider: PaymentProvider) {
    if (!this.produit) {
      return;
    }

    this.isProcessingPayment = true;
    this.paymentError = '';

    const request: PaymentInitiationRequest = {
      produitId: this.produit.id,
      montant: this.produit.prix,
      prestataire: provider,
      callbackUrl: `${window.location.origin}/paiements/callback`
    };

    this.produitService.initierPaiement(request).subscribe({
      next: (response) => {
        this.isProcessingPayment = false;

        if (response.success && response.redirectUrl) {
          window.location.href = response.redirectUrl;
          return;
        }

        if (response.success && response.paymentReference) {
          this.paymentError = 'Paiement initié. Veuillez suivre les instructions reçues.';
          return;
        }

        this.paymentError = response.message || "Impossible d'initialiser le paiement.";
      },
      error: (error) => {
        this.isProcessingPayment = false;
        this.paymentError = error.error?.message || "Erreur lors de l'initialisation du paiement.";
      }
    });
  }

  formatPrix(prix: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(prix);
  }

  getStatutColor(statut: string): string {
    switch (statut) {
      case 'VALIDE': return 'primary';
      case 'EN_ATTENTE': return 'accent';
      case 'REJETE': return 'warn';
      case 'EXPIRE': return 'warn';
      default: return 'basic';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'VALIDE': return 'Validé';
      case 'EN_ATTENTE': return 'En attente';
      case 'REJETE': return 'Rejeté';
      case 'EXPIRE': return 'Expiré';
      default: return statut;
    }
  }

  goBackToProducts() {
    this.router.navigate(['/produits']);
  }

  callUser(telephone?: string) {
    if (telephone) {
      window.location.href = `tel:${telephone}`;
    }
  }

  whatsappUser(telephone?: string, titre?: string) {
    if (telephone) {
      const message = titre ? `Bonjour, je suis intéressé par votre produit: ${titre}` : 'Bonjour, je suis intéressé par votre produit';
      const whatsappUrl = `https://wa.me/${telephone.replace(/\s+/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  }

  messageUser(produit: Product) {
    // Pour l'instant, ouvrir WhatsApp avec un message personnalisé
    // Plus tard, on pourra implémenter un système de messagerie interne
    this.whatsappUser(produit.utilisateur?.telephone, produit.titre);
  }

  sendContactMessage() {
    if (!this.produit) {
      return;
    }

    if (!this.contactMessage.nom || !this.contactMessage.email || !this.contactMessage.message) {
      this.contactErrorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.contactMessage.email)) {
      this.contactErrorMessage = 'Format d\'email invalide.';
      return;
    }

    this.isSendingMessage = true;
    this.contactErrorMessage = '';
    this.contactSuccessMessage = '';

    // Préparer le message avec les informations du produit
    const messageComplet = `${this.contactMessage.message}\n\n---\nProduit: ${this.produit.titre}\nPrix: ${this.formatPrix(this.produit.prix)}\nVendeur: ${this.produit.utilisateur?.nom} ${this.produit.utilisateur?.prenom}`;

    const contactData = {
      ...this.contactMessage,
      message: messageComplet,
      produitId: this.produit.id,
      vendeurId: this.produit.utilisateurId
    };

    this.contactService.sendContactMessage(contactData).subscribe({
      next: (response) => {
        this.isSendingMessage = false;
        this.contactSuccessMessage = 'Votre message a été envoyé avec succès. Le vendeur vous répondra bientôt.';
        this.resetContactForm();
      },
      error: (error) => {
        this.isSendingMessage = false;
        this.contactErrorMessage = error.error?.message || 'Une erreur est survenue lors de l\'envoi du message.';
      }
    });
  }

  resetContactForm() {
    this.contactMessage = {
      nom: '',
      email: '',
      telephone: '',
      sujet: 'INFORMATION',
      message: '',
      statut: 'EN_ATTENTE' as any
    };
  }
}
