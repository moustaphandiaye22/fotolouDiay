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
import { RouterModule } from '@angular/router';
import { ProduitService } from '../services/produit';
import { AuthService } from '../services/auth';
import { Product, ProductStats, RoleUtilisateur, User } from '../models';

@Component({
  selector: 'app-dashboard',
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
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  stats: ProductStats | null = null;
  recentProducts: Product[] = [];
  users: User[] = [];
  isLoading = false;
  errorMessage = '';
  currentUser: any = null;

  // Pagination properties
  totalUsers = 0;
  pageSize = 10;
  currentPage = 1;

  // Table columns
  displayedColumns: string[] = ['titre', 'statut', 'dateCreation', 'utilisateur', 'actions'];
  userColumns: string[] = ['nom', 'prenom', 'email', 'role', 'estActif', 'dateCreation', 'produits', 'actions'];

  constructor(
    private produitService: ProduitService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.loadStats();
    this.loadRecentProducts();
    this.loadUsers();
  }

  loadCurrentUser() {
    if (this.authService.isLoggedIn()) {
      this.currentUser = this.authService.getCurrentUser();
    }
  }

  loadStats() {
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

  loadRecentProducts() {
    this.produitService.getProduits().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.recentProducts = response.data?.produits?.slice(0, 10) || [];
        }
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des produits récents:', error);
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

  validerProduit(produit: Product) {
    if (confirm('Êtes-vous sûr de vouloir valider ce produit ?')) {
      this.produitService.validerProduit(produit.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadStats();
            this.loadRecentProducts();
          }
        },
        error: (error) => {
          alert('Erreur lors de la validation du produit');
        }
      });
    }
  }

  rejeterProduit(produit: Product) {
    if (confirm('Êtes-vous sûr de vouloir rejeter ce produit ?')) {
      this.produitService.rejeterProduit(produit.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadStats();
            this.loadRecentProducts();
          }
        },
        error: (error) => {
          alert('Erreur lors du rejet du produit');
        }
      });
    }
  }

  loadUsers() {
    this.authService.getUsers({ page: this.currentPage, limite: this.pageSize }).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.users = response.data?.utilisateurs || [];
          this.totalUsers = response.data?.total || 0;
        }
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  canModerate(): boolean {
    return this.currentUser?.role === RoleUtilisateur.MODERATEUR ||
           this.currentUser?.role === RoleUtilisateur.ADMINISTRATEUR;
  }

  getRoleLabel(role: RoleUtilisateur): string {
    switch (role) {
      case RoleUtilisateur.ADMINISTRATEUR: return 'Administrateur';
      case RoleUtilisateur.MODERATEUR: return 'Modérateur';
      case RoleUtilisateur.UTILISATEUR: return 'Utilisateur';
      default: return role;
    }
  }

  getRoleColor(role: RoleUtilisateur): string {
    switch (role) {
      case RoleUtilisateur.ADMINISTRATEUR: return 'warn';
      case RoleUtilisateur.MODERATEUR: return 'accent';
      case RoleUtilisateur.UTILISATEUR: return 'primary';
      default: return 'basic';
    }
  }

  toggleUserStatus(user: User) {
    const action = user.estActif ? 'désactiver' : 'activer';
    if (confirm(`Êtes-vous sûr de vouloir ${action} cet utilisateur ?`)) {
      this.authService.toggleUserStatus(user.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadUsers(); // Refresh the list
          } else {
            alert('Erreur lors de la modification du statut utilisateur');
          }
        },
        error: (error) => {
          alert('Erreur lors de la modification du statut utilisateur');
        }
      });
    }
  }
}
