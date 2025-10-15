import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProduitService } from '../../services/produit';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create.html',
  styleUrl: './create.css'
})
export class Create {
  produit = {
    titre: '',
    description: '',
    prix: 0,
    localisation: '',
    estVip: false
  };

  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private produitService: ProduitService,
    private router: Router
  ) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (!this.selectedFile) {
      this.errorMessage = 'Veuillez sélectionner une image';
      return;
    }

    if (!this.produit.titre || !this.produit.description || !this.produit.prix) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formData = new FormData();
    formData.append('photo', this.selectedFile);
    formData.append('titre', this.produit.titre);
    formData.append('description', this.produit.description);
    formData.append('prix', this.produit.prix.toString());
    formData.append('localisation', this.produit.localisation);
    formData.append('estVip', this.produit.estVip.toString());
    formData.append('sourceType', 'camera_capture_only');
    formData.append('securityLevel', 'authenticated_photos');

    this.produitService.createProduit(formData).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/produits/mes-produits']);
        } else {
          this.errorMessage = response.message || 'Erreur lors de la création du produit';
          this.isSubmitting = false;
        }
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la création du produit';
        this.isSubmitting = false;
      }
    });
  }
}
