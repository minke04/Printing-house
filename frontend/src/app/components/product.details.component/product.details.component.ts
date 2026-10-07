import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-product.details.component',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product.details.component.html',
  styleUrl: './product.details.component.css',
})
export class ProductDetailsComponent implements OnInit {
  product: any = null;
  extractedCity: string = ''; // Čuvanje izdvojenog grada iz adrese

  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  // Inicijalizacija komponente, preuzimanje identifikatora iz rute i dohvatanje detalja proizvoda sa servera
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.get(`http://localhost:4000/products/product-details/${id}`).subscribe({
        next: (res: any) => {
          this.product = res;
          console.log("Podaci o proizvodu:", this.product);
          // Izdvajanje grada iz adrese (pretpostavljeni format je "Ulica, Grad")
          this.extractCityFromAddress(this.product.address);
        },
        error: (err) => console.error('Greška pri učitavanju detalja proizvoda:', err)
      });
    }
  }

  // Izdvajanje naziva grada iz prosleđenog stringa adrese na osnovu zareza
  extractCityFromAddress(address: string): void {
    if (address && address.includes(',')) {
      const parts = address.split(',');
      // Uzimanje poslednjeg dela adrese uz uklanjanje suvišnih razmaka
      this.extractedCity = parts[parts.length - 1].trim();
    } else {
      this.extractedCity = address || 'Nepoznat grad';
    }
  }
}