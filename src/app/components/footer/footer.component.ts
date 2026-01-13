// footer.component.ts
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NewsletterService } from '../../services/newsletter.service';
import { PocketbaseService } from '../../services/pocketbase.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { SiteService } from "../../services/site.service";

@Component({
  selector: 'app-footer',
  imports: [
    RouterLink,
    ReactiveFormsModule
  ],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  private fb = inject(FormBuilder);
  private readonly newsletter = inject(NewsletterService);
  pocketbase = inject(PocketbaseService);
  toast = inject(HotToastService);
  protected siteService = inject(SiteService);

  protected currentYear = new Date().getFullYear();
  protected isSubmitting = signal(false);
  protected settings = this.siteService.settings;

  protected newsletterForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  protected async onSubscribe() {
    if (this.newsletterForm.invalid) return;

    this.isSubmitting.set(true);
    try {
      await this.pocketbase.newsletterSubscribe(this.newsletterForm.value.email!);
      this.toast.success('Successfully subscribed to newsletter!');
      this.newsletterForm.reset();
    } catch (error) {
      this.toast.error('Failed to subscribe. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
