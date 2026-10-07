import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PrinterService } from '../../services/printer.service';
import { CategoryService } from '../../services/category.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-printer.add.product.component',
  imports: [FormsModule, CommonModule],
  templateUrl: './printer.add.product.component.html',
  styleUrl: './printer.add.product.component.css',
})
export class PrinterAddProductComponent implements OnInit {
  categoriesFromDb: any[] = [];          // Svi originalni objekti kategorija iz baze
  categories: string[] = [];              // Nazivi glavnih kategorija za prvi padajući meni
  availableSubcategories: string[] = [];  // Nazivi podkategorija za izabranu kategoriju
  selectedFile: File | null = null;
  private router = inject(Router);

  product: any = {
    printerId: '',
    printerName: '',
    city: 'Beograd',
    code: '',
    name: '',
    description: '',
    category: '',
    subcategory: '',
    unitPrice: 0,
    stockQuantity: 0,
    availableColorsStr: '', 
    imageUrl: '',
    printServices: []
  };

  newService: any = {
    serviceId: '',
    printType: '',
    additionalPricePerPiece: 0
  };

  successMessage: string = '';
  errorMessage: string = '';
  private printerService = inject(PrinterService);
  private categoryService = inject(CategoryService);

  // Inicijalizacija komponente, preuzimanje ulogovanog štampara i učitavanje kategorija
  ngOnInit(): void {
    const loggedUserStr = localStorage.getItem('loggedUser');
    if (loggedUserStr) {
      try {
        const user = JSON.parse(loggedUserStr);
        console.log(user);
        
        // 1. Postavljanje identifikatora i naziva štamparije iz podataka ulogovanog korisnika
        this.product.printerId = user.username;
        console.log(this.product.printerId);
        
        this.product.printerName = user.institutionName;
        console.log(this.product.printerName);

      } catch (e) {
        console.error("Greška pri parsiranju ulogovanog korisnika iz lokalne memorije", e);
      }
    } else {
      // Rezervne vrednosti ukoliko se stranica otvori direktno bez prijave
      this.product.printerId = 'stampar1';
      this.product.printerName = 'Copy Studio Kumanovska';
    }

    // 2. Dinamičko učitavanje kategorija i podkategorija sa servera
    this.loadCategories(); 
  }

  // Preuzimanje strukture kategorija iz baze podataka
  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data: any[]) => {
        this.categoriesFromDb = data;
        this.categories = data.map(c => c.name);

        if (this.categories.length > 0) {
          this.product.category = this.categories[0];
          this.onCategoryChange(); // Inicijalno postavljanje podkategorija za prvu kategoriju
        }
      },
      error: (err) => {
        this.errorMessage = 'Greška pri učitavanju kategorija iz baze.';
      }
    });
  }

  // Ažuriranje dostupnih podkategorija na osnovu izabrane glavne kategorije
  onCategoryChange(): void {
    const selectedCatObj = this.categoriesFromDb.find(c => c.name === this.product.category);
    if (selectedCatObj) {
      this.availableSubcategories = (selectedCatObj.subcategories || []).map((sub: any) => sub.name);
      
      if (this.availableSubcategories.length > 0) {
        this.product.subcategory = this.availableSubcategories[0];
      } else {
        this.product.subcategory = '';
      }
    }
  }

  // Evidentiranje izabranog fajla slike za proizvod
  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  // Dodavanje nove usluge štampe u lokalnu listu usluga za proizvod
  addPrintService(): void {
    if (!this.newService.serviceId || !this.newService.printType) {
      alert('Unesite ID usluge i tip štampe.');
      return;
    }
    this.product.printServices.push({ ...this.newService });
    this.newService = { serviceId: '', printType: '', additionalPricePerPiece: 0 };
  }

  // Uklanjanje izabrane usluge štampe iz liste
  removeService(index: number): void {
    this.product.printServices.splice(index, 1);
  }

  // Slanje kompletne forme sa fajlom i podacima o proizvodu ka serveru
  onSubmit(): void {
    const formData = new FormData();

    formData.append('printerId', this.product.printerId);
    formData.append('printerName', this.product.printerName);
    formData.append('code', this.product.code);
    formData.append('name', this.product.name);
    formData.append('description', this.product.description);
    formData.append('category', this.product.category);
    formData.append('subcategory', this.product.subcategory);
    formData.append('unitPrice', this.product.unitPrice.toString());
    formData.append('stockQuantity', this.product.stockQuantity.toString());

    // Obrada i dodavanje dostupnih boja u JSON formatu
    if (this.product.availableColorsStr) {
      const colorsArray = this.product.availableColorsStr.split(',').map((c: string) => c.trim());
      formData.append('availableColors', JSON.stringify(colorsArray));
    }

    // Dodavanje dodatnih usluga štampe kao JSON string
    formData.append('printServices', JSON.stringify(this.product.printServices));

    // Pridruživanje fajla slike ukoliko je uspešno izabran
    if (this.selectedFile) {
      formData.append('imageUrl', this.selectedFile);
    }

    // Slanje zahteva za dodavanje novog proizvoda
    this.printerService.addProduct(formData).subscribe({
      next: (res) => {
        this.successMessage = 'Proizvod je uspešno dodat u sistem!';
        this.errorMessage = '';
        // Resetovanje unosa u formi
        this.product.code = '';
        this.product.name = '';
        this.product.description = '';
        this.product.unitPrice = 0;
        this.product.stockQuantity = 0;
        this.product.availableColorsStr = '';
        this.selectedFile = null;
        this.product.printServices = [];
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Greška prilikom dodavanja proizvoda.';
        this.successMessage = '';
      }
    });
  } 
  
  // Povratak nazad na kontrolnu tablu štampara
  goBack(): void {
    this.router.navigate(['/printer-dashboard']); 
  }
}