import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PublicService {
  private url = 'http://localhost:4000';
  private http = inject(HttpClient);

  // Preuzimanje ukupnog broja registrovanih štamparija u sistemu
  getTotalPrinters() {
    return this.http.get(`${this.url}/products/total-printers`);
  }

  // Preuzimanje liste najbolje ocenjenih ili najpopularnijih proizvoda
  getTopProducts() {
    return this.http.get<any[]>(`${this.url}/products/top-products`);
  }

  // Preuzimanje aktivnih kategorija koje sadrže proizvode
  getActiveCategories() {
    return this.http.get<string[]>(`${this.url}/products/active-categories`);
  }

  // Javno pretraživanje proizvoda prema nazivu i izabranoj kategoriji uz query parametre
  searchProducts(name: string, category: string) {
    let params = new HttpParams()
      .set('name', name)
      .set('category', category);
    
    return this.http.get<any[]>(`${this.url}/products/search-products`, { params });
  }
}