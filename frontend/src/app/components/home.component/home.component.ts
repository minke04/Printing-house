import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PublicService } from '../../services/public.service';

@Component({
  selector: 'app-home.component',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit{
  totalPrinters: number = 0;
  topProducts: any[] = [];

  categories: string[] = [];
  searchName: string = '';
  selectedCategory: string = 'Sve kategorije';
  searchResults: any[] = [];

  sortAscending: boolean = true;

  private publicService = inject(PublicService);
  private router = inject(Router);

  // Inicijalizacija komponente, učitavanje statistike, top proizvoda, kategorija i početna pretraga
  ngOnInit(): void {
    this.loadTotalPrinters();
    this.loadTopProducts();
    this.loadActiveCategories();
    this.onSearch();
  }

  // Preuzimanje ukupnog broja štamparija sa servera
  loadTotalPrinters(): void {
    this.publicService.getTotalPrinters().subscribe({
      next: (res: any) =>{
        this.totalPrinters = res.totalPrinters;
      },
      error: (err) => console.error('Greška pri učitavanju broja štamparija', err)
    });
  }

  // Preuzimanje najbolje ocenjenih top proizvoda sa servera
  loadTopProducts(): void {
    this.publicService.getTopProducts().subscribe({
      next: (data) => {
        this.topProducts = data;
      },
      error: (err) => console.error('Greška pri učitavanju top proizvoda', err)
    });
  }

  // Učitavanje aktivnih kategorija proizvoda
  loadActiveCategories(): void {
    this.publicService.getActiveCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
      },
      error: (err) => console.error('Greška pri učitavanju kategorija', err)
    });
  }

  // Pretraga javnih proizvoda prema nazivu i izabranoj kategoriji
  onSearch(): void {
    this.publicService.searchProducts(this.searchName, this.selectedCategory).subscribe({
      next: (res) => {
        this.searchResults = res;
        this.sortProductsByName(true); // Inicijalizatorsko sortiranje
      },
      error: (err) => console.error('Greška pri pretrazi proizvoda', err)
    });
  }

  // Promena smera sortiranja rezultata pretrage (rastuće / opadajuće)
  sortTable(): void {
    this.sortAscending = !this.sortAscending;
    this.sortProductsByName(this.sortAscending);
  }

  // Pomoćna metoda za abecedno sortiranje proizvoda po nazivu
  private sortProductsByName(asc: boolean): void {
    this.searchResults.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA < nameB) return asc ? -1 : 1;
      if (nameA > nameB) return asc ? 1 : -1;
      return 0;
    });
  }

  // Preusmeravanje na stranicu sa detaljnim prikazom izabranog proizvoda
  viewDetails(productId: string): void {
    this.router.navigate(['/product-details', productId]);
  }

}