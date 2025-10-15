import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { ProduitService } from '../services/produit';
import { User, ChangePasswordData, Product, ProductStats } from '../models';

@Component({
  selector: 'app-profil',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    MatChipsModule
  ],
  templateUrl: './profil.html',
  styleUrl: './profil.css'
})
export class Profil implements OnInit {
  user: User | null = null;
  userProducts: Product[] = [];
  productStats: ProductStats | null = null;
  isLoading = false;
  isLoadingProducts = false;
  isLoadingStats = false;

  profileForm: FormGroup;
  passwordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private produitService: ProduitService,
    private snackBar: MatSnackBar,
    private router: Router,
    private location: Location
  ) {
    this.profileForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: [''],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['']
    });

    this.passwordForm = this.fb.group({
      ancienMotDePasse: ['', [Validators.required]],
      nouveauMotDePasse: ['', [Validators.required, Validators.minLength(6)]],
      confirmerMotDePasse: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    const storedUser = this.authService.getCurrentUser() as User | null;
    if (storedUser) {
      this.user = storedUser;
      this.updateProfileForm(storedUser);
    }
  }

  ngOnInit() {
    this.loadUserProfile();
    this.loadUserProducts();
    this.loadProductStats();
  }

  goBack() {
    this.location.back();
  }

  loadUserProfile() {
    this.isLoading = true;
    this.authService.getProfile().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          const userData = response.data?.utilisateur || response.data;
          this.user = userData;
          if (this.user) {
            this.updateProfileForm(this.user);
          }
        } else {
          this.showError('Erreur lors du chargement du profil');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.showError('Erreur lors du chargement du profil');
      }
    });
  }

  loadUserProducts() {
    this.isLoadingProducts = true;
    this.produitService.getMesProduits().subscribe({
      next: (response) => {
        this.isLoadingProducts = false;
        if (response.success) {
          this.userProducts = response.data || [];
        } else {
          this.showError('Erreur lors du chargement de vos produits');
        }
      },
      error: (error) => {
        this.isLoadingProducts = false;
        this.showError('Erreur lors du chargement de vos produits');
      }
    });
  }

  loadProductStats() {
    this.isLoadingStats = true;
    this.produitService.getStatistiques().subscribe({
      next: (response: any) => {
        this.isLoadingStats = false;
        if (response.success) {
          this.productStats = response.data;
        }
      },
      error: (error) => {
        this.isLoadingStats = false;
        console.error('Erreur lors du chargement des statistiques:', error);
      }
    });
  }

  updateProfile() {
    if (this.profileForm.valid && this.user) {
      this.isLoading = true;
      const updatedData = this.profileForm.value;

      // Note: Backend doesn't have profile update endpoint yet
      // This is a placeholder for when the endpoint is implemented
      this.snackBar.open('Fonctionnalité de mise à jour du profil à implémenter', 'Fermer', {
        duration: 3000
      });
      this.isLoading = false;
    }
  }

  changePassword() {
    if (this.passwordForm.valid) {
      this.isLoading = true;
      const passwordData: ChangePasswordData = this.passwordForm.value;

      this.authService.changePassword(passwordData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.showSuccess('Mot de passe changé avec succès');
            this.passwordForm.reset();
          } else {
            this.showError(response.message || 'Erreur lors du changement de mot de passe');
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.showError(error.error?.message || 'Erreur lors du changement de mot de passe');
        }
      });
    }
  }

  logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.authService.logout().subscribe({
        next: (response) => {
          localStorage.removeItem('token');
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          // Even if logout fails on server, remove token locally
          localStorage.removeItem('token');
          this.router.navigate(['/auth/login']);
        }
      });
    }
  }

  editProduct(product: Product) {
    this.router.navigate(['/produits', product.id, 'edit']);
  }

  deleteProduct(product: Product) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      this.produitService.deleteProduit(product.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.showSuccess('Produit supprimé avec succès');
            this.loadUserProducts(); // Refresh the list
          } else {
            this.showError('Erreur lors de la suppression du produit');
          }
        },
        error: (error) => {
          this.showError('Erreur lors de la suppression du produit');
        }
      });
    }
  }

  passwordMatchValidator(group: FormGroup) {
    const nouveauMotDePasse = group.get('nouveauMotDePasse');
    const confirmerMotDePasse = group.get('confirmerMotDePasse');

    if (nouveauMotDePasse && confirmerMotDePasse && nouveauMotDePasse.value !== confirmerMotDePasse.value) {
      confirmerMotDePasse.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    if (confirmerMotDePasse && confirmerMotDePasse.hasError('passwordMismatch')) {
      confirmerMotDePasse.setErrors(null);
    }

    return null;
  }

  private updateProfileForm(user: User) {
    this.profileForm.patchValue({
      nom: user.nom,
      prenom: user.prenom || '',
      email: user.email,
      telephone: user.telephone || ''
    });
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

  getRoleLabel(role: string): string {
    switch (role) {
      case 'UTILISATEUR': return 'Utilisateur';
      case 'MODERATEUR': return 'Modérateur';
      case 'ADMINISTRATEUR': return 'Administrateur';
      default: return role;
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

  navigateToCreateProduct() {
    this.router.navigate(['/produits/create']);
  }
}