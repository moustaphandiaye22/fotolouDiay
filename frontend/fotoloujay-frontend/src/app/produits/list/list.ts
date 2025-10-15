import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule, Router } from '@angular/router';
import { ProduitService } from '../../services/produit';

@Component({
  selector: 'app-list',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    RouterModule
  ],
  templateUrl: './list.html',
  styleUrl: './list.css'
})
export class List implements OnInit {
  produits: any[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private produitService: ProduitService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProduits();
  }

  loadProduits() {
    this.isLoading = true;
    this.errorMessage = '';

    // Load user's own products
    this.produitService.getMesProduits().subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Mes produits response:', response);
        if (response.success) {
          this.produits = response.data?.produits || response.data || [];
        } else {
          this.errorMessage = response.message || 'Erreur lors du chargement des produits';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading products:', error);
        this.errorMessage = error.error?.message || 'Erreur lors du chargement des produits';
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

  editProduct(produit: any) {
    this.router.navigate(['/produits', produit.id, 'edit']);
  }

  deleteProduct(produit: any) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      this.produitService.deleteProduit(produit.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadProduits();
          }
        },
        error: (error) => {
          alert('Erreur lors de la suppression du produit');
        }
      });
    }
  }
}
