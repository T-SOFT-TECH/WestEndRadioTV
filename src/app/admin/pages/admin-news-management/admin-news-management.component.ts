import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { News } from '../../../model/news.model';
import { PocketbaseService } from '../../../services/pocketbase.service';
import { DatePipe } from '@angular/common';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { AutoAnimationDirective } from '../../../Directives/auto-Animate.directive';
import { HotToastService } from '@ngxpert/hot-toast';
import { Subscription } from 'rxjs';

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
  private pocketbase = inject(PocketbaseService);
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
      const response = await this.pocketbase.getNews();
      const news: News[] = response.documents.map(doc => ({
        id: doc.id,
        collectionId: doc.collectionId,
        collectionName: doc.collectionName,
        title: doc['title'],
        content: doc['content'],
        summary: doc['summary'],
        image: doc['image'],
        publishDate: doc['publishDate'],
        author: doc['author'],
        tags: doc['tags'],
        featured: doc['featured'],
        active: doc['active'],
        slug: doc['slug']
      }));
      this.news.set(news);
    } catch (error) {
      console.error('Error loading news:', error);
    }
  }

  protected async saveNews() {
    if (this.newsForm.invalid) return;

    this.isSubmitting.set(true);
    try {
      const tags = this.newsForm.value.tags?.split(',').map((t: string) => t.trim()).filter((t: string) => t) || [];

      const newsData: any = {
        title: this.newsForm.value.title!,
        content: this.editorContent(),
        summary: this.newsForm.value.summary!,
        author: this.newsForm.value.author!,
        publishDate: this.newsForm.value.publishDate ? new Date(this.newsForm.value.publishDate).toISOString() : new Date().toISOString(),
        tags,
        featured: this.newsForm.value.featured!,
        active: this.newsForm.value.active!,
        slug: this.slugify(this.newsForm.value.title!)
      };

      if (this.selectedFile) {
        newsData.image = this.selectedFile;
      }

      if (this.editingNews()) {
        await this.pocketbase.updateNews(this.editingNews()!.id!, newsData);
      } else {
        await this.pocketbase.createNews(newsData);
      }

      await this.loadNews();
      this.closeForm();
    } catch (error) {
      console.error('Error saving news:', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')     // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-');  // Replace multiple - with single -
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

    if (news.image) {
      this.imagePreview.set(this.pocketbase.getImageUrl(news, news.image));
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
    const editing = this.editingNews();
    if (editing) {
      editing.image = undefined;
    }
  }

  protected getImageUrl(item: News): string {
    return item.image ? this.pocketbase.getImageUrl(item, item.image) : '';
  }

  protected async deleteNews(newsId: string) {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      await this.pocketbase.deleteNews(newsId);
      await this.loadNews();
      this.toast.success('News deleted successfully');
    } catch (error) {
      console.error('Error deleting news:', error);
      this.toast.error('Failed to delete news');
    }
  }
}
