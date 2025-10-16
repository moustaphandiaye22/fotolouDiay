import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ProduitService } from '../../services/produit';
import { Product, ModeLivraison } from '../../models';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  templateUrl: './edit.html',
  styleUrl: './edit.css'
})
export class Edit implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('cameraVideo', { static: false }) cameraVideo!: ElementRef<HTMLVideoElement>;

  produit = {
    titre: '',
    description: '',
    prix: 0,
    localisation: '',
    categorie: '',
    modeLivraison: ModeLivraison.RETRAIT,
    estVip: false
  };

  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isSubmitting = false;
  isCapturing = false;
  errorMessage = '';
  successMessage = '';
  videoStream: MediaStream | null = null;
  isCameraActive = false;
  isEditing = false;
  productId: number | null = null;
  currentProduct: Product | null = null;

  // Make ModeLivraison available in template
  ModeLivraison = ModeLivraison;

  constructor(
    private produitService: ProduitService,
    public router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Check if we're editing an existing product
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.productId = +params['id'];
        this.isEditing = true;
        this.loadProduct();
      }
    });
  }

  ngAfterViewInit() {
    if (!this.isEditing) {
      // Only start camera for new products
      setTimeout(() => {
        this.startCamera();
      }, 100);
    }
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  loadProduct() {
    if (this.productId) {
      this.produitService.getProduit(this.productId).subscribe({
        next: (response) => {
          if (response.success) {
            this.currentProduct = response.data.produit;
            this.populateForm();
          } else {
            this.errorMessage = 'Produit non trouvé';
          }
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors du chargement du produit';
        }
      });
    }
  }

  populateForm() {
    if (this.currentProduct) {
      this.produit = {
        titre: this.currentProduct.titre,
        description: this.currentProduct.description,
        prix: this.currentProduct.prix,
        localisation: this.currentProduct.localisation || '',
        categorie: this.currentProduct.categorie || '',
        modeLivraison: ModeLivraison.RETRAIT, // Default value since it's not in the model
        estVip: this.currentProduct.estVip
      };
      this.imagePreview = this.currentProduct.imageUrl;
    }
  }

  async startCamera() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('L\'API de caméra n\'est pas supportée sur ce navigateur');
      }

      this.videoStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      await new Promise(resolve => setTimeout(resolve, 200));

      const videoElement = this.cameraVideo?.nativeElement;
      if (videoElement) {
        videoElement.srcObject = this.videoStream;
        await new Promise((resolve) => {
          videoElement.onloadedmetadata = () => {
            videoElement.play();
            resolve(void 0);
          };
        });
        this.isCameraActive = true;
      } else {
        throw new Error('Élément vidéo non trouvé');
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'activation de la caméra:', error);
      this.errorMessage = error.message || 'Erreur lors de l\'activation de la caméra';
      this.isCameraActive = false;
    }
  }

  async retryCamera() {
    this.errorMessage = '';
    this.isCameraActive = false;
    await this.startCamera();
  }

  stopCamera() {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
      this.isCameraActive = false;
    }
  }

  async capturePhoto() {
    if (!this.videoStream || !this.isCameraActive) {
      this.errorMessage = 'La caméra n\'est pas active';
      return;
    }

    this.isCapturing = true;
    this.errorMessage = '';

    try {
      const videoElement = this.cameraVideo?.nativeElement;
      if (!videoElement) {
        throw new Error('Élément vidéo non trouvé');
      }

      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(videoElement, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
            this.selectedFile = file;

            const reader = new FileReader();
            reader.onload = (e: any) => {
              this.imagePreview = e.target.result;
            };
            reader.readAsDataURL(file);

            this.stopCamera();
          }
        }, 'image/jpeg', 0.8);
      }

    } catch (error: any) {
      console.error('Erreur lors de la capture photo:', error);
      this.errorMessage = error.message || 'Erreur lors de la capture de la photo';
    } finally {
      this.isCapturing = false;
    }
  }

  retakePhoto() {
    this.selectedFile = null;
    this.imagePreview = this.currentProduct?.imageUrl || null;
    this.errorMessage = '';
    if (!this.isEditing) {
      this.startCamera();
    }
  }

  onSubmit() {
    // Validation for new products
    if (!this.isEditing && !this.selectedFile && !this.imagePreview) {
      this.errorMessage = 'Veuillez prendre une photo du produit';
      return;
    }

    if (!this.produit.titre || !this.produit.description || !this.produit.prix || !this.produit.localisation || !this.produit.categorie || !this.produit.modeLivraison) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    if (this.isEditing && this.productId) {
      this.updateProduct();
    } else {
      this.createProduct();
    }
  }

  createProduct() {
    const formData = new FormData();
    if (this.selectedFile) {
      formData.append('photo', this.selectedFile);
    }
    formData.append('titre', this.produit.titre);
    formData.append('description', this.produit.description);
    formData.append('prix', this.produit.prix.toString());
    formData.append('localisation', this.produit.localisation);
    formData.append('categorie', this.produit.categorie);
    formData.append('modeLivraison', this.produit.modeLivraison);
    formData.append('estVip', this.produit.estVip.toString());

    this.produitService.createProduit(formData).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = 'Produit créé avec succès!';
          setTimeout(() => {
            this.router.navigate(['/vendor-dashboard']);
          }, 1500);
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

  updateProduct() {
    const updateData: any = {
      titre: this.produit.titre,
      description: this.produit.description,
      prix: this.produit.prix,
      localisation: this.produit.localisation,
      categorie: this.produit.categorie,
      estVip: this.produit.estVip
    };

    // Only include image if a new one was selected
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('image', this.selectedFile);
      Object.keys(updateData).forEach(key => {
        formData.append(key, updateData[key].toString());
      });

      this.produitService.updateProduit(this.productId!, formData).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Produit modifié avec succès!';
            setTimeout(() => {
              this.router.navigate(['/vendor-dashboard']);
            }, 1500);
          } else {
            this.errorMessage = response.message || 'Erreur lors de la modification du produit';
            this.isSubmitting = false;
          }
        },
        error: (error) => {
          console.error('Erreur:', error);
          this.errorMessage = error.error?.message || 'Erreur lors de la modification du produit';
          this.isSubmitting = false;
        }
      });
    } else {
      this.produitService.updateProduit(this.productId!, updateData).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Produit modifié avec succès!';
            setTimeout(() => {
              this.router.navigate(['/vendor-dashboard']);
            }, 1500);
          } else {
            this.errorMessage = response.message || 'Erreur lors de la modification du produit';
            this.isSubmitting = false;
          }
        },
        error: (error) => {
          console.error('Erreur:', error);
          this.errorMessage = error.error?.message || 'Erreur lors de la modification du produit';
          this.isSubmitting = false;
        }
      });
    }
  }
}