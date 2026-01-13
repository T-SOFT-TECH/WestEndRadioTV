import { Component, inject, signal } from '@angular/core';
import { PocketbaseService } from '../../../services/pocketbase.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';

interface Track {
  id?: string;
  collectionId?: string;
  collectionName?: string;
  title: string;
  artist: string;
  albumName?: string;
  image?: string;
  playedAt: string;
  showId: string;
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
  private pocketbase = inject(PocketbaseService);
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
    showId: ['', Validators.required]
  });

  async ngOnInit() {
    await Promise.all([
      this.loadTracks(),
      this.loadShows()
    ]);
  }

  protected async loadTracks() {
    try {
      const response = await this.pocketbase.getTracks();
      // Cast the response documents to Track type
      const tracks: Track[] = response.documents.map(doc => ({
        id: doc.id,
        collectionId: doc.collectionId,
        collectionName: doc.collectionName,
        title: doc['title'],
        artist: doc['artist'],
        albumName: doc['albumName'],
        showId: doc['showId'],
        image: doc['image'],
        playedAt: doc['playedAt']
      }));
      this.tracks.set(tracks);
    } catch (error) {
      console.error('Error loading tracks:', error);
    }
  }

  protected async loadShows() {
    try {
      const response = await this.pocketbase.getShows();
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
      showId: track.showId
    });

    if (track.image) {
      this.imagePreview.set(this.pocketbase.getImageUrl(track, track.image));
    }

    this.showModal.set(true);
  }

  protected async saveTrack() {
    if (this.trackForm.invalid) return;

    this.isSubmitting.set(true);
    try {
      const trackData: any = {
        ...this.trackForm.value,
        playedAt: this.editingTrack()?.playedAt || new Date().toISOString()
      };

      if (this.selectedFile) {
        trackData.image = this.selectedFile;
      }

      if (this.editingTrack()) {
        await this.pocketbase.updateTrack(this.editingTrack()!.id!, trackData);
      } else {
        await this.pocketbase.createTrack(trackData);
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
      await this.pocketbase.deleteTrack(trackId);
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

  protected removeImage(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.imagePreview.set(null);
    this.selectedFile = null;
    const editing = this.editingTrack();
    if (editing) {
      editing.image = undefined;
    }
  }

  protected getImageUrl(track: Track): string {
    return track.image ? this.pocketbase.getImageUrl(track, track.image) : '';
  }

  protected formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }
}