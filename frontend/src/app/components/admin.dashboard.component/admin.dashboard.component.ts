import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-admin.dashboard.component',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './admin.dashboard.component.html',
  styleUrl: './admin.dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {

  pendingUsers: any[] = [];
  message: string = '';
  allUsers: any[] = [];
  selectedUser: any = null;

  categories: any[] = [];
  newCategoryName: string = '';
  selectedCategoryForSub: string = '';
  newSubcategoryName: string = '';
  categoryMessage: string = '';

  private userService = inject(UserService);
  private categoryService = inject(CategoryService);

  // Inicijalizacija komponente i učitavanje početnih podataka
  ngOnInit(): void {
    this.loadPendingUsers();
    this.loadAllUsers();
    this.loadCategories();
  }

  // Učitavanje lista korisnika koji čekaju odobrenje
  loadPendingUsers(): void {
    this.userService.getPendingUsers().subscribe({
      next: (data) => {
        this.pendingUsers = data;
      },
      error: (err) => {
        console.error('Greška pri učitavanju zahteva na čekanju', err);
      }
    });
  }

  // Učitavanje svih registrovanih korisnika u sistemu
  loadAllUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.allUsers = data;
      },
      error: (err) => {
        console.error('Greška pri učitavanju svih korisnika', err);
      }
    });
  }

  // Dohvatanje korisničkog imena trenutno ulogovanog korisnika iz lokalne memorije
  getCurrentUsername(): string {
    const loggedUser = localStorage.getItem('loggedUser');
    if (loggedUser) {
      try {
        const userObj = JSON.parse(loggedUser);
        return userObj.username || '';
      } catch (e) {
        return '';
      }
    }
    return '';
  }

  // Odobravanje registracije novog korisnika
  approve(username: string): void {
    this.userService.approveUser(username).subscribe({
      next: (res: any) => {
        this.message = res.message;
        this.loadPendingUsers(); // Osveži tabelu
      },
      error: (err) => {
        console.error('Greška pri odobravanju korisnika', err);
      }
    });
  }

  // Odbijanje registracije novog korisnika
  reject(username: string): void {
    this.userService.rejectUser(username).subscribe({
      next: (res: any) => {
        this.message = res.message;
        this.loadPendingUsers(); // Osveži tabelu
      },
      error: (err) => {
        console.error('Greška pri odbijanju korisnika', err);
      }
    });
  }

  // Brisanje korisnika od strane administratora
  deleteUser(username: string): void {
    if (confirm(`Da li ste sigurni da želite da obrišete korisnika ${username}?`)) {
      this.userService.deleteUserByAdmin(username).subscribe({
        next: (res: any) => {
          this.message = res.message;
          this.loadAllUsers();
          this.loadPendingUsers();
        },
        error: (err) => {
          console.error('Greška pri brisanju korisnika', err);
        }
      });
    }
  }

  // Priprema podataka izabranog korisnika za izmenu
  editUser(user: any): void {
    // Kopiramo podatke da ne menjamo direktno u tabeli pre čuvanja
    this.selectedUser = { ...user };
  }

  // Čuvanje izmena nad korisničkim podacima
  saveUserChanges(): void {
    this.userService.updateUserByAdmin(this.selectedUser).subscribe({
      next: (res: any) => {
        this.message = res.message;
        this.selectedUser = null;
        this.loadAllUsers();
      },
      error: (err) => {
        console.error('Greška pri ažuriranju korisnika', err);
      }
    });
  }

  // Učitavanje postojeće strukture kategorija
  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error('Greška pri učitavanju kategorija', err);
      }
    });
  }

  // Dodavanje nove glavne kategorije
  addNewCategory(): void {
    if (!this.newCategoryName.trim()) return;
    this.categoryService.addCategory(this.newCategoryName).subscribe({
      next: (res: any) => {
        this.categoryMessage = res.message;
        this.newCategoryName = '';
        this.loadCategories();
      },
      error: (err) => {
        console.error('Greška pri dodavanju kategorije', err);
      }
    });
  }

  // Dodavanje nove podkategorije u izabranu kategoriju
  addNewSubcategory(): void {
    if (!this.selectedCategoryForSub || !this.newSubcategoryName.trim()) return;
    this.categoryService.addSubcategory(this.selectedCategoryForSub, this.newSubcategoryName).subscribe({
      next: (res: any) => {
        this.categoryMessage = res.message;
        this.newSubcategoryName = '';
        this.loadCategories();
      },
      error: (err) => {
        console.error('Greška pri dodavanju podkategorije', err);
      }
    });
  }

}