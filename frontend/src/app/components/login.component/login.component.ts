import { Component, inject } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login.component',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {

  username = '';
  password = '';
  message = '';
  isAdminMode = false; // Prebacivanje na formu za admin prijavu

  private userService = inject(UserService);
  private router = inject(Router);

  // Obrada prijave korisnika ili administratora na osnovu aktivnog režima
  login() {
    if (this.isAdminMode) {
      // Slanje zahteva za administratorsku prijavu
      this.userService.adminLogin(this.username, this.password).subscribe({
        next: (res: any) => {
          // Čuvanje administrativnih podataka u lokalnu memoriju
          localStorage.setItem('loggedUser', JSON.stringify({ username: this.username, role: 'admin' }));
          this.router.navigate(['/admin-dashboard']);
        },
        error: (err) => {
          this.message = err.error.message || 'Prijava nije uspela';
        }
      });
    } else {
      // Slanje zahteva za standardnu prijavu klijenta ili štampara
      this.userService.login(this.username, this.password).subscribe({
        next: (res: any) => {
          // Čuvanje celog objekta sa servera u lokalnu memoriju (uključujući ulogu i dodatne podatke)
          localStorage.setItem('loggedUser', JSON.stringify(res));

          // Preusmeravanje na odgovarajuću kontrolnu tablu u zavisnosti od uloge
          if (res.role === 'fizicko_lice' || res.role === 'pravno_lice') {
            this.router.navigate(['/client-dashboard']);
          } else if (res.role === 'stampar') {
            this.router.navigate(['/printer-dashboard']);
          }
        },
        error: (err) => {
          this.message = err.error.message || 'Prijava nije uspela';
        }
      });
    }
  }
}