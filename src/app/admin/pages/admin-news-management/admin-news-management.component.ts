import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {News} from '../../../model/news.model';
import {AppwriteService} from '../../../services/appwrite.service';
import {DatePipe} from '@angular/common';
import {Editor, NgxEditorModule, Toolbar} from 'ngx-editor';
import {AutoAnimationDirective} from '../../../Directives/auto-Animate.directive';
import {HotToastService} from '@ngxpert/hot-toast';
import {Subscription} from 'rxjs';

interface EditorState {
  html: string;
  json?: any;
}

@Component({
  selector: 'app-admin-news-management',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    AutoAnimationDirective,
    NgxEditorModule
  ],
  templateUrl: './admin-news-management.component.html',
  styleUrl: './admin-news-management.component.scss'
})
export class AdminNewsManagementComponent implements OnInit, OnDestroy {
  private appwrite = inject(AppwriteService);
  private fb = inject(FormBuilder);
  private toast = inject(HotToastService);
  private editorSubscription?: Subscription;
  protected editorContent = signal<EditorState>({ html: '', json: null });

  protected news = signal<News[]>([]);
  protected showModal = signal(false);
  protected isSubmitting = signal(false);
  protected editingNews = signal<News | null>(null);
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

  protected newsForm = this.fb.group({
    title: ['', Validators.required],
    content: ['', Validators.required],
    summary: ['', Validators.required],
    author: ['', Validators.required],
    publishDate: ['', Validators.required],
    tags: [''],
    featured: [false],
    active: [true]
  });

  ngOnInit() {
    this.editor = new Editor();
    this.editorSubscription = this.newsForm.get('content')?.valueChanges.subscribe(value => {
      if (typeof value === 'string') {
        this.editorContent.set({
          html: value,
          json: this.editor.view?.state.doc.toJSON()
        });
      }
    });
    this.loadNews();
  }

  ngOnDestroy() {
    this.editorSubscription?.unsubscribe();
    this.editor.destroy();
  }

  protected async loadNews() {
    try {
      const response = await this.appwrite.getNews();
      this.news.set(response.documents as unknown as News[]);
    } catch (error) {
      console.error('Error loading news:', error);
      this.toast.error('Failed to load news');
    }
  }

  protected async saveNews() {
    if (this.newsForm.invalid) {
      this.toast.error('Please fill all required fields');
      return;
    }

    this.isSubmitting.set(true);
    try {
      let imageId = this.editingNews()?.imageId;
      if (this.selectedFile) {
        const uploaded = await this.appwrite.uploadFile(this.selectedFile);
        imageId = uploaded.$id;
      }

      const formValue = this.newsForm.value;
      const content = this.editorContent().html || formValue.content;

      const newsData = {
        title: formValue.title,
        content: content,
        summary: formValue.summary,
        author: formValue.author,
        publishDate: formValue.publishDate,
        imageId,
        tags: formValue.tags?.split(',').map(t => t.trim()) || [],
        featured: formValue.featured,
        active: formValue.active,
        slug: formValue.title?.toLowerCase().replace(/\s+/g, '-')
      };

      if (this.editingNews()) {
        await this.appwrite.updateNews(this.editingNews()!.$id!, newsData);
        this.toast.success('News updated successfully');
      } else {
        await this.appwrite.createNews(newsData);
        this.toast.success('News created successfully');
      }

      await this.loadNews();
      this.closeForm();
    } catch (error) {
      console.error('Error saving news:', error);
      this.toast.error('Failed to save news');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  protected editNews(news: News) {
    this.editingNews.set(news);

    this.newsForm.patchValue({
      title: news.title,
      content: news.content,
      summary: news.summary,
      author: news.author,
      publishDate: news.publishDate,
      tags: news.tags?.join(', '),
      featured: news.featured,
      active: news.active
    });

    this.editor.setContent(news.content);
    this.editorContent.set({
      html: news.content,
      json: this.editor.view?.state.doc.toJSON()
    });

    if (news.imageId) {
      this.imagePreview.set(this.getImageUrl(news.imageId));
    }

    this.showModal.set(true);
  }

  protected openForm() {
    this.newsForm.reset({ active: true, featured: false });
    this.editingNews.set(null);
    this.imagePreview.set(null);
    this.selectedFile = null;
    this.editor.setContent('');
    this.editorContent.set({ html: '', json: null });
    this.showModal.set(true);
  }

  protected closeForm() {
    this.showModal.set(false);
    this.newsForm.reset();
    this.editingNews.set(null);
    this.imagePreview.set(null);
    this.selectedFile = null;
    this.editor.setContent('');
    this.editorContent.set({ html: '', json: null });
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
    const editingNews = this.editingNews();
    if (editingNews) {
      editingNews.imageId = undefined;
    }
  }

  protected getImageUrl(imageId: string): string {
    return this.appwrite.getFileView(imageId);
  }

  protected async deleteNews(newsId: string) {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      await this.appwrite.deleteNews(newsId);
      await this.loadNews();
      this.toast.success('News deleted successfully');
    } catch (error) {
      console.error('Error deleting news:', error);
      this.toast.error('Failed to delete news');
    }
  }
}
