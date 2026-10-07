import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-client.procurements.component',
  imports: [FormsModule, CommonModule],
  templateUrl: './client.procurements.component.html',
  styleUrl: './client.procurements.component.css',
})
export class ClientProcurementsComponent implements OnInit {
  procurements: any[] = []; 
  private clientService = inject(ClientService);
  private router = inject(Router);

  // Inicijalizacija komponente i učitavanje javnih nabavki
  ngOnInit(): void {
    this.loadProcurements();
  }

  // Učitavanje javnih nabavki za ulogovanog klijenta sa servera
  loadProcurements(): void {
    const loggedUserStr = localStorage.getItem('loggedUser');
    let username = ' ';
    
    // Parsiranje korisničkog imena iz lokalne memorije ukoliko postoji
    if (loggedUserStr) {
      try {
        username = JSON.parse(loggedUserStr).username;
      } catch (e) {}
    }

    // Poziv servisa za preuzimanje javnih nabavki
    this.clientService.getPublicProcurements(username).subscribe({
      next: (data) => {
        this.procurements = data || [];
      },
      error: (err) => {
        console.error('Greška pri učitavanju javnih nabavki', err);
        this.procurements = [];
      }
    });
  }

  // Povratak nazad na stranicu korpe
  goBack(): void {
    this.router.navigate(['/client-dashboard']); 
  }
}