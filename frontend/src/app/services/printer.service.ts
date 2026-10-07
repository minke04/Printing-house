import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PrinterService {
  private api = 'http://localhost:4000';
  private http = inject(HttpClient);

  // Preuzimanje podataka profila štampara sa servera
  getProfile(username: string) {
    return this.http.get(`${this.api}/printer/get-profile/${username}`);
  }

  // Slanje ažuriranih podataka o profilu štampara ka serveru
  updateProfile(data: any) {
    return this.http.post(`${this.api}/printer/update-profile`, data);
  }

  // Dodavanje novog proizvoda sa fajlom (FormData) u sistem
  addProduct(productData: FormData) {
    return this.http.post(`${this.api}/printer/add-product`, productData);
  }

  // Preuzimanje liste svih proizvoda koji pripadaju određenom štamparu
  getProductsByPrinter(printerId: string) {
    return this.http.get<any[]>(`${this.api}/printer/products/${printerId}`);
  }

  // Ažuriranje raspoložive količine na lageru za konkretan proizvod
  updateProductStock(productId: string, stockQuantity: number) {
    return this.http.post<any>(`${this.api}/printer/update-stock`, { productId, stockQuantity });
  }

  // Uvoz kompletne liste proizvoda putem JSON formata
  importProducts(data: any) {
    return this.http.post<any>(`${this.api}/printer/import-json`, data);
  }

  // Preuzimanje svih porudžbina upućenih izabranoj štampariji
  getOrdersByPrinter(printerId: string) {
    return this.http.get(`${this.api}/printer/orders/${printerId}`);
  }

  // Slanje zahteva za promenu i napredovanje statusa porudžbine
  updateOrderStatus(orderId: string) {
    return this.http.post(`${this.api}/printer/orders/status`, { orderId });
  }

  // Dobavljanje svih otvorenih javnih nabavki dostupnih za licitaciju štamparije
  getOpenPublicProcurements() {
    return this.http.get<any[]>(`${this.api}/printer/public-procurements/open`);
  }

  // Slanje ponude sa definisanom cenom za izabranu javnu nabavku
  submitBid(procurementId: string, bidData: { printerId: string, printerName: string, totalOfferPrice: number }) {
    return this.http.post<any>(`${this.api}/printer/public-procurements/${procurementId}/bid`, bidData);
  }
}