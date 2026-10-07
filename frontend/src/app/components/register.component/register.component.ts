import { Component, inject } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register.component',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {

  username = '';
  password = '';
  email = '';
  role = 'fizicko_lice';
  name = '';
  surname = '';
  phone = '';
  institutionName = '';
  address = '';
  registrationNumber = '';
  taxId = '';
  selectedFile: File | null = null;
  message = '';
  
  private userService = inject(UserService);
  private router = inject(Router);

  // Preuzimanje izabranog fajla (profilne slike) iz input elementa
  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  // Slanje popunjenih podataka forme kroz FormData objekat ka serveru za registraciju novog korisnika
  register(): void {
    const formData = new FormData();
    formData.append('username', this.username);
    formData.append('password', this.password);
    formData.append('email', this.email);
    formData.append('role', this.role);
    formData.append('name', this.name);
    formData.append('surname', this.surname);
    formData.append('phone', this.phone);

    // Dodavanje dodatnih polja za pravna lica i štampare ukoliko uloga nije fizičko lice
    if (this.role !== 'fizicko_lice') {
      formData.append('institutionName', this.institutionName);
      formData.append('address', this.address);
      formData.append('registrationNumber', this.registrationNumber);
      formData.append('taxId', this.taxId);
    }

    // Pridruživanje izabranog fajla slike profila u formu ako je korisnik priložio sliku
    if (this.selectedFile) {
      formData.append('profileImage', this.selectedFile, this.selectedFile.name);
    }

    // Poziv servisa za registraciju i preusmeravanje na stranicu za prijavu po uspehu
    this.userService.register(formData).subscribe({
      next: (res: any) => {
        this.message = res.message || 'Uspešna registracija!';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.message = err.error?.message || 'Registracija nije uspela.';
      }
    });
  }
}