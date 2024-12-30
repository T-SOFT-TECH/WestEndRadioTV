import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {News} from '../../../model/news.model';
import {AppwriteService} from '../../../services/appwrite.service';
import {DatePipe} from '@angular/common';
import {Editor, NgxEditorModule, Toolbar} from 'ngx-editor';
import {AutoAnimationDirective} from '../../../Directives/auto-Animate.directive';

@Component({
  selector: 'app-admin-news-management',
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

  async ngOnInit() {
    await this.loadNews();
    this.editor = new Editor();
  }

  protected async loadNews() {
    try {
      const response = await this.appwrite.getNews();
      this.news.set(response.documents as unknown as News[]);
    } catch (error) {
      console.error('Error loading news:', error);
    }
  }

  protected async saveNews() {
    if (this.newsForm.invalid) return;
    this.isSubmitting.set(true);

    try {
      let imageId = this.editingNews()?.imageId;
      if (this.selectedFile) {
        const uploaded = await this.appwrite.uploadFile(this.selectedFile);
        imageId = uploaded.$id;
      }

      const newsData = {
        ...this.newsForm.value,
        imageId,
        slug: this.newsForm.value.title?.toLowerCase().replace(/\s+/g, '-'),
        tags: this.newsForm.value.tags?.split(',').map(t => t.trim())
      };

      if (this.editingNews()) {
        await this.appwrite.updateNews(this.editingNews()!.$id!, newsData);
      } else {
        await this.appwrite.createNews(newsData);
      }

      await this.loadNews();
      this.closeForm();
    } finally {
      this.isSubmitting.set(false);
    }
  }

  protected async deleteNews(newsId: string) {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      await this.appwrite.deleteNews(newsId);
      await this.loadNews();
    } catch (error) {
      console.error('Error deleting news:', error);
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
    this.showModal.set(true);
  }

  protected closeForm() {
    this.showModal.set(false);
    this.newsForm.reset();
    this.editingNews.set(null);
    this.imagePreview.set(null);
    this.selectedFile = null;
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

  ngOnDestroy() {
    this.editor.destroy();
  }

}
