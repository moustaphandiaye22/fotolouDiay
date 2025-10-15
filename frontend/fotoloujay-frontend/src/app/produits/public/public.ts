import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { RouterModule } from '@angular/router';
import { ProduitService } from '../../services/produit';
import { Product } from '../../models';

@Component({
  selector: 'app-public',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTooltipModule,
    MatPaginatorModule,
    RouterModule
  ],
  templateUrl: './public.html',
  styleUrl: './public.css'
})
export class Public implements OnInit {
  produits: Product[] = [];
  produitsVips: Product[] = [];
  produitsFiltres: Product[] = [];
  isLoading = false;
  errorMessage = '';
  showVipOnly = false;
  viewMode: 'grid' | 'list' = 'grid';

  searchTerm = '';
  selectedCategorie = '';
  selectedLocalisation = '';
  prixMin: number | null = null;
  prixMax: number | null = null;

  categories: string[] = [];
  localisations: string[] = [];

  // Pagination properties
  currentPage = 1;
  pageSize = 20;
  totalItems = 0;
  totalPages = 0;

  constructor(private produitService: ProduitService) {}

  ngOnInit() {
    this.loadProduitsPublics();
    this.loadProduitsVip();
  }

  loadProduitsPublics() {
    this.isLoading = true;
    this.errorMessage = '';

    this.produitService.getProduitsPublics().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.produits = response.data?.produits || [];
          this.totalItems = response.data?.pagination?.total || 0;
          this.totalPages = response.data?.pagination?.totalPages || 0;
          this.extractFilters();
          this.appliquerFiltres();
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

  loadProduitsVip() {
    this.produitService.getProduitsVip().subscribe({
      next: (response) => {
        if (response.success) {
          this.produitsVips = response.data?.produits || [];
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des produits VIP:', error);
      }
    });
  }

  extractFilters() {
    const categoriesSet = new Set<string>();
    const localisationsSet = new Set<string>();

    this.produits.forEach(produit => {
      if (produit.categorie) categoriesSet.add(produit.categorie);
      if (produit.localisation) localisationsSet.add(produit.localisation);
    });

    this.categories = Array.from(categoriesSet).sort();
    this.localisations = Array.from(localisationsSet).sort();
  }

  appliquerFiltres() {
    let produits = this.showVipOnly ? this.produitsVips : this.produits;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      produits = produits.filter(p =>
        p.titre.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );
    }

    if (this.selectedCategorie) {
      produits = produits.filter(p => p.categorie === this.selectedCategorie);
    }

    if (this.selectedLocalisation) {
      produits = produits.filter(p => p.localisation === this.selectedLocalisation);
    }

    if (this.prixMin !== null) {
      produits = produits.filter(p => p.prix >= this.prixMin!);
    }

    if (this.prixMax !== null) {
      produits = produits.filter(p => p.prix <= this.prixMax!);
    }

    this.produitsFiltres = produits;
  }

  resetFiltres() {
    this.searchTerm = '';
    this.selectedCategorie = '';
    this.selectedLocalisation = '';
    this.prixMin = null;
    this.prixMax = null;
    this.appliquerFiltres();
  }

  getProduitsAffiches(): Product[] {
    return this.produitsFiltres;
  }

  toggleVipFilter() {
    this.showVipOnly = !this.showVipOnly;
    this.appliquerFiltres();
  }

  formatPrix(prix: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(prix);
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadProduitsPublics();
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

  messageUser(produit: Product) {
    // TODO: Implement messaging functionality
    console.log('Message user for product:', produit);
    // This could open a chat dialog or navigate to a messaging page
  }
}
