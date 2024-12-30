import {Component, computed, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {NewsletterService} from '../../services/newsletter.service';
import {AppwriteService} from '../../services/appwrite.service';
import {HotToastService} from '@ngxpert/hot-toast';

interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

interface QuickLink {
  path: string;
  label: string;
}

@Component({
  selector: 'app-footer',
  imports: [
    RouterLink,
    ReactiveFormsModule
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {

  private fb = inject(FormBuilder);
  private readonly newsletter = inject(NewsletterService);
  appwrite = inject(AppwriteService);
  toast = inject(HotToastService);

  protected currentYear = new Date().getFullYear();
  protected isSubmitting = signal(false);
  protected showError = signal(false);

  protected newsletterForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],

  });

  protected readonly socialLinks: SocialLink[] = [
    // Add your social links here
  ];

  protected readonly quickLinks: QuickLink[] = [
    { path: '/shows', label: 'Our Shows' },
    { path: '/schedule', label: 'Schedule' },
    { path: '/news', label: 'News & Events' }
  ];

  protected readonly contactInfo = [
    {
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>`,
      label: '+1 234 567 890'
    },
    {
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>`,
      label: 'contact@westendradiotv.com'
    }
  ];

  protected readonly legalLinks: QuickLink[] = [
    { path: '/privacy', label: 'Privacy Policy' },
    { path: '/terms', label: 'Terms of Service' },
    { path: '/cookies', label: 'Cookie Policy' }
  ];

  protected async onSubscribe() {
    if (this.newsletterForm.invalid) return;

    this.isSubmitting.set(true);
    try {
      await this.appwrite.newsletterSubscribe(this.newsletterForm.value.email!);
      this.toast.success('Successfully subscribed to newsletter!');
      this.newsletterForm.reset();
    } catch (error) {
      this.toast.error('Failed to subscribe. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  protected readonly emailError = computed(() => {
    const control = this.newsletterForm.get('email');
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return 'Email is required';
      }
      if (control.errors['email']) {
        return 'Please enter a valid email';
      }
    }
    return null;
  });

}
