import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NotificationService } from '../services/notification';
import { Notification, TypeNotification } from '../models';

@Component({
  selector: 'app-notifications',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatTabsModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class Notifications implements OnInit {
  notifications: Notification[] = [];
  unreadNotifications: Notification[] = [];
  readNotifications: Notification[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private notificationService: NotificationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.isLoading = true;
    this.errorMessage = '';

    this.notificationService.getNotifications().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.notifications = response.data || [];
          this.categorizeNotifications();
        } else {
          this.errorMessage = response.message || 'Erreur lors du chargement des notifications';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Erreur lors du chargement des notifications';
      }
    });
  }

  categorizeNotifications() {
    this.unreadNotifications = this.notifications.filter(n => !n.estLue);
    this.readNotifications = this.notifications.filter(n => n.estLue);
  }

  markAsRead(notification: Notification) {
    if (!notification.estLue) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: (response) => {
          if (response.success) {
            notification.estLue = true;
            this.categorizeNotifications();
            this.showSuccess('Notification marquée comme lue');
          }
        },
        error: (error) => {
          this.showError('Erreur lors de la mise à jour de la notification');
        }
      });
    }
  }

  markAllAsRead() {
    const unreadIds = this.unreadNotifications.map(n => n.id);
    if (unreadIds.length === 0) return;

    // Mark all as read by calling the service for each
    let completed = 0;
    unreadIds.forEach(id => {
      this.notificationService.markAsRead(id).subscribe({
        next: (response) => {
          completed++;
          if (completed === unreadIds.length) {
            this.loadNotifications(); // Reload to refresh the state
            this.showSuccess('Toutes les notifications ont été marquées comme lues');
          }
        },
        error: (error) => {
          completed++;
          if (completed === unreadIds.length) {
            this.showError('Erreur lors de la mise à jour des notifications');
          }
        }
      });
    });
  }

  deleteNotification(notification: Notification) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) {
      this.notificationService.deleteNotification(notification.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.showSuccess('Notification supprimée');
            this.loadNotifications(); // Reload to refresh the list
          }
        },
        error: (error) => {
          this.showError('Erreur lors de la suppression de la notification');
        }
      });
    }
  }

  getNotificationIcon(type: TypeNotification): string {
    switch (type) {
      case TypeNotification.PRODUIT_EXPIRE: return 'schedule';
      case TypeNotification.PRODUIT_VALIDE: return 'check_circle';
      case TypeNotification.PRODUIT_REJETE: return 'cancel';
      case TypeNotification.RAPPEL: return 'notifications_active';
      default: return 'info';
    }
  }

  getNotificationColor(type: TypeNotification): string {
    switch (type) {
      case TypeNotification.PRODUIT_EXPIRE: return 'warn';
      case TypeNotification.PRODUIT_VALIDE: return 'primary';
      case TypeNotification.PRODUIT_REJETE: return 'warn';
      case TypeNotification.RAPPEL: return 'accent';
      default: return 'basic';
    }
  }

  getNotificationTypeLabel(type: TypeNotification): string {
    switch (type) {
      case TypeNotification.GENERALE: return 'Général';
      case TypeNotification.PRODUIT_EXPIRE: return 'Produit expiré';
      case TypeNotification.PRODUIT_VALIDE: return 'Produit validé';
      case TypeNotification.PRODUIT_REJETE: return 'Produit rejeté';
      case TypeNotification.RAPPEL: return 'Rappel';
      default: return type;
    }
  }

  formatDate(date: Date | string): string {
    const notificationDate = new Date(date);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Il y a moins d\'une heure';
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    } else if (diffInHours < 48) {
      return 'Hier';
    } else {
      return notificationDate.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
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
}