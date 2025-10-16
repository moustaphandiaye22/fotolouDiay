import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { RoleUtilisateur } from '../../models';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSelectModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  registerData = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    motDePasse: '',
    role: RoleUtilisateur.VENDEUR
  };

  // Expose enum to template
  RoleUtilisateur = RoleUtilisateur;

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    // Validation côté client avant envoi
    if (!this.registerData.nom || !this.registerData.email || !this.registerData.motDePasse) {
      this.errorMessage = 'Veuillez remplir les champs obligatoires';
      return;
    }

    // Validation de la complexité du mot de passe
    if (!this.validatePassword(this.registerData.motDePasse)) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères avec au moins un chiffre';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.successMessage = 'Inscription réussie ! Redirection vers la connexion...';
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        } else {
          this.errorMessage = response.message || 'Erreur lors de l\'inscription';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Erreur lors de l\'inscription';
      }
    });
  }

  private validatePassword(password: string): boolean {
    // Au moins 6 caractères et au moins un chiffre
    const passwordRegex = /^(?=.*\d).{6,}$/;
    return passwordRegex.test(password);
  }
}
