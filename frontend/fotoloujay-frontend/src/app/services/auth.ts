import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:2025/api/auth';

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; motDePasse: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/connexion`, credentials).pipe(
      tap((response: any) => {
        if (response.success && response.data?.token) {
          localStorage.setItem('token', response.data.token);
          const user = response.data.utilisateur || response.data.user;
          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            console.log('User stored:', user);
          }
          console.log('Token stored:', response.data.token);
        }
      })
    );
  }

  register(userData: { nom: string; prenom?: string; email: string; telephone?: string; motDePasse: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/inscription`, userData);
  }

  verifyToken(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/verifier-token`, { headers });
  }

  logout(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/deconnexion`, {}, { headers });
  }

  getProfile(): Observable<any> {
    const token = localStorage.getItem('token');
    console.log('Token being sent:', token ? token.substring(0, 20) + '...' : 'No token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/profil`, { headers }).pipe(
      tap((response: any) => {
        console.log('Profile response:', response);
        if (response.success && response.data) {
          const userData = response.data.utilisateur || response.data;
          console.log('Storing user data:', userData);
          localStorage.setItem('user', JSON.stringify(userData));
        }
      })
    );
  }

  changePassword(passwordData: { ancienMotDePasse: string; nouveauMotDePasse: string }): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiUrl}/changer-mot-de-passe`, passwordData, { headers });
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): any {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
        return null;
      }
    }
    return null;
  }
}
