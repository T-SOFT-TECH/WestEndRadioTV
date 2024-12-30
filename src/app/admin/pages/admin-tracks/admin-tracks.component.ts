import {Component, inject, signal} from '@angular/core';
import {AppwriteService} from '../../../services/appwrite.service';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {environment} from '../../../../environments/environment';

interface Track {
  $id?: string;
  title: string;
  artist: string;
  albumName?: string;
  coverImageId?: string;
  playedAt: string;
  show: string; // Reference to show ID
}

@Component({
  selector: 'app-admin-tracks',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './admin-tracks.component.html',
  styleUrl: './admin-tracks.component.scss'
})
export class AdminTracksComponent {
  private appwrite = inject(AppwriteService);
  private fb = inject(FormBuilder);

  protected tracks = signal<Track[]>([]);
  protected shows = signal<any[]>([]);
  protected showModal = signal(false);
  protected isSubmitting = signal(false);
  protected editingTrack = signal<Track | null>(null);
  protected imagePreview = signal<string | null>(null);
  protected selectedFile: File | null = null;

  protected trackForm = this.fb.group({
    title: ['', Validators.required],
    artist: ['', Validators.required],
    albumName: [''],
    show: ['', Validators.required],
    coverImageId: ['']
  });

  async ngOnInit() {
    await Promise.all([
      this.loadTracks(),
      this.loadShows()
    ]);
  }

  protected async loadTracks() {
    try {
      const response = await this.appwrite.getTracks();
      // Cast the response documents to Track type
      const tracks = response.documents as unknown as Track[];
      this.tracks.set(tracks);
    } catch (error) {
      console.error('Error loading tracks:', error);
    }
  }

  protected async loadShows() {
    try {
      const response = await this.appwrite.getShows();
      this.shows.set(response.documents);
    } catch (error) {
      console.error('Error loading shows:', error);
    }
  }

  protected openTrackForm() {
    this.trackForm.reset();
    this.editingTrack.set(null);
    this.imagePreview.set(null);
    this.selectedFile = null;
    this.showModal.set(true);
  }

  protected closeTrackForm() {
    this.showModal.set(false);
    this.trackForm.reset();
    this.editingTrack.set(null);
    this.imagePreview.set(null);
    this.selectedFile = null;
  }

  protected editTrack(track: Track) {
    this.editingTrack.set(track);
    this.trackForm.patchValue({
      title: track.title,
      artist: track.artist,
      albumName: track.albumName || '',
      show: track.show,
      coverImageId: track.coverImageId || ''
    });

    if (track.coverImageId) {
      this.imagePreview.set(this.getImageUrl(track.coverImageId));
    }

    this.showModal.set(true);
  }

  protected async saveTrack() {
    if (this.trackForm.invalid) return;

    this.isSubmitting.set(true);
    try {
      let coverImageId = this.editingTrack()?.coverImageId;

      if (this.selectedFile) {
        const uploadedFile = await this.appwrite.uploadFile(this.selectedFile);
        coverImageId = uploadedFile.$id;
      }

      const trackData = {
        ...this.trackForm.value,
        coverImageId,
        playedAt: this.editingTrack()?.playedAt || new Date().toISOString()
      };

      if (this.editingTrack()) {
        await this.appwrite.updateTrack(this.editingTrack()!.$id!, trackData);
      } else {
        await this.appwrite.createTrack(trackData);
      }

      await this.loadTracks();
      this.closeTrackForm();
    } catch (error) {
      console.error('Error saving track:', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  protected async deleteTrack(trackId: string) {
    if (!confirm('Are you sure you want to delete this track?')) return;

    try {
      await this.appwrite.deleteTrack(trackId);
      await this.loadTracks();
    } catch (error) {
      console.error('Error deleting track:', error);
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

  protected getImageUrl(imageId: string): string {
    return this.appwrite.getFileView(imageId);
  }

  protected formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }
}
