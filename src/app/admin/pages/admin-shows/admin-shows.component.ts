import {Component, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {AppwriteService} from '../../../services/appwrite.service';
import {environment} from '../../../../environments/environment';
import {Show} from '../../../model/show.model';

@Component({
  selector: 'app-admin-shows',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './admin-shows.component.html',
  styleUrl: './admin-shows.component.scss'
})
export class AdminShowsComponent {

  private appwrite = inject(AppwriteService);
  private fb = inject(FormBuilder);

  protected shows = signal<Show[]>([]);
  protected showModal = signal(false);
  protected isSubmitting = signal(false);
  protected editingShow = signal<Show | null>(null);
  protected imagePreview = signal<string | null>(null);
  protected selectedFile: File | null = null;

  protected weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  protected showForm = this.fb.group({
    title: ['', Validators.required],
    host: ['', Validators.required],
    description: [''],
    startTime: ['', Validators.required],
    endTime: ['', Validators.required],
    monday: [false],
    tuesday: [false],
    wednesday: [false],
    thursday: [false],
    friday: [false],
    saturday: [false],
    sunday: [false],
    featured: [false],
    active: [true]
  });

  async ngOnInit() {
    await this.loadShows();
  }

  protected async loadShows() {
    try {
      const response = await this.appwrite.getShows();
      // Map Appwrite documents to Show interface
      const shows: Show[] = response.documents.map(doc => ({
        $id: doc.$id,
        title: doc['title'],
        host: doc['host'],
        description: doc['description'],
        startTime: doc['startTime'],
        endTime: doc['endTime'],
        days: doc['days'],
        imageId: doc['imageId'],
        active: doc['active'],
        featured: doc['featured']
      }));

      this.shows.set(shows);
    } catch (error) {
      console.error('Error loading shows:', error);
      // Handle error (show notification, etc.)
    }
  }

  protected openShowForm() {
    this.showForm.reset({ active: true });
    this.editingShow.set(null);
    this.imagePreview.set(null);
    this.selectedFile = null;
    this.showModal.set(true);
  }

  protected closeShowForm() {
    this.showModal.set(false);
    this.showForm.reset();
    this.editingShow.set(null);
    this.imagePreview.set(null);
    this.selectedFile = null;
  }

  protected editShow(show: Show) {
    this.editingShow.set(show);

    // Set form values
    this.showForm.patchValue({
      title: show.title,
      host: show.host,
      description: show.description || '',
      startTime: show.startTime,
      endTime: show.endTime,
      monday: show.days.includes('monday'),
      tuesday: show.days.includes('tuesday'),
      wednesday: show.days.includes('wednesday'),
      thursday: show.days.includes('thursday'),
      friday: show.days.includes('friday'),
      saturday: show.days.includes('saturday'),
      sunday: show.days.includes('sunday'),
      featured: show.featured,
      active: show.active
    });

    // Set image preview if exists
    if (show.imageId) {
      this.imagePreview.set(this.appwrite.getFileView(show.imageId));
    }

    this.showModal.set(true);
  }

  protected async saveShow() {
    if (this.showForm.invalid) return;

    this.isSubmitting.set(true);
    try {
      let imageId = this.editingShow()?.imageId;

      // Upload new image if selected
      if (this.selectedFile) {
        const uploadedFile = await this.appwrite.uploadFile(this.selectedFile);
        imageId = uploadedFile.$id;
      }

      // Get selected days
      const days = Object.entries(this.showForm.value)
        .filter(([key, value]) =>
          ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            .includes(key) && value
        )
        .map(([key]) => key);

      const showData = {
        title: this.showForm.value.title!,
        host: this.showForm.value.host!,
        description: this.showForm.value.description!,
        startTime: this.showForm.value.startTime!,
        endTime: this.showForm.value.endTime!,
        days,
        featured: this.showForm.value.featured!,
        active: this.showForm.value.active!,
        imageId
      };

      if (this.editingShow()) {
        await this.appwrite.updateShow(this.editingShow()!.$id!, showData);
      } else {
        await this.appwrite.createShow(showData);
      }

      await this.loadShows();
      this.closeShowForm();

    } catch (error) {
      console.error('Error saving show:', error);
      // Handle error (show notification, etc.)
    } finally {
      this.isSubmitting.set(false);
    }
  }

  protected async deleteShow(showId: string) {
    if (!confirm('Are you sure you want to delete this show?')) return;

    try {
      await this.appwrite.deleteShow(showId);
      await this.loadShows();
    } catch (error) {
      console.error('Error deleting show:', error);
      // Handle error (show notification, etc.)
    }
  }

  protected onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  protected removeImage(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.imagePreview.set(null);
    this.selectedFile = null;
    const editingShow = this.editingShow();
    if (editingShow) {
      editingShow.imageId = undefined;
    }
  }

  protected getImageUrl(imageId: string ): string {
    return this.appwrite.getFileView(imageId);
  }

  protected formatDays(days: string[]): string {
    return days
      .map(day => day.charAt(0).toUpperCase() + day.slice(1))
      .join(', ');
  }

}
