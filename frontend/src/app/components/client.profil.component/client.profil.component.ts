import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ClientService } from '../../services/client.service';

@Component({
  selector: 'app-client.profil.component',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './client.profil.component.html',
  styleUrl: './client.profil.component.css',
})
export class ClientProfilComponent implements OnInit {
  storedUser = localStorage.getItem('loggedUser');
  currentUsername: string = this.storedUser ? JSON.parse(this.storedUser).username : ' ';
  currentRole: string = this.storedUser ? JSON.parse(this.storedUser).role : '';

  profile: any = {}; 
  orders: any[] = [];
  message: string = '';

  private clientService = inject(ClientService);

  // Inicijalizacija komponente i učitavanje profila i narudžbina ulogovanog klijenta
  ngOnInit(): void {
    this.loadProfile();
    this.loadOrders();
  }

  // Preuzimanje podataka o profilu klijenta sa servera
  loadProfile(): void {
    this.clientService.getProfile(this.currentUsername).subscribe({
      next: (res) => { this.profile = res || {}; },
      error: (err) => console.error('Greška pri učitavanju profila', err)
    });
  }

  // Preuzimanje liste narudžbina klijenta sa servera
  loadOrders(): void {
    this.clientService.getOrders(this.currentUsername).subscribe({
      next: (res) => { this.orders = res || []; },
      error: (err) => console.error('Greška pri učitavanju narudžbina', err)
    });
  }

  // Ažuriranje podataka profila na serveru uz prikaz poruke o uspehu
  onUpdateProfile(): void {
    this.clientService.updateProfile(this.profile).subscribe({
      next: (res: any) => {
        this.message = 'Profil je uspešno ažuriran!';
        setTimeout(() => this.message = '', 3000);
      },
      error: (err) => {
        this.message = 'Greška pri ažuriranju profila.';
        console.error(err);
      }
    });
  }

  // Validacija formata i dimenzija slike profila pre učitavanja
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      
      // Provera dozvoljenih tipova slika
      if (!validTypes.includes(file.type)) {
        alert('Dozvoljeni su samo JPG, PNG ili GIF formati slika.');
        return;
      }

      const img = new Image();
      img.src = URL.createObjectURL(file);
      
      // Provera dimenzija slike prema specifikaciji (između 100x100 i 250x250 piksela)
      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;

        if (width < 100 || height < 100 || width > 250 || height > 250) {
          alert(`Dimenzije slike moraju biti između 100x100 i 250x250 piksela. Trenutne dimenzije: ${width}x${height}px`);
          return;
        }

        // Čitanje fajla i konvertovanje u Base64 format
        const reader = new FileReader();
        reader.onload = () => {
          this.profile.profileImage = reader.result as string;
        };
        reader.readAsDataURL(file);
      };
    }
  }

  // Otkazivanje izabrane narudžbine uz potvrdu korisnika i osvežavanje tabele
  onCancelOrder(orderId: string): void {
    if (confirm('Da li ste sigurni da želite da otkažete ovu narudžbinu?')) {
      this.clientService.cancelOrder(orderId).subscribe({
        next: () => {
          this.loadOrders();
        },
        error: (err) => {
          alert(err.error.message || 'Nije moguće otkazati narudžbinu.');
        }
      });
    }
  }
}