import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { PocketbaseService } from '../../../services/pocketbase.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Events } from '../../../model/events.model';
import { DatePipe } from '@angular/common';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { AutoAnimationDirective } from '../../../Directives/auto-Animate.directive';
import { HotToastService } from '@ngxpert/hot-toast';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-events-management',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    AutoAnimationDirective,
    NgxEditorModule
  ],
  templateUrl: './admin-events-management.component.html',
  styleUrl: './admin-events-management.component.scss'
})
export class AdminEventsManagementComponent implements OnInit, OnDestroy {
  private pocketbase = inject(PocketbaseService);
  private fb = inject(FormBuilder);
  private toast = inject(HotToastService);
  private editorSubscription?: Subscription;
  private editorContent = signal('');

  protected events = signal<Events[]>([]);
  protected showModal = signal(false);
  protected isSubmitting = signal(false);
  protected editingEvent = signal<Events | null>(null);
  protected imagePreview = signal<string | null>(null);
  protected selectedFile: File | null = null;

  editor!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];

  protected eventForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    location: ['', Validators.required],
    category: ['', Validators.required],
    organizer: ['', Validators.required],
    ticketLink: [''],
    featured: [false],
    active: [true]
  });

  ngOnInit() {
    this.editor = new Editor();
    this.editorSubscription = this.editor.valueChanges.subscribe(jsonDoc => {
      // Convert editor JSON to HTML
      if (jsonDoc && typeof jsonDoc === 'object') {
        const html = this.editor.view?.dom.innerHTML || '';
        this.editorContent.set(html);
      }
    });
    this.loadEvents();
  }

  ngOnDestroy() {
    this.editorSubscription?.unsubscribe();
    this.editor.destroy();
  }

  protected async loadEvents() {
    try {
      const response = await this.pocketbase.getEvents();
      const events: Events[] = response.documents.map(doc => ({
        id: doc.id,
        collectionId: doc.collectionId,
        collectionName: doc.collectionName,
        title: doc['title'],
        description: doc['description'],
        startDate: doc['startDate'],
        endDate: doc['endDate'],
        location: doc['location'],
        image: doc['image'],
        featured: doc['featured'],
        active: doc['active'],
        slug: doc['slug'],
        category: doc['category'],
        ticketLink: doc['ticketLink'],
        organizer: doc['organizer']
      }));
      this.events.set(events);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  }

  protected async saveEvent() {
    if (this.eventForm.invalid) return;

    this.isSubmitting.set(true);
    try {
      const eventData: any = {
        title: this.eventForm.value.title!,
        description: this.editorContent(),
        startDate: this.eventForm.value.startDate ? new Date(this.eventForm.value.startDate).toISOString() : new Date().toISOString(),
        endDate: this.eventForm.value.endDate ? new Date(this.eventForm.value.endDate).toISOString() : new Date().toISOString(),
        location: this.eventForm.value.location!,
        category: this.eventForm.value.category!,
        organizer: this.eventForm.value.organizer!,
        ticketLink: this.eventForm.value.ticketLink,
        featured: this.eventForm.value.featured!,
        active: this.eventForm.value.active!,
        slug: this.slugify(this.eventForm.value.title!)
      };

      if (this.selectedFile) {
        eventData.image = this.selectedFile;
      }

      if (this.editingEvent()) {
        await this.pocketbase.updateEvent(this.editingEvent()!.id!, eventData);
      } else {
        await this.pocketbase.createEvent(eventData);
      }

      await this.loadEvents();
      this.closeForm();
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  }

  protected editEvent(event: Events) {
    this.editingEvent.set(event);

    this.eventForm.patchValue({
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      category: event.category,
      organizer: event.organizer,
      ticketLink: event.ticketLink,
      featured: event.featured,
      active: event.active
    });

    this.editor.setContent(event.description);
    this.editorContent.set(event.description);

    if (event.image) {
      this.imagePreview.set(this.pocketbase.getImageUrl(event, event.image));
    }

    this.showModal.set(true);
  }

  protected openForm() {
    this.eventForm.reset({ active: true, featured: false });
    this.editingEvent.set(null);
    this.imagePreview.set(null);
    this.selectedFile = null;
    this.editor.setContent('');
    this.editorContent.set('');
    this.showModal.set(true);
  }

  protected closeForm() {
    this.showModal.set(false);
    this.eventForm.reset();
    this.editingEvent.set(null);
    this.imagePreview.set(null);
    this.selectedFile = null;
    this.editor.setContent('');
    this.editorContent.set('');
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
    const editing = this.editingEvent();
    if (editing) {
      editing.image = undefined;
    }
  }

  protected getImageUrl(event: Events): string {
    return event.image ? this.pocketbase.getImageUrl(event, event.image) : '';
  }

  protected async deleteEvent(eventId: string) {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await this.pocketbase.deleteEvent(eventId);
      await this.loadEvents();
      this.toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      this.toast.error('Failed to delete event');
    }
  }
}
