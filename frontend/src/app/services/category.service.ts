import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private api = 'http://localhost:4000';
  private http = inject(HttpClient);

  // Preuzimanje kompletne liste kategorija sa servera
  getCategories() {
    return this.http.get<any[]>(`${this.api}/categories/get-categories`);
  }

  // Dodavanje nove glavne kategorije slanjem naziva ka serveru
  addCategory(name: string) {
    return this.http.post(`${this.api}/categories/add-category`, { name });
  }

  // Dodavanje nove potkategorije unutar postojeće glavne kategorije
  addSubcategory(categoryName: string, subcategoryName: string) {
    return this.http.post(`${this.api}/categories/add-subcategory`, { categoryName, subcategoryName });
  }
}
