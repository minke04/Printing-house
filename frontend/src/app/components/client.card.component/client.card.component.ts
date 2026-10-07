import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientService } from '../../services/client.service';

@Component({
  selector: 'app-client-cart',
  imports: [CommonModule, FormsModule],
  templateUrl: './client.card.component.html'
})
export class ClientCardComponent implements OnInit {
    cartItems: any[] = [];
    groupedCart: any[] = [];
    grandTotal: number = 0;
  

    showCheckoutModal: boolean = false;
    paymentData = {
      cardType: 'Visa',
      cardNumber: '',
      expiryDate: '',
      cvc: ''
    };
    paymentError: boolean = false;
    paymentErrorMsg: string = '';
    lastProductId: string | null = null;

    private router = inject(Router);
    private clientService = inject(ClientService);

    // Inicijalizacija komponente i učitavanje stavki korpe
    ngOnInit(): void {
      this.loadCart();
    }

    // Učitavanje korpe iz lokalne memorije i grupisanje stavki
    loadCart(): void {
      this.cartItems = JSON.parse(localStorage.getItem('client_cart') || '[]');
      this.groupCartItems();

      // Pamćenje ID-ja poslednjeg dodatog proizvoda radi povratka na njegovu pripremu
      if (this.cartItems.length > 0) {
        const lastItem = this.cartItems[this.cartItems.length - 1];
        this.lastProductId = lastItem.productId;
        localStorage.setItem('last_product_id', this.lastProductId || '');
      } else {
        this.lastProductId = localStorage.getItem('last_product_id');
      }
    }

    // Preusmeravanje klijenta na pretragu radi izbora novih proizvoda
    goToSearch(): void {
      this.router.navigate(['/client-product-search']);
    }

    // Povratak na stranicu za pripremu poslednjeg unetog proizvoda
    goToPreparation(): void {
      if (this.lastProductId) {
        this.router.navigate(['/client-product-prep', this.lastProductId]);
      } else {
        alert('Nema sačuvanog proizvoda za povratak na pripremu.');
      }
    }

    // Grupisanje stavki iz korpe po štamparijama i računanje ukupnih iznosa
    groupCartItems(): void {
      const groups: { [key: string]: any } = {};
      this.grandTotal = 0;

      // Iteracija kroz sve stavke korpe i razvrstavanje po ID-ju štamparije
      this.cartItems.forEach(item => {
        if (!groups[item.printerId]) {
          groups[item.printerId] = {
            printerId: item.printerId,
            printerName: item.printerName,
            city: item.city || 'Beograd',
            items: [],
            printerTotal: 0
          };
        }
        groups[item.printerId].items.push(item);
        groups[item.printerId].printerTotal += item.totalPrice;
        this.grandTotal += item.totalPrice;
      });

      this.groupedCart = Object.values(groups);
    }

    // Uklanjanje izabrane stavke iz korpe i osvežavanje prikaza
    removeItem(item: any): void {
      this.cartItems = this.cartItems.filter(i => i !== item);
      localStorage.setItem('client_cart', JSON.stringify(this.cartItems));
      this.groupCartItems();
    }

    // Potvrda narudžbine na osnovu uloge korisnika (pravno lice kreira nabavku, fizičko plaća)
    confirmOrder(): void {
      const loggedUserStr = localStorage.getItem('loggedUser');
      let role = '';
      let username = 'firma_doo';

      if (loggedUserStr) {
        try {
          const user = JSON.parse(loggedUserStr);
          role = user.role;
          username = user.username;
        } catch (e) {
          console.error('Greška pri parsiranju ulogovanog korisnika', e);
        }
      }

      // Provera da li je u pitanju pravno lice ili fizičko lice
      if (role === 'pravno_lice') {
        const payload = {
          clientUsername: username,
          items: this.cartItems,
          totalAmount: this.grandTotal
        };

        // Slanje zahteva za kreiranje javne nabavke
        this.clientService.createPublicProcurement(payload).subscribe({
          next: (res) => {
            alert('Poziv za javnu nabavku je uspešno poslat štamparijama! Licitacija traje 10 minuta.');
            localStorage.removeItem('client_cart');
            this.router.navigate(['/client-procurements']);
          },
          error: (err) => {
            console.error('Greška pri pokretanju javne nabavke', err);
            alert('Greška pri kreiranju javne nabavke.');
          }
        });
      } else {
        // Otvaranje modala za plaćanje karticom za fizička lica
        this.openCheckoutModal();
      }
    }

    // Otvaranje modala za unos podataka o platnoj kartici
    openCheckoutModal(): void {
      this.paymentError = false;
      this.showCheckoutModal = true;
    }

    // Zatvaranje modala za plaćanje
    closeCheckoutModal(): void {
      this.showCheckoutModal = false;
    }

    // Procesuiranje plaćanja, validacija kartice i slanje narudžbine serveru
    processPaymentAndOrder(): void {
      const loggedUserStr = localStorage.getItem('loggedUser');
      let username = '';
  
      if (loggedUserStr) {
        try {
          const user = JSON.parse(loggedUserStr);
          username = user.username;
        } catch (e) {
          console.error('Greška pri parsiranju ulogovanog korisnika', e);
        }
      }

      // 1. Validacija unetih podataka u formu za plaćanje
      if (!this.paymentData.cardNumber || !this.paymentData.expiryDate || !this.paymentData.cvc) {
        this.paymentError = true;
        this.paymentErrorMsg = 'Molimo popunite sva polja za plaćanje.';
        return;
      }

      // 2. Simulacija odbijanja transakcije ukoliko broj kartice počinje sa '0000'
      if (this.paymentData.cardNumber.startsWith('0000')) {
        this.paymentError = true;
        this.paymentErrorMsg = 'Transakcija odbijena. Molimo ponovite korak plaćanja.';
        return;
      }

      // 3. Priprema podataka uspešne transakcije sa statusom plaćeno
      const orderPayload = {
        clientUsername: username,
        groupedItems: this.groupedCart,
        totalAmount: this.grandTotal,
        status: 'placeno' 
      };

      // Slanje zahteva za kreiranje narudžbina ka serveru
      this.clientService.createOrders(orderPayload).subscribe({
        next: (res) => {
          alert('Uspešno izvršeno plaćanje i kreirane fakture po štamparijama!');
          localStorage.removeItem('client_cart');
          this.showCheckoutModal = false;
          this.router.navigate(['/client-profile']); 
        },
        error: (err) => {
          console.error('Greška pri kreiranju narudžbina', err);
          this.paymentError = true;
          this.paymentErrorMsg = err.error?.message || 'Greška pri obradi narudžbine na serveru. Molimo ponovite korak.';
        }
      });
    }
}