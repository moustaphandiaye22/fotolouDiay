import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ProduitService } from '../services/produit';
import { Product, StatutProduit } from '../models';

@Component({
  selector: 'app-moderation',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTabsModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './moderation.html',
  styleUrl: './moderation.css'
})
export class Moderation implements OnInit {
  produitsEnAttente: Product[] = [];
  produitsValides: Product[] = [];
  produitsRejetes: Product[] = [];
  allProduits: Product[] = [];

  isLoading = false;
  errorMessage = '';

  selectedTab = 0;

  constructor(
    private produitService: ProduitService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadAllProduits();
  }

  loadAllProduits() {
    this.isLoading = true;
    this.errorMessage = '';

    this.produitService.getProduits().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.allProduits = response.data || [];
          this.categorizeProduits();
        } else {
          this.errorMessage = response.message || 'Erreur lors du chargement des produits';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Erreur lors du chargement des produits';
      }
    });
  }

  categorizeProduits() {
    this.produitsEnAttente = this.allProduits.filter(p => p.statut === StatutProduit.EN_ATTENTE);
    this.produitsValides = this.allProduits.filter(p => p.statut === StatutProduit.VALIDE);
    this.produitsRejetes = this.allProduits.filter(p => p.statut === StatutProduit.REJETE);
  }

  viewProduit(produit: Product) {
    this.router.navigate(['/produits', produit.id]);
  }

  validerProduit(produit: Product) {
    if (confirm(`Êtes-vous sûr de vouloir valider le produit "${produit.titre}" ?`)) {
      this.produitService.validerProduit(produit.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.showSuccess('Produit validé avec succès');
            this.loadAllProduits(); // Refresh the list
          } else {
            this.showError('Erreur lors de la validation du produit');
          }
        },
        error: (error) => {
          this.showError('Erreur lors de la validation du produit');
        }
      });
    }
  }

  rejeterProduit(produit: Product) {
    const raison = prompt('Veuillez indiquer la raison du rejet (optionnel):');
    if (confirm(`Êtes-vous sûr de vouloir rejeter le produit "${produit.titre}" ?`)) {
      this.produitService.rejeterProduit(produit.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.showSuccess('Produit rejeté');
            this.loadAllProduits(); // Refresh the list
          } else {
            this.showError('Erreur lors du rejet du produit');
          }
        },
        error: (error) => {
          this.showError('Erreur lors du rejet du produit');
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

  getStatutColor(statut: StatutProduit): string {
    switch (statut) {
      case StatutProduit.VALIDE: return 'primary';
      case StatutProduit.EN_ATTENTE: return 'accent';
      case StatutProduit.REJETE: return 'warn';
      case StatutProduit.EXPIRE: return 'warn';
      default: return 'basic';
    }
  }

  getStatutLabel(statut: StatutProduit): string {
    switch (statut) {
      case StatutProduit.EN_ATTENTE: return 'En attente';
      case StatutProduit.VALIDE: return 'Validé';
      case StatutProduit.REJETE: return 'Rejeté';
      case StatutProduit.EXPIRE: return 'Expiré';
      default: return statut;
    }
  }

  getTabCount(tabIndex: number): number {
    switch (tabIndex) {
      case 0: return this.produitsEnAttente.length;
      case 1: return this.produitsValides.length;
      case 2: return this.produitsRejetes.length;
      default: return 0;
    }
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}