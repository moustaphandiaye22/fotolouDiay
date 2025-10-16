import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
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
    MatTooltipModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './list.html',
  styleUrl: './list.css'
})
export class List implements OnInit {
  produits: any[] = [];
  filteredProduits: any[] = [];
  isLoading = false;
  errorMessage = '';
  viewMode: 'grid' | 'list' = 'grid';
  searchQuery = '';

  // Pagination properties
  currentPage = 1;
  pageSize = 20;
  totalItems = 0;
  totalPages = 0;

  constructor(
    private produitService: ProduitService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProduits();
  }

  onSearchInput(event: any) {
    this.searchQuery = event.target.value;
    this.filterProduits();
  }

  clearSearch() {
    this.searchQuery = '';
    this.filteredProduits = [...this.produits];
  }

  private filterProduits() {
    if (!this.searchQuery.trim()) {
      this.filteredProduits = [...this.produits];
      return;
    }

    const query = this.searchQuery.toLowerCase().trim();
    this.filteredProduits = this.produits.filter(produit =>
      produit.titre?.toLowerCase().includes(query) ||
      produit.description?.toLowerCase().includes(query) ||
      produit.localisation?.toLowerCase().includes(query) ||
      produit.categorie?.toLowerCase().includes(query)
    );
  }

  loadProduits() {
    this.isLoading = true;
    this.errorMessage = '';

    // Load user's own products with pagination
    this.produitService.getMesProduits(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Mes produits response:', response);
        if (response.success) {
          this.produits = response.data?.produits || response.data || [];
          this.filteredProduits = [...this.produits];
          this.totalItems = response.data?.pagination?.total || this.produits.length;
          this.totalPages = response.data?.pagination?.totalPages || Math.ceil(this.produits.length / this.pageSize);
          console.log('Pagination info:', {
            totalItems: this.totalItems,
            totalPages: this.totalPages,
            currentPage: this.currentPage,
            pageSize: this.pageSize
          });
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

  toggleViewMode() {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    // Only reload if not searching (search is client-side)
    if (!this.searchQuery) {
      this.loadProduits();
    }
  }

  callUser(phoneNumber?: string) {
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, '_self');
    }
  }

  whatsappUser(phoneNumber?: string, productTitle?: string) {
    if (phoneNumber) {
      const message = `Bonjour, je suis intéressé par votre produit: ${productTitle}`;
      const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\s+/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  }

  messageUser(produit: any) {
    // TODO: Implement messaging functionality
    console.log('Message user for product:', produit);
    // This could open a chat dialog or navigate to a messaging page
  }
}
