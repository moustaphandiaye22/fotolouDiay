import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ContactService } from '../services/contact';
import { ContactMessage, ContactStatus } from '../models/contact.model';

@Component({
  selector: 'app-contact',
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css']
})
export class Contact implements OnInit {
  contactMessage: ContactMessage = {
    nom: '',
    email: '',
    telephone: '',
    sujet: '',
    message: '',
    statut: ContactStatus.EN_ATTENTE
  };

  captchaResponse = '';
  captchaImage = '';
  showCaptcha = true;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private contactService: ContactService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.refreshCaptcha();

    // Vérifier si on vient d'une page produit spécifique
    this.route.queryParams.subscribe(params => {
      if (params['produitId']) {
        this.contactMessage.produitId = +params['produitId'];
        this.contactMessage.sujet = 'INFORMATION'; // Sujet par défaut pour les produits
      }
    });
  }

  refreshCaptcha(): void {
    // Simulation de génération de CAPTCHA
    // Dans un vrai projet, cela ferait un appel API vers un service de CAPTCHA
    this.captchaImage = 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="60">
        <rect width="200" height="60" fill="#f0f0f0"/>
        <text x="20" y="35" font-family="Arial" font-size="20" fill="#333">
          ${Math.random().toString(36).substring(2, 8).toUpperCase()}
        </text>
      </svg>
    `);
  }

  onSubmit(): void {
    if (!this.contactMessage.nom || !this.contactMessage.email || !this.contactMessage.message) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    if (this.showCaptcha && !this.captchaResponse) {
      this.errorMessage = 'Veuillez résoudre le CAPTCHA.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Ajouter la réponse CAPTCHA au message
    this.contactMessage.captcha = this.captchaResponse;

    this.contactService.sendContactMessage(this.contactMessage).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.';
        this.resetForm();
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error.error?.message || 'Une erreur est survenue lors de l\'envoi du message.';
      }
    });
  }

  resetForm(): void {
    this.contactMessage = {
      nom: '',
      email: '',
      telephone: '',
      sujet: '',
      message: '',
      statut: ContactStatus.EN_ATTENTE
    };
    this.captchaResponse = '';
    this.refreshCaptcha();
    this.errorMessage = '';
    this.successMessage = '';
  }
}