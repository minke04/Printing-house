import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-client.product.search.component',
  imports: [FormsModule, CommonModule],
  templateUrl: './client.product.search.component.html',
  styleUrl: './client.product.search.component.css',
})
export class ClientProductSearchComponent implements OnInit {
  searchName: string = '';
  selectedCategory: string = 'all';
  products: any[] = [];

  private clientService = inject(ClientService);
  private router = inject(Router);

  categories: any[] = [];

  // Inicijalizacija komponente, učitavanje kategorija i početna pretraga proizvoda
  ngOnInit(): void {
    this.loadCategories();
    this.search();
  }

  // Preuzimanje dostupnih kategorija sa servera
  loadCategories(): void {
    this.clientService.getCategories().subscribe({
      next: (res) => { this.categories = res; },
      error: (err) => console.error('Greška pri učitavanju kategorija', err)
    });
  }

  // Pretraga proizvoda na osnovu unetog naziva i izabrane kategorije
  search(): void {
    this.clientService.searchProducts(this.searchName, this.selectedCategory).subscribe({
      next: (res) => {
        this.products = res;
      },
      error: (err) => console.error('Greška pri pretrazi proizvoda', err)
    });
  }

  // Preusmeravanje na stranicu sa detaljima izabranog proizvoda
  goToDetails(productId: string): void {
    this.router.navigate(['/client-product-details', productId]);
  }

  // Povratak nazad na kontrolnu tablu klijenta
  goBack(): void {
    this.router.navigate(['/client-dashboard']); 
  }
}