import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ProduitService } from '../../services/produit';
import { AuthService } from '../../services/auth';
import { Product, RoleUtilisateur } from '../../models';

@Component({
  selector: 'app-detail',
  imports: [
    CommonModule,
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private produitService: ProduitService,
    private authService: AuthService,
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
}