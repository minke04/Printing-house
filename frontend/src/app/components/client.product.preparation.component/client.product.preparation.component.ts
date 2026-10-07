import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../../services/client.service';

@Component({
  selector: 'app-client.product.preparation.component',
  imports: [FormsModule, CommonModule],
  templateUrl: './client.product.preparation.component.html',
  styleUrl: './client.product.preparation.component.css',
})
export class ClientProductPreparationComponent implements OnInit {
  product: any = {}; 

  customText: string = '';
  customImage: string | ArrayBuffer | null = null;
  quantity: number = 1;
  selectedPrintService: any = null;
  stockError: boolean = false;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clientService = inject(ClientService); 

  // Inicijalizacija komponente i preuzimanje ID-ja proizvoda za pripremu
  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProductDetails(productId);
    }
  }

  // Preuzimanje detalja proizvoda sa servera i postavljanje podrazumevane usluge štampe
  loadProductDetails(id: string): void {
    this.clientService.getProductDetails(id).subscribe({
      next: (res) => {
        this.product = res; 
        if (this.product.printServices && this.product.printServices.length > 0) {
          this.selectedPrintService = this.product.printServices[0];
        }
      },
      error: (err) => console.error('Greška pri učitavanju detalja proizvoda za pripremu', err)
    });
  }

  // Učitavanje i konvertovanje izabrane slike u Base64 format preko FileReader API-ja
  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.customImage = reader.result;
      };
    }
  }

  // Provera da li uneta količina premašuje raspoloživi lager
  checkStock(): void {
    if (this.quantity > (this.product.stockQuantity || 0)) {
      this.stockError = true;
    } else {
      this.stockError = false;
    }
  }

  // Računanje ukupne cene na osnovu osnovne cene, dodataka i količine
  calculateTotal(): number {
    const basePrice = this.product.unitPrice || 0;
    const addPrice = this.selectedPrintService ? (this.selectedPrintService.additionalPricePerPiece || 0) : 0;
    return (basePrice + addPrice) * (this.quantity || 1);
  }

  // Dodavanje pripremljenog proizvoda u e-korpu smeštenu u lokalnoj memoriji
  addToCart(): void {
    if (this.stockError) return;

    const cartItem = {
      productId: this.product._id, 
      code: this.product.code,
      name: this.product.name,
      printerId: this.product.printerId,
      printerName: this.product.printerName,
      city: this.product.city,
      quantity: this.quantity,
      unitPrice: this.product.unitPrice,
      printType: this.selectedPrintService ? this.selectedPrintService.printType : 'Standard',
      additionalPrice: this.selectedPrintService ? this.selectedPrintService.additionalPricePerPiece : 0,
      totalPrice: this.calculateTotal(),
      customText: this.customText,
      hasCustomImage: !!this.customImage
    };

    // Preuzimanje postojeće korpe, dodavanje nove stavke i čuvanje nazad
    let cart = JSON.parse(localStorage.getItem('client_cart') || '[]');
    cart.push(cartItem);
    localStorage.setItem('client_cart', JSON.stringify(cart));

    // Pamćenje ID-ja poslednjeg proizvoda radi lakšeg povratka
    localStorage.setItem('last_product_id', this.product._id);

    alert('Proizvod je uspešno dodat u e-korpu!');
    this.router.navigate(['/client-cart']);
  }

  // Resetovanje forme za prilagođavanje na početne vrednosti
  onReset(): void {
    this.customText = '';
    this.customImage = null;
    this.quantity = 1;
    this.stockError = false;
    if (this.product.printServices && this.product.printServices.length > 0) {
      this.selectedPrintService = this.product.printServices[0];
    }
  }

  // Povratak nazad na stranicu sa detaljima proizvoda
  onBack(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    this.router.navigate(['client-product-details', productId]);
  }
}