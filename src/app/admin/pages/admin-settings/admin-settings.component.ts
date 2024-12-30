// admin-settings.component.ts
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppwriteService } from '../../../services/appwrite.service';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-settings.component.html'
})
export class AdminSettingsComponent implements OnInit {
  private appwrite = inject(AppwriteService);
  private fb = inject(FormBuilder);
  private toast = inject(HotToastService);

  protected isSubmitting = signal(false);
  protected heroPreview = signal<string | null>(null);
  protected selectedFile: File | null = null;
  protected formChanged = signal(false);
  protected imageChanged = signal(false);

  protected settingsForm = this.fb.group({
    // Basic Settings
    stationName: [''],
    stationSlogan: [''],
    streamUrl: [''],

    // Hero Section - no longer nested
    heroImage: [null as string | null],
    heroTitle: [''],
    heroSubtitle: [''],

    // Contact Information - remains nested
    contactInfo: this.fb.group({
      email: ['', [ Validators.email]],
      phone: [''],
      address: [''],
      businessHours: [''],
      supportEmail: ['', Validators.email]
    }),

    // Social Media Links - remains nested
    socialLinks: this.fb.group({
      facebookUrl: [''],
      twitterUrl: [''],
      instagramUrl: [''],
      youtubeUrl: ['']
    })
  });

  private initialValues: any = {};

  constructor() {
    this.settingsForm.valueChanges.subscribe(() => {
      this.formChanged.set(true);
    });
  }

  async ngOnInit() {
    await this.loadSettings();
  }

  protected async loadSettings() {
    try {
      const settings = await this.appwrite.getSettings();

      // Update form values
      this.settingsForm.patchValue({
        stationName: settings['stationName'] || '',
        stationSlogan: settings['stationSlogan'] || '',
        streamUrl: settings['streamUrl'] || '',
        heroImage: settings['heroImage'] || null,
        heroTitle: settings['heroTitle'] || '',
        heroSubtitle: settings['heroSubtitle'] || '',

        contactInfo: {
          email: settings['email'] || '',
          phone: settings['phone'] || '',
          address: settings['address'] || '',
          businessHours: settings['businessHours'] || '',
          supportEmail: settings['supportEmail'] || ''
        },

        socialLinks: {
          facebookUrl: settings['facebookUrl'] || '',
          twitterUrl: settings['twitterUrl'] || '',
          instagramUrl: settings['instagramUrl'] || '',
          youtubeUrl: settings['youtubeUrl'] || ''
        }
      });

      if (settings['heroImage']) {
        this.heroPreview.set(this.appwrite.getFileView(settings['heroImage']));
      }

      this.initialValues = this.settingsForm.value;
      this.formChanged.set(false);
      this.imageChanged.set(false);

    } catch (error) {
      this.toast.error('Error loading settings');
      console.error('Error loading settings:', error);
    }
  }

  protected async saveSettings() {
    if (!this.hasChanges() || this.settingsForm.invalid) return;

    this.isSubmitting.set(true);
    try {
      let heroImageId = this.settingsForm.get('heroImage')?.value;

      if (this.selectedFile) {
        const uploadedFile = await this.appwrite.uploadFile(this.selectedFile);
        heroImageId = uploadedFile.$id;
      }

      const formValue = this.settingsForm.value;
      const settingsData = {
        stationName: formValue.stationName,
        stationSlogan: formValue.stationSlogan,
        streamUrl: formValue.streamUrl,
        heroImage: heroImageId,
        heroTitle: formValue.heroTitle,
        heroSubtitle: formValue.heroSubtitle,

        // Contact info
        email: formValue.contactInfo?.email,
        phone: formValue.contactInfo?.phone,
        address: formValue.contactInfo?.address,
        businessHours: formValue.contactInfo?.businessHours,
        supportEmail: formValue.contactInfo?.supportEmail,

        // Social links
        facebookUrl: formValue.socialLinks?.facebookUrl,
        twitterUrl: formValue.socialLinks?.twitterUrl,
        instagramUrl: formValue.socialLinks?.instagramUrl,
        youtubeUrl: formValue.socialLinks?.youtubeUrl
      };

      await this.appwrite.updateSettings(settingsData);
      this.toast.success('Settings updated successfully');

      this.initialValues = this.settingsForm.value;
      this.formChanged.set(false);
      this.imageChanged.set(false);

    } catch (error) {
      this.toast.error('Error saving settings');
      console.error('Error saving settings:', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  protected resetSettings() {
    this.settingsForm.patchValue(this.initialValues);
    this.heroPreview.set(this.initialValues.heroImage ?
      this.appwrite.getFileView(this.initialValues.heroImage) : null);
    this.selectedFile = null;
    this.formChanged.set(false);
    this.imageChanged.set(false);
  }

  protected onHeroImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile = file;
      this.imageChanged.set(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        this.heroPreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  protected removeHeroImage(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.heroPreview.set(null);
    this.selectedFile = null;
    this.settingsForm.get('heroImage')?.setValue(null);
    this.imageChanged.set(true);
  }

  protected hasChanges = computed(() => {
    return this.formChanged() || this.imageChanged();
  });

  protected testStream() {
    const streamUrl = this.settingsForm.get('streamUrl')?.value;
    if (streamUrl) {
      // Implement stream testing logic
      console.log('Testing stream:', streamUrl);
    }
  }
}
