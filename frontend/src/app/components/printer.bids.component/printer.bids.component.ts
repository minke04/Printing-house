import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PrinterService } from '../../services/printer.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-printer.bids.component',
  imports: [FormsModule, CommonModule],
  templateUrl: './printer.bids.component.html',
  styleUrl: './printer.bids.component.css',
})
export class PrinterBidsComponent implements OnInit {
  procurements: any[] = [];
  successMessage: string = '';
  errorMessage: string = '';
  
  printerId: string = '';
  printerName: string = '';

  // Čuvanje unete cene ponude za svaku nabavku preko njenog identifikatora
  offerPrices: { [key: string]: number } = {};

  private printerService = inject(PrinterService);
  private router = inject(Router);

  // Inicijalizacija komponente, preuzimanje podataka ulogovanog štampara i otvorenih nabavki
  ngOnInit(): void {
    const loggedUserStr = localStorage.getItem('loggedUser');
    if (loggedUserStr) {
      try {
        const user = JSON.parse(loggedUserStr);
        this.printerId = user.username;
        this.printerName = user.name || user.printerName || user.username; 
      } catch (e) {
        console.error("Greška pri parsiranju ulogovanog štampara", e);
      }
    }

    this.loadOpenProcurements();
  }

  // Preuzimanje liste otvorenih javnih nabavki sa servera
  loadOpenProcurements(): void {
    this.printerService.getOpenPublicProcurements().subscribe({
      next: (data) => {
        this.procurements = data || [];
      },
      error: (err) => {
        console.error('Greška pri učitavanju javnih nabavki:', err);
        this.errorMessage = 'Greška prilikom učitavanja otvorenih javnih nabavki.';
      }
    });
  }

  // Slanje ponude štamparije za izabranu javnu nabavku uz validaciju unete cene
  sendBid(procurementId: string): void {
    const price = this.offerPrices[procurementId];

    if (!price || price <= 0) {
      this.errorMessage = 'Morate uneti validnu cenu ponude.';
      this.successMessage = '';
      return;
    }

    const bidData = {
      printerId: this.printerId,
      printerName: this.printerName,
      totalOfferPrice: price
    };

    // Slanje ponude ka serveru i osvežavanje tabele po uspehu
    this.printerService.submitBid(procurementId, bidData).subscribe({
      next: (res: any) => {
        this.successMessage = res.message || 'Ponuda uspešno poslata!';
        this.errorMessage = '';
        this.loadOpenProcurements(); 

        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Greška prilikom slanja ponude.';
        this.successMessage = '';
      }
    });
  }

  // Povratak nazad na kontrolnu tablu štampara
  goBack(): void {
    this.router.navigate(['/printer-dashboard']); 
  }
}