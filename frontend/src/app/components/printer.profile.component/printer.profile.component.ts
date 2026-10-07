import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PrinterService } from '../../services/printer.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-printer-profile',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './printer.profile.component.html',
  styleUrl: './printer.profile.component.css'
})
export class PrinterProfileComponent implements OnInit {
  printer: any = {};
  
  successMessage: string = '';
  errorMessage: string = '';
  private printerService = inject(PrinterService);

  // Inicijalizacija komponente i preuzimanje podataka ulogovanog štampara iz lokalne sesije
  ngOnInit(): void {
    const loggedUserStr = localStorage.getItem('loggedUser');
    if (loggedUserStr) {
      try {
        const user = JSON.parse(loggedUserStr);
        this.loadProfile(user.username);
      } catch (e) {
        console.error("Greška pri parsiranju ulogovanog korisnika", e);
      }
    }
  }

  // Preuzimanje podataka profila štampara sa servera na osnovu korisničkog imena
  loadProfile(username: string): void {
    this.printerService.getProfile(username).subscribe({
      next: (data) => {
        this.printer = data;
      },
      error: (err) => {
        this.errorMessage = 'Greška pri učitavanju profila.';
      }
    });
  }

  // Izbor i konverzija nove profilne slike u Base64 format
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.printer.profileImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Slanje ažuriranih podataka o profilu štampara ka serveru
  updateProfile(): void {
    this.printerService.updateProfile(this.printer).subscribe({
      next: (res) => {
        this.successMessage = 'Profil je uspešno ažuriran.';
        this.errorMessage = '';
      },
      error: (err) => {
        this.errorMessage = 'Greška pri ažuriranju profila.';
        this.successMessage = '';
      }
    });
  }
}