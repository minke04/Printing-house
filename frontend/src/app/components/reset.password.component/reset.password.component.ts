import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-reset.password.component',
  imports: [FormsModule,CommonModule,RouterLink],
  templateUrl: './reset.password.component.html',
  styleUrl: './reset.password.component.css',
})
export class ResetPasswordComponent implements OnInit {
  newPassword = '';
  message = '';
  token = '';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);

  ngOnInit() {
    // Uzima token iz linka (npr. /reset-password/OVDE_JE_TOKEN)
    this.token = this.route.snapshot.paramMap.get('token') || '';
  }

  submitNewPassword() {
    this.userService.resetPassword(this.token, this.newPassword).subscribe({
      next: (res: any) => {
        this.message = res.message;
        // Nakon uspešne promene, prebaci korisnika na login posle 2 sekunde
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.message = err.error.message || 'Došlo je do greške';
      }
    });
  }
}
