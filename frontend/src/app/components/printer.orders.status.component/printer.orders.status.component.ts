import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PrinterService } from '../../services/printer.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-printer.orders.status.component',
  imports: [CommonModule, FormsModule],
  templateUrl: './printer.orders.status.component.html',
  styleUrl: './printer.orders.status.component.css',
})
export class PrinterOrdersStatusComponent implements OnInit {

  orders: any[] = [];
  successMessage: string = '';
  errorMessage: string = '';
  printerId: string = '';

  private printerService = inject(PrinterService);
  private router = inject(Router);

  // Inicijalizacija komponente, preuzimanje identifikatora štampara iz lokalne memorije i učitavanje porudžbina
  ngOnInit(): void {
    // Preuzimanje korisničkog imena ulogovanog štampara iz lokalne sesije
    const loggedUser = JSON.parse(localStorage.getItem('loggedUser') || '{}');
    if (loggedUser && loggedUser.username) {
      this.printerId = loggedUser.username;
    }

    if (this.printerId) {
      this.loadOrders();
    } else {
      this.errorMessage = 'Greška: Štampar nije pronađen u sesiji.';
    }
  }

  // Preuzimanje liste porudžbina za ulogovanog štampara sa servera
  loadOrders(): void {
    this.printerService.getOrdersByPrinter(this.printerId).subscribe({
      next: (data: any) => {
        this.orders = data;
      },
      error: (err) => {
        console.error('Greška pri učitavanju porudžbina:', err);
        this.errorMessage = 'Greška prilikom učitavanja porudžbina.';
      }
    });
  }

  // Slanje zahteva za ažuriranje i prelazak na sledeći status za izabranu porudžbinu
  updateStatus(orderId: string): void {
    this.printerService.updateOrderStatus(orderId).subscribe({
      next: (res: any) => {
        this.successMessage = res.message || 'Status uspešno promenjen!';
        this.errorMessage = '';
        this.loadOrders(); // Ponovno učitavanje liste radi prikaza najnovijeg statusa
        
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        console.error('Greška pri promeni statusa:', err);
        this.errorMessage = err.error?.message || 'Greška prilikom promene statusa.';
        this.successMessage = '';
      }
    });
  }

  // Povratak nazad na kontrolnu tablu štampara
  goBack(): void {
    this.router.navigate(['/printer-dashboard']); 
  }
}