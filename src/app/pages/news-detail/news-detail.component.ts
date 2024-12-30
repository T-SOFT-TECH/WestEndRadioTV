import {Component, effect, inject, signal} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {News} from '../../model/news.model';
import {AppwriteService} from '../../services/appwrite.service';
import {SiteService} from '../../services/site.service';
import {DatePipe, UpperCasePipe} from '@angular/common';
import {SeoService} from '../../services/seo.service';
import {SafeHtmlPipe} from '../../pipe/safe-html.pipe';

@Component({
  selector: 'app-news-detail',
  imports: [
    RouterLink,
    DatePipe,
    UpperCasePipe,
    SafeHtmlPipe
  ],
  templateUrl: './news-detail.component.html',
  styleUrl: './news-detail.component.scss'
})
export class NewsDetailComponent  {

  private route = inject(ActivatedRoute);
  private appwrite = inject(AppwriteService);
  protected siteService = inject(SiteService);
  private seo = inject(SeoService);


  protected newss = signal<News | null>(null);
  protected relatedNews = signal<News[]>([]);

  constructor() {
    effect(() => {
      const slug = this.route.snapshot.params['slug'];
      const news = this.siteService.news().find(n => n.slug === slug);
      this.newss.set(news || null);

      // Add SEO update here, after the news is loaded
      if (news) {
        this.seo.updateMetaForDynamicContent({
          title: `${news.title} - WestEndRadioTV News`,
          description: news.summary,
          keywords: news.tags.join(', '),
          ogImage: news.imageId ? this.siteService.getImageUrl(news.imageId) : 'default-news-image.jpg'
        });

        this.loadRelatedNews(news.tags[0], news.$id!);
      }
    });
  }

  private async loadRelatedNews(tag: string, currentNewsId: string) {
    const related = await this.appwrite.getRelatedNews(tag, currentNewsId);
    this.relatedNews.set(related.documents as unknown as News[]);
  }



}
