import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-client.archive.component',
  imports: [FormsModule, CommonModule],
  templateUrl: './client.archive.component.html',
  styleUrl: './client.archive.component.css',
})
export class ClientArchiveComponent implements OnInit {
  archiveOrders: any[] = [];
  sortBy: string = 'date';
  currentUsername: string = '';
  private clientService = inject(ClientService);
  private router = inject(Router);

  // Inicijalizacija komponente, preuzimanje ulogovanog korisnika i učitavanje arhive
  ngOnInit(): void {
    const loggedUserStr = localStorage.getItem('loggedUser');
    if (loggedUserStr) {
      try {
        this.currentUsername = JSON.parse(loggedUserStr).username;
      } catch (e) {}
    }
    this.loadArchive();
  }

  // Preuzimanje arhive narudžbina za trenutnog korisnika sa servera
  loadArchive(): void {
    this.clientService.getClientArchive(this.currentUsername || 'firma_kg').subscribe({
      next: (data) => {
        console.log("Primljeni podaci iz arhive:", data);
        this.archiveOrders = data || [];
        this.sortProducts();
      },
      error: (err) => console.error('Greška pri učitavanju arhive', err)
    });
  }

  // Označavanje narudžbine kao primljene i osvežavanje prikaza
  markAsReceived(orderId: string): void {
    this.clientService.markReceived(orderId).subscribe({
      next: () => {
        alert('Status uspešno promenjen u „primljeno“.');
        this.loadArchive();
      },
      error: () => alert('Greška pri promeni statusa.')
    });
  }

  // Sortiranje narudžbina na osnovu izabranog kriterijuma
  sortProducts(): void {
    if (this.sortBy === 'date') {
      this.archiveOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (this.sortBy === 'name') {
      this.archiveOrders.sort((a, b) => (a.items[0]?.name || '').localeCompare(b.items[0]?.name || ''));
    } else if (this.sortBy === 'quantity') {
      this.archiveOrders.sort((a, b) => (b.items[0]?.quantity || 0) - (a.items[0]?.quantity || 0));
    } else if (this.sortBy === 'printer') {
      this.archiveOrders.sort((a, b) => (a.printerName || '').localeCompare(b.printerName || ''));
    }
  }

  // Slanje lajka ili dislajka za proizvod iz narudžbine
  react(productId: string, action: string): void {
    if (!productId) return;
    this.clientService.rateOrComment({ productId, username: this.currentUsername, action }).subscribe({
      next: () => this.loadArchive(),
      error: (err) => console.error('Greška pri ocenjivanju', err)
    });
  }

  // Dodavanje komentara za proizvod u arhivi
  addComment(item: any): void {
    if (!item.newComment || !item.productId) return;
    this.clientService.rateOrComment({ 
      productId: item.productId, 
      username: this.currentUsername, 
      action: 'comment', 
      commentText: item.newComment 
    }).subscribe({
      next: () => {
        item.newComment = '';
        this.loadArchive();
      },
      error: (err) => console.error('Greška pri dodavanju komentara', err)
    });
  }

  // Povratak na kontrolnu tablu klijenta
  goBack(): void {
    this.router.navigate(['/client-dashboard']);
  }
}