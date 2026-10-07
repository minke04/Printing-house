import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { PrinterService } from '../../services/printer.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-printer.import.json.component',
  imports: [FormsModule, CommonModule],
  templateUrl: './printer.import.json.component.html',
  styleUrl: './printer.import.json.component.css',
})
export class PrinterImportJsonComponent {
  importedData: any = null;
  successMessage: string = '';
  errorMessage: string = '';

  private printerService = inject(PrinterService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // Učitavanje, parsiranje JSON fajla i filtriranje proizvoda ulogovanog štampara
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
        try {
            const jsonContent = JSON.parse(e.target.result);
            
            // 1. Preuzimanje identifikatora i naziva ulogovanog štampara iz lokalne memorije
            const loggedUserStr = localStorage.getItem('loggedUser');
            let currentPrinterId = '';
            let currentPrinterName = '';

            if (loggedUserStr) {
                const user = JSON.parse(loggedUserStr);
                currentPrinterId = user.username; 
                currentPrinterName = user.institutionName || user.name;
            }

            // 2. Provera strukture i izdvajanje niza proizvoda iz JSON sadržaja
            let allProducts = [];
            if (Array.isArray(jsonContent)) {
                allProducts = jsonContent;
            } else if (jsonContent.proizvodi && Array.isArray(jsonContent.proizvodi)) {
                allProducts = jsonContent.proizvodi;
            }

            // 3. Filtriranje isključivo onih proizvoda koji pripadaju ulogovanom štamparu
            const filteredProducts = allProducts.filter((p: any) => p.printerId === currentPrinterId);

            if (filteredProducts.length === 0) {
                this.errorMessage = `U izabranom JSON fajlu ne postoje proizvodi za vaš nalog (${currentPrinterId}).`;
                this.importedData = null;
                this.cdr.detectChanges();
                return;
            }

            // 4. Formiranje strukturiranog objekta za prikaz u tabeli
            this.importedData = {
                printerId: currentPrinterId,
                nazivStamparije: currentPrinterName,
                proizvodi: filteredProducts
            };

            this.successMessage = `Uspešno učitano ${filteredProducts.length} vaših proizvoda. Tuđi proizvodi su automatski filtrirani.`;
            this.errorMessage = '';
            this.cdr.detectChanges();

        } catch (err) {
            this.errorMessage = 'Greška pri parsiranju JSON fajla. Proverite strukturu fajla.';
            this.importedData = null;
            this.cdr.detectChanges();
        }
    };
    reader.readAsText(file);
  }

  // Dodavanje ili promena glavne slike za specifičan proizvod unutar tabele
  onProductImageSelected(event: any, product: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        product.slikaUrl = reader.result as string; // Postavljanje Base64 stringa slike
      };
      reader.readAsDataURL(file);
    }
  }

  // Slanje kompletne uvezene i modifikovane liste proizvoda ka serveru
  saveImportedProducts(): void {
    if (!this.importedData || !this.importedData.proizvodi) {
      this.errorMessage = 'Nema proizvoda za čuvanje.';
      return;
    }

    this.printerService.importProducts(this.importedData).subscribe({
      next: (res) => {
        this.successMessage = 'Lager lista je uspešno sačuvana u bazi!';
        this.errorMessage = '';
        setTimeout(() => {
          this.router.navigate(['/printer-dashboard']); // Vraćanje na kontrolnu tablu štampara
        }, 2000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Greška prilikom čuvanja uvezene liste.';
        this.successMessage = '';
      }
    });
  }

  // Povratak nazad na kontrolnu tablu štampara
  goBack(): void {
    this.router.navigate(['/printer-dashboard']); 
  }
}