import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTabsModule } from '@angular/material/tabs';
import { MatGridListModule } from '@angular/material/grid-list';
import { RouterModule, Router } from '@angular/router';
import { ProduitService } from '../services/produit';
import { AuthService } from '../services/auth';
import { Product, ProductStats, RoleUtilisateur, User } from '../models';

@Component({
  selector: 'app-vendor-dashboard',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTableModule,
    MatPaginatorModule,
    MatTabsModule,
    MatGridListModule,
    RouterModule
  ],
  templateUrl: './vendor-dashboard.html',
  styleUrl: './vendor-dashboard.css'
})
export class VendorDashboard implements OnInit {
  stats: ProductStats | null = null;
  myProducts: Product[] = [];
  isLoading = false;
  errorMessage = '';
  currentUser: any = null;

  // Pagination properties
  totalProducts = 0;
  pageSize = 10;
  currentPage = 1;

  // Table columns
  displayedColumns: string[] = ['titre', 'statut', 'prix', 'vues', 'dateCreation', 'actions'];

  constructor(
    private produitService: ProduitService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.loadMyStats();
    this.loadMyProducts();
  }

  loadCurrentUser() {
    if (this.authService.isLoggedIn()) {
      this.currentUser = this.authService.getCurrentUser();
    }
  }

  loadMyStats() {
    this.isLoading = true;
    this.produitService.getStatistiques().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.stats = response.data.statistiques;
        } else {
          this.errorMessage = response.message || 'Erreur lors du chargement des statistiques';
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Erreur lors du chargement des statistiques';
      }
    });
  }

  loadMyProducts() {
    this.produitService.getMesProduits().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.myProducts = response.data?.produits || [];
          this.totalProducts = response.data?.total || this.myProducts.length;
        }
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement de mes produits:', error);
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

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadMyProducts();
  }

  isVendor(): boolean {
    return this.currentUser?.role === RoleUtilisateur.VENDEUR;
  }

  editProduct(product: Product) {
    // Navigate to edit product page
    this.router.navigate(['/produits/edit', product.id]);
  }

  deleteProduct(product: Product) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      this.produitService.deleteProduit(product.id).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.loadMyStats();
            this.loadMyProducts();
          }
        },
        error: (error: any) => {
          alert('Erreur lors de la suppression du produit');
        }
      });
    }
  }
}