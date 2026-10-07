import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../../services/client.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-client.product.details.component',
  imports: [FormsModule, CommonModule],
  templateUrl: './client.product.details.component.html',
  styleUrl: './client.product.details.component.css',
})
export class ClientProductDetailsComponent implements OnInit {
  productId: string = '';
  product: any = null;
  selectedColor: string = 'bela';
  selectedPrintService: any = null;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clientService = inject(ClientService);

  // Inicijalizacija komponente, preuzimanje ID-ja proizvoda iz rute i učitavanje detalja
  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id') || '';
    if (this.productId) {
      this.loadProductDetails();
    }
  }

  // Preuzimanje detaljnih podataka o proizvodu sa servera i postavljanje podrazumevane boje
  loadProductDetails(): void {
    this.clientService.getProductDetails(this.productId).subscribe({
      next: (res) => {
        this.product = res;
        // Postavljanje prve dostupne boje ili podrazumevane vrednosti 'bela'
        if (this.product.availableColors && this.product.availableColors.length > 0) {
          this.selectedColor = this.product.availableColors[0];
        } else {
          this.selectedColor = 'bela';
        }
      },
      error: (err) => console.error('Greška pri učitavanju detalja proizvoda', err)
    });
  }

  // Povratak nazad na stranicu pretrage proizvoda
  goBack(): void {
    this.router.navigate(['/client-product-search']); 
  }

  // Prelazak na sledeći korak (pripremu proizvoda) uz prosleđivanje izabranih parametara
  goToNext(): void {
    this.router.navigate(['/client-product-prep', this.productId], {
      queryParams: {
        color: this.selectedColor,
        printType: JSON.stringify(this.selectedPrintService)
      }
    });
  }
}