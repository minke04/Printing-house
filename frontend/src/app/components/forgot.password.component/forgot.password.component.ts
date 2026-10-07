import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot.password.component',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot.password.component.html',
  styleUrl: './forgot.password.component.css',
})
export class ForgotPasswordComponent {
  input = '';
  message = '';
  resetLink = ''; // <--- promenljiva u koju čuvamo link sa servera

  private userService = inject(UserService);

  submit() {
    this.userService.forgotPassword(this.input).subscribe({
      next: (res: any) => {
        this.message = res.message;
        this.resetLink = res.resetLink; // <--- dodeljujemo link dobijen od bekenda
      },
      error: (err) => {
        this.message = err.error.message || 'Došlo je do greške';
        this.resetLink = '';
      }
    });
  }
}