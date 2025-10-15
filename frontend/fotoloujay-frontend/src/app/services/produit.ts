import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductStats, CreateProductData, UpdateProductData } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProduitService {
  private apiUrl = 'http://localhost:2025/api/produits';

  constructor(private http: HttpClient) {}

  // Get all products (admin/moderator only)
  getProduits(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(this.apiUrl, { headers });
  }

  // Get public validated products
  getProduitsPublics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/publics`);
  }

  // Get VIP products
  getProduitsVip(): Observable<any> {
    return this.http.get(`${this.apiUrl}/vip`);
  }

  // Get product by ID (public with optional auth)
  getProduit(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : undefined;
    return this.http.get(`${this.apiUrl}/${id}`, { headers });
  }

  // Create new product
  createProduit(produitData: FormData): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(this.apiUrl, produitData, { headers });
  }

  // Update product
  updateProduit(id: number, produitData: FormData | UpdateProductData): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiUrl}/${id}`, produitData, { headers });
  }

  // Delete product
  deleteProduit(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.apiUrl}/${id}`, { headers });
  }

  // Get user's own products
  getMesProduits(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/mes-produits`, { headers });
  }

  // Get product statistics
  getStatistiques(): Observable<ProductStats> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<ProductStats>(`${this.apiUrl}/statistiques`, { headers });
  }

  // Validate product (moderator/admin only)
  validerProduit(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiUrl}/${id}/valider`, {}, { headers });
  }

  // Reject product (moderator/admin only)
  rejeterProduit(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiUrl}/${id}/rejeter`, {}, { headers });
  }
}
