import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet,RouterLink,RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private router = inject(Router);

  // Proverava da li je korisnik ulogovan (prilagodite ključ u zavisnosti od toga kako čuvate podatke, npr. 'user', 'token'...)
  isLoggedIn(): boolean {
    return !!localStorage.getItem('loggedUser') || !!localStorage.getItem('token');
  }

  // Funkcija za odjavljivanje
  logout(): void {
    // Uklonite podatke o prijavi iz localStorage-a
    localStorage.removeItem('loggedUser');
  
    // Vratite korisnika na home page
    this.router.navigate(['/']);
  }
}
