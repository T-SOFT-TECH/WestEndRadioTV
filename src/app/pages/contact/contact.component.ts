import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AutoAnimationDirective } from '../../Directives/auto-Animate.directive';
import { PocketbaseService } from '../../services/pocketbase.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { SiteService } from '../../services/site.service';

@Component({
  selector: 'app-contact',
  imports: [
    ReactiveFormsModule,
    AutoAnimationDirective
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {

  private fb = inject(FormBuilder);
  private pocketbase = inject(PocketbaseService);
  private siteService = inject(SiteService);
  private toast = inject(HotToastService);
  protected isSubmitting = signal(false);


  protected settings = this.siteService.settings;




  protected contactForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });

  async onSubmit() {
    if (this.contactForm.invalid) {
      this.toast.error('Please fill all required fields correctly');
      return;
    }

    this.isSubmitting.set(true);

    try {
      const formData = this.contactForm.value;

      await this.pocketbase.createContactMessage({
        firstName: formData.firstName!,
        lastName: formData.lastName!,
        email: formData.email!,
        subject: formData.subject!,
        message: formData.message!
      });

      this.contactForm.reset();
      this.toast.success('Message sent successfully! We\'ll get back to you soon.', {
        duration: 5000,
        position: 'bottom-center'
      });

    } catch (error) {
      console.error('Error submitting form:', error);
      this.toast.error('Failed to send message. Please try again.', {
        duration: 4000,
        position: 'bottom-center'
      });
    } finally {
      this.isSubmitting.set(false);
    }
  }

  // Helper methods for form validation
  protected isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  protected getErrorMessage(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (!field) return '';

    if (field.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (field.hasError('minlength')) {
      const requiredLength = field.errors?.['minlength'].requiredLength;
      return `Message must be at least ${requiredLength} characters long`;
    }
    return '';
  }

}
