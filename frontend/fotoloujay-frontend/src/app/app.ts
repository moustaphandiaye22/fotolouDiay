import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from './services/auth';
import { NotificationService } from './services/notification';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('fotoloujay-frontend');
  currentUser: any = null;
  isLoggedIn = false;
  showUserMenu = false;
  unreadNotificationsCount = 0;
  private authSubscription?: Subscription;
  private notificationSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();

    if (this.isLoggedIn) {
      this.currentUser = this.authService.getCurrentUser();
      this.loadCurrentUser();
      this.loadUnreadNotificationsCount();
    }

    this.authSubscription = this.router.events.subscribe(() => {
      const wasLoggedIn = this.isLoggedIn;
      const nowLoggedIn = this.authService.isLoggedIn();

      if (wasLoggedIn !== nowLoggedIn) {
        this.isLoggedIn = nowLoggedIn;
        if (this.isLoggedIn) {
          this.currentUser = this.authService.getCurrentUser();
          this.loadCurrentUser();
          this.loadUnreadNotificationsCount();
        } else {
          this.currentUser = null;
          this.unreadNotificationsCount = 0;
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  private loadCurrentUser() {
    this.authService.getProfile().subscribe({
      next: (response) => {
        if (response.success) {
          const userData = response.data.utilisateur || response.data;
          this.currentUser = userData;
          this.isLoggedIn = true;
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          this.isLoggedIn = false;
          this.currentUser = null;
          localStorage.removeItem('user');
        }
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.isLoggedIn = false;
        this.currentUser = null;
        localStorage.removeItem('user');
      }
    });
  }

  private loadUnreadNotificationsCount() {
    if (this.currentUser && this.currentUser.role !== 'UTILISATEUR') {
      this.notificationSubscription = this.notificationService.getNotifications().subscribe({
        next: (response) => {
          if (response.success) {
            const notifications = response.data || [];
            this.unreadNotificationsCount = notifications.filter((n: any) => !n.estLue).length;
          }
        },
        error: (error) => {
          console.error('Error loading notifications count:', error);
        }
      });
    }
  }

  logout() {
    this.authService.logout().subscribe({
      next: (response) => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.isLoggedIn = false;
        this.currentUser = null;
        this.showUserMenu = false;
        this.router.navigate(['/produits']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.isLoggedIn = false;
        this.currentUser = null;
        this.showUserMenu = false;
        this.router.navigate(['/produits']);
      }
    });
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  getUserInitials(): string {
    if (!this.currentUser) return '';

    const prenom = this.currentUser.prenom || '';
    const nom = this.currentUser.nom || '';
    return (prenom.charAt(0) + nom.charAt(0)).toUpperCase();
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'ADMINISTRATEUR': return 'Admin';
      case 'MODERATEUR': return 'Modérateur';
      case 'UTILISATEUR': return 'Utilisateur';
      default: return role;
    }
  }
}
