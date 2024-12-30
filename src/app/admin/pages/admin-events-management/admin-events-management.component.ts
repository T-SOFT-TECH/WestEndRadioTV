import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {AppwriteService} from '../../../services/appwrite.service';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Events} from '../../../model/events.model';
import {DatePipe} from '@angular/common';
import {Editor, NgxEditorModule, Toolbar} from 'ngx-editor';
import {AutoAnimationDirective} from '../../../Directives/auto-Animate.directive';
import {HotToastService} from '@ngxpert/hot-toast';
import {Subscription} from 'rxjs';

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
  private appwrite = inject(AppwriteService);
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
    this.editorSubscription = this.editor.valueChanges.subscribe(content => {

    });
    this.loadEvents();
  }

  ngOnDestroy() {
    this.editorSubscription?.unsubscribe();
    this.editor.destroy();
  }

  protected async loadEvents() {
    try {
      const response = await this.appwrite.getEvents();
      this.events.set(response.documents as unknown as Events[]);
    } catch (error) {
      console.error('Error loading events:', error);
      this.toast.error('Failed to load events');
    }
  }

  protected async saveEvent() {
    if (this.eventForm.invalid) {
      this.toast.error('Please fill all required fields');
      return;
    }

    this.isSubmitting.set(true);
    try {
      let imageId = this.editingEvent()?.imageId;

      if (this.selectedFile) {
        const uploadedFile = await this.appwrite.uploadFile(this.selectedFile);
        imageId = uploadedFile.$id;
      }

      const formValue = this.eventForm.value;

      const eventData = {
        title: formValue.title,
        description: this.editorContent(),
        startDate: formValue.startDate,
        endDate: formValue.endDate,
        location: formValue.location,
        category: formValue.category,
        organizer: formValue.organizer,
        imageId,
        ticketLink: formValue.ticketLink,
        featured: formValue.featured,
        active: formValue.active,
        slug: formValue.title?.toLowerCase().replace(/\s+/g, '-')
      };

      if (this.editingEvent()) {
        await this.appwrite.updateEvent(this.editingEvent()!.$id!, eventData);
        this.toast.success('Event updated successfully');
      } else {
        await this.appwrite.createEvent(eventData);
        this.toast.success('Event created successfully');
      }

      await this.loadEvents();
      this.closeForm();
    } catch (error) {
      console.error('Error saving event:', error);
      this.toast.error('Failed to save event');
    } finally {
      this.isSubmitting.set(false);
    }
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

    if (event.imageId) {
      this.imagePreview.set(this.getImageUrl(event.imageId));
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
    const editingEvent = this.editingEvent();
    if (editingEvent) {
      editingEvent.imageId = undefined;
    }
  }

  protected getImageUrl(imageId: string): string {
    return this.appwrite.getFileView(imageId);
  }

  protected async deleteEvent(eventId: string) {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await this.appwrite.deleteEvent(eventId);
      await this.loadEvents();
      this.toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      this.toast.error('Failed to delete event');
    }
  }
}
