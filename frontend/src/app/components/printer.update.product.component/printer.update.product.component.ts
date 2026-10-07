import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PrinterService } from '../../services/printer.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-printer.update.product.component',
  imports: [CommonModule, FormsModule],
  templateUrl: './printer.update.product.component.html',
  styleUrl: './printer.update.product.component.css',
})
export class PrinterUpdateProductComponent implements OnInit {
  products: any[] = [];
  successMessage: string = '';
  errorMessage: string = '';
  
  private printerService = inject(PrinterService);
  private router = inject(Router);

  // Inicijalizacija komponente, preuzimanje identifikatora ulogovanog štampara i učitavanje njegovih proizvoda
  ngOnInit(): void {
    const loggedUserStr = localStorage.getItem('loggedUser');
    if (loggedUserStr) {
      try {
        const user = JSON.parse(loggedUserStr);
        const printerId = user.username; // Preuzimanje korisničkog imena ulogovanog štampara (npr. 'stampar1')
        
        if (printerId) {
          this.loadProducts(printerId);
        }
      } catch (e) {
        console.error("Greška pri parsiranju ulogovanog korisnika", e);
      }
    }
  }

  // Preuzimanje liste proizvoda iz baze podataka za specifičnog štampara
  loadProducts(printerId: string): void {
    this.printerService.getProductsByPrinter(printerId).subscribe({
      next: (data) => {
        this.products = data;
      },
      error: (err) => {
        this.errorMessage = 'Greška pri učitavanju vaših proizvoda.';
      }
    });
  }

  // Slanje zahteva za ažuriranje raspoložive količine na lageru za konkretan proizvod
  updateQuantity(product: any): void {
    this.printerService.updateProductStock(product._id, product.stockQuantity).subscribe({
      next: (res) => {
        this.successMessage = `Količina za proizvod "${product.name}" je uspešno ažurirana!`;
        this.errorMessage = '';
        setTimeout(() => this.successMessage = '', 3000); // Automatsko sklanjanje poruke o uspehu nakon 3 sekunde
      },
      error: (err) => {
        this.errorMessage = 'Greška pri ažuriranju količine.';
        this.successMessage = '';
      }
    });
  }

  // Povratak nazad na kontrolnu tablu štampara
  goBack(): void {
    this.router.navigate(['/printer-dashboard']); 
  }
}