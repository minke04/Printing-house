import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  private http = inject(HttpClient);
  private url = 'http://localhost:4000';

  // Prijava korisnika na sistem slanjem kredencijala
  login(username: string, password: string) {
    return this.http.post(`${this.url}/users/login`, { username, password });
  }

  // Prijava administratora sa posebnim administrativnim kredencijalima
  adminLogin(username: string, password: string) {
    return this.http.post(`${this.url}/users/admin-login`, { username, password });
  }

  // Registracija novog korisnika slanjem popunjene forme i priloga
  register(formData: FormData) {
    return this.http.post(`${this.url}/users/register`, formData);
  }

  // Pokretanje procesa obnove zaboravljene lozinke preko unetog korisničkog imena ili email-a
  forgotPassword(input: string) {
    return this.http.post(`${this.url}/users/forgot-password`, { input });
  }

  // Postavljanje nove lozinke pomoću primljenog tokena za resetovanje
  resetPassword(token: string, newPassword: string) {
    return this.http.post(`${this.url}/users/reset-password/${token}`, { newPassword });
  }

  // Preuzimanje liste korisnika koji čekaju odobrenje administratora
  getPendingUsers() {
    return this.http.get<any[]>(`${this.url}/users/pending-users`);
  }

  // Odobravanje registracije za izabranog korisnika od strane administratora
  approveUser(username: string) {
    return this.http.post(`${this.url}/users/approve-user`, { username });
  }

  // Odbijanje registracije za izabranog korisnika od strane administratora
  rejectUser(username: string) {
    return this.http.post(`${this.url}/users/reject-user`, { username });
  }

  // Preuzimanje kompletne liste svih registrovanih korisnika u sistemu
  getAllUsers() {
    return this.http.get<any[]>(`${this.url}/users/all-users`);
  }

  // Ažuriranje podataka korisnika sa administrativnim ovlašćenjima
  updateUserByAdmin(userData: any) {
    return this.http.post(`${this.url}/users/update-user`, userData);
  }

  // Brisanje korisnika iz sistema od strane administratora
  deleteUserByAdmin(username: string) {
    return this.http.post(`${this.url}/users/delete-user`, { username });
  }
}