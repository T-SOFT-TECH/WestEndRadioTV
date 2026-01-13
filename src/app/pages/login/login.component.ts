import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HotToastService } from '@ngxpert/hot-toast';
import { PocketbaseService } from '../../services/pocketbase.service';
import { Router } from '@angular/router';
import { AutoAnimationDirective } from '../../Directives/auto-Animate.directive';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    AutoAnimationDirective
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  private fb = inject(FormBuilder);
  private pocketbase = inject(PocketbaseService);
  private router = inject(Router);
  private toast = inject(HotToastService);

  protected showPassword = false;
  protected isSubmitting = signal(false);

  protected loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: [false]
  });

  protected togglePassword() {
    this.showPassword = !this.showPassword;
  }

  protected async onSubmit() {
    if (this.loginForm.invalid) return;

    this.isSubmitting.set(true);
    try {
      const { email, password } = this.loginForm.value;
      await this.pocketbase.login(email!, password!);

      this.toast.success('Successfully logged in');
      await this.router.navigate(['/admin']);
    } catch (error: any) {
      this.toast.error('Invalid email or password');
      console.error('Login error:', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

}
