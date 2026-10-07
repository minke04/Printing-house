import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
   private api = 'http://localhost:4000';
   private http = inject(HttpClient);

  // Preuzimanje podataka profila klijenta sa servera na osnovu korisničkog imena
  getProfile(username: string) {
    return this.http.get(`${this.api}/client/get-profile/${username}`);
  }

  // Preuzimanje dostupnih kategorija za klijente
  getCategories() {
    return this.http.get<any[]>(`${this.api}/client/categories`);
  }

  // Slanje ažuriranih podataka o profilu klijenta ka serveru
  updateProfile(data: any) {
    return this.http.post(`${this.api}/client/update-profile`, data);
  }

  // Preuzimanje liste porudžbina za specifičnog klijenta
  getOrders(username: string) {
    return this.http.get<any[]>(`${this.api}/client/get-orders/${username}`);
  }

  // Slanje zahteva za otkazivanje postojeće porudžbine
  cancelOrder(orderId: string) {
    return this.http.post(`${this.api}/client/cancel-order`, { id: orderId });
  }

  // Pretraga proizvoda prema nazivu i izabranoj kategoriji
  searchProducts(name: string, category: string) {
    return this.http.get<any[]>(`${this.api}/client/search-products?name=${name}&category=${category}`);
  }

  // Preuzimanje detaljnih informacija o izabranom proizvodu
  getProductDetails(id: string) {
    return this.http.get<any>(`${this.api}/client/product-details/${id}`);
  }

  // Kreiranje novih porudžbina slanjem podataka ka serveru
  createOrders(orderData: any) {
    return this.http.post(`${this.api}/client/create-orders`, orderData);
  }

  // Kreiranje nove javne nabavke od strane klijenta
  createPublicProcurement(payload: any) {
    return this.http.post(`${this.api}/client/create-public-procurement`, payload);
  }

  // Preuzimanje liste javnih nabavki koje je kreirao klijent
  getPublicProcurements(username: string) {
    return this.http.get<any[]>(`${this.api}/client/get-public-procurements/${username}`);
  }

  // Preuzimanje arhive završenih poslova i porudžbina za klijenta
  getClientArchive(username: string) {
    return this.http.get<any[]>(`${this.api}/client/client-archive/${username}`);
  }

  // Označavanje porudžbine kao primljene od strane klijenta
  markReceived(orderId: string) {
    return this.http.post<any>(`${this.api}/client/mark-received`, { orderId });
  }

  // Slanje ocene i komentara za isporučenu uslugu ili proizvod
  rateOrComment(payload: any) {
    return this.http.post<any>(`${this.api}/client/rate-comment`, payload);
  }
}