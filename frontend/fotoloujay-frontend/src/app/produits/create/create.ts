import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProduitService } from '../../services/produit';
import { ModeLivraison } from '../../models';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create.html',
  styleUrl: './create.css'
})
export class Create implements AfterViewInit, OnDestroy {
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
  videoStream: MediaStream | null = null;
  isCameraActive = false;

  constructor(
    private produitService: ProduitService,
    private router: Router
  ) {}

  ngAfterViewInit() {
    // Small delay to ensure DOM is fully rendered
    setTimeout(() => {
      this.startCamera();
    }, 100);
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  async startCamera() {
    try {
      // Vérifier si l'API MediaDevices est disponible
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('L\'API de caméra n\'est pas supportée sur ce navigateur');
      }

      // Demander l'accès à la caméra
      this.videoStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Caméra arrière par défaut
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      // Attendre que l'élément vidéo soit disponible
      await new Promise(resolve => setTimeout(resolve, 200));

      // Utiliser ViewChild pour accéder à l'élément vidéo
      const videoElement = this.cameraVideo?.nativeElement;
      if (videoElement) {
        videoElement.srcObject = this.videoStream;
        // Attendre que la vidéo soit prête
        await new Promise((resolve) => {
          videoElement.onloadedmetadata = () => {
            videoElement.play();
            resolve(void 0);
          };
        });
        this.isCameraActive = true;
        console.log('Camera activated successfully');
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
      // Obtenir l'élément vidéo via ViewChild
      const videoElement = this.cameraVideo?.nativeElement;
      if (!videoElement) {
        throw new Error('Élément vidéo non trouvé');
      }

      // Créer un canvas pour capturer l'image
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(videoElement, 0, 0);

        // Convertir en blob
        canvas.toBlob((blob) => {
          if (blob) {
            // Créer un fichier à partir du blob
            const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
            this.selectedFile = file;

            // Créer l'aperçu
            const reader = new FileReader();
            reader.onload = (e: any) => {
              this.imagePreview = e.target.result;
            };
            reader.readAsDataURL(file);

            // Arrêter la caméra après capture
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
    this.imagePreview = null;
    this.errorMessage = '';
    // Reset form data
    this.produit = {
      titre: '',
      description: '',
      prix: 0,
      localisation: '',
      categorie: '',
      modeLivraison: ModeLivraison.RETRAIT,
      estVip: false
    };
  }

  onSubmit() {
    if (!this.selectedFile) {
      this.errorMessage = 'Veuillez prendre une photo du produit';
      return;
    }

    if (!this.produit.titre || !this.produit.description || !this.produit.prix || !this.produit.localisation || !this.produit.categorie || !this.produit.modeLivraison) {
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
    formData.append('categorie', this.produit.categorie);
    formData.append('modeLivraison', this.produit.modeLivraison);
    formData.append('estVip', this.produit.estVip.toString());

    this.produitService.createProduit(formData).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/vendor-dashboard']);
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
