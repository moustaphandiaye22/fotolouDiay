import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContactMessage, ContactStats } from '../models/contact.model';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = 'http://localhost:2026/api/contacts';

  constructor(private http: HttpClient) {}

  // Envoyer un message de contact
  sendContactMessage(contactData: ContactMessage): Observable<any> {
    return this.http.post(this.apiUrl, contactData);
  }

  // Récupérer les messages de contact (admin/modérateur)
  getContactMessages(): Observable<ContactMessage[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<ContactMessage[]>(this.apiUrl, { headers });
  }

  // Récupérer les statistiques des contacts (admin/modérateur)
  getContactStats(): Observable<ContactStats> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<ContactStats>(`${this.apiUrl}/stats`, { headers });
  }

  // Marquer un message comme traité
  markAsProcessed(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiUrl}/${id}/process`, {}, { headers });
  }

  // Ignorer un message
  markAsIgnored(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiUrl}/${id}/ignore`, {}, { headers });
  }
}