import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import PocketBase, { RecordModel } from 'pocketbase';
import { Contact } from '../model/contact.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PocketbaseService {
  private pb: PocketBase;
  private platformId = inject(PLATFORM_ID);

  constructor() {
    // Use different URLs for browser vs server (SSR)
    let pbUrl: string;
    if (isPlatformBrowser(this.platformId)) {
      // Browser: use same origin or browserUrl
      pbUrl = (environment.pocketbase as any)?.browserUrl ?? environment.pocketbase?.url ?? '';
    } else {
      // Server (SSR): use internal Docker network URL
      pbUrl = (environment.pocketbase as any)?.serverUrl ?? environment.pocketbase?.url ?? 'http://127.0.0.1:8090';
    }

    this.pb = new PocketBase(pbUrl || 'http://127.0.0.1:8090');

    // PocketBase automatically handles auth persistence via localStorage
    // No manual cookie loading needed - it's handled internally
  }

  // ==================== SHOWS ====================

  async getShows() {
    const records = await this.pb.collection('shows').getFullList({
      filter: 'active = true',
      sort: 'startTime'
    });
    return { documents: records };
  }

  async getFeaturedShows() {
    const records = await this.pb.collection('shows').getFullList({
      filter: 'featured = true && active = true',
      sort: '-created',
      $autoCancel: false
    });
    return { documents: records.slice(0, 3) };
  }

  async getCurrentShow() {
    const records = await this.pb.collection('shows').getFullList({
      filter: 'isLive = true && active = true',
      $autoCancel: false
    });
    return { documents: records.slice(0, 1) };
  }

  async createShow(data: any) {
    return await this.pb.collection('shows').create(data);
  }

  async updateShow(showId: string, data: any) {
    return await this.pb.collection('shows').update(showId, data);
  }

  async deleteShow(showId: string) {
    return await this.pb.collection('shows').delete(showId);
  }

  // ==================== TRACKS ====================

  async getTracks() {
    const records = await this.pb.collection('tracks').getFullList({
      sort: '-playedAt'
    });
    return { documents: records };
  }

  async createTrack(data: any) {
    return await this.pb.collection('tracks').create(data);
  }

  async updateTrack(trackId: string, data: any) {
    return await this.pb.collection('tracks').update(trackId, data);
  }

  async deleteTrack(trackId: string) {
    return await this.pb.collection('tracks').delete(trackId);
  }

  async getShowTracks(showId: string) {
    const records = await this.pb.collection('tracks').getFullList({
      filter: `showId = "${showId}"`,
      sort: '-playedAt',
      $autoCancel: false
    });
    return { documents: records.slice(0, 5) };
  }

  // ==================== EPISODES ====================

  async getShowEpisodes(showId: string) {
    const records = await this.pb.collection('episodes').getFullList({
      filter: `showId = "${showId}"`,
      sort: '-date',
      $autoCancel: false
    });
    return { documents: records.slice(0, 6) };
  }

  // ==================== SETTINGS ====================

  async getSettings() {
    try {
      // Try to get the first settings record
      const records = await this.pb.collection('settings').getFullList({
        $autoCancel: false
      });
      
      if (records.length > 0) {
        return records[0];
      }
      
      // Create default settings if none exist
      return await this.createDefaultSettings();
    } catch (error: any) {
      if (error.status === 404) {
        return await this.createDefaultSettings();
      }
      throw error;
    }
  }

  private async createDefaultSettings() {
    const defaultSettings = {
      stationName: 'WestEnd Radio TV',
      stationSlogan: 'Your Premier Radio Station',
      streamUrl: '',
      heroImage: ''
    };

    return await this.pb.collection('settings').create(defaultSettings);
  }

  async updateSettings(data: any) {
    const settings = await this.getSettings();
    return await this.pb.collection('settings').update(settings.id, data);
  }

  // ==================== EVENTS ====================

  async getEvents() {
    const records = await this.pb.collection('events').getFullList({
      sort: '-startDate'
    });
    return { documents: records };
  }

  async getFeaturedEvents() {
    const records = await this.pb.collection('events').getFullList({
      filter: 'featured = true && active = true',
      sort: '-startDate',
      $autoCancel: false
    });
    return { documents: records.slice(0, 3) };
  }

  async createEvent(data: any) {
    return await this.pb.collection('events').create(data);
  }

  async updateEvent(eventId: string, data: any) {
    return await this.pb.collection('events').update(eventId, data);
  }

  async deleteEvent(eventId: string) {
    return await this.pb.collection('events').delete(eventId);
  }

  async getRelatedEvents(category: string, currentEventId: string) {
    const records = await this.pb.collection('events').getFullList({
      filter: `category = "${category}" && id != "${currentEventId}" && active = true`,
      sort: '-startDate',
      $autoCancel: false
    });
    return { documents: records.slice(0, 3) };
  }

  // ==================== NEWS ====================

  async getNews() {
    const records = await this.pb.collection('news').getFullList({
      sort: '-publishDate'
    });
    return { documents: records };
  }

  async getFeaturedNews() {
    const records = await this.pb.collection('news').getFullList({
      filter: 'featured = true && active = true',
      sort: '-publishDate',
      $autoCancel: false
    });
    return { documents: records.slice(0, 3) };
  }

  async createNews(data: any) {
    return await this.pb.collection('news').create(data);
  }

  async updateNews(newsId: string, data: any) {
    return await this.pb.collection('news').update(newsId, data);
  }

  async deleteNews(newsId: string) {
    return await this.pb.collection('news').delete(newsId);
  }

  async getRelatedNews(category: string, currentNewsId: string) {
    const records = await this.pb.collection('news').getFullList({
      filter: `category = "${category}" && id != "${currentNewsId}" && active = true`,
      sort: '-publishDate',
      $autoCancel: false
    });
    return { documents: records.slice(0, 3) };
  }

  // ==================== CONTACT MESSAGES ====================

  async createContactMessage(data: Contact) {
    return await this.pb.collection('contact_messages').create({
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      subject: data.subject,
      message: data.message,
      read: false
    });
  }

  async getContactMessages() {
    const records = await this.pb.collection('contact_messages').getFullList({
      sort: '-created'
    });
    return { documents: records };
  }

  async markMessageAsRead(id: string) {
    return await this.pb.collection('contact_messages').update(id, { read: true });
  }

  async deleteContactMessage(id: string) {
    return await this.pb.collection('contact_messages').delete(id);
  }

  // ==================== NEWSLETTER ====================

  async newsletterSubscribe(email: string) {
    return await this.pb.collection('newsletter_subscribers').create({
      email
    });
  }

  // ==================== FILE HANDLING ====================

  /**
   * Returns the full URL for a file stored in a PocketBase record.
   * @param record The PocketBase record object (must contain collectionId and id)
   * @param filename The filename stored in the record (e.g., record.image)
   */
  getImageUrl(record: any, filename: string): string {
    if (!filename) return '';
    return this.pb.files.getUrl(record, filename);
  }

  /**
   * Returns a thumbnail URL for a file.
   * @param record The PocketBase record object
   * @param filename The filename
   * @param width Width of the thumbnail (e.g. 100)
   * @param height Height of the thumbnail (e.g. 100) - use 0 for auto
   */
  getThumbUrl(record: any, filename: string, width: number = 100, height: number = 0): string {
    if (!filename) return '';
    return this.pb.files.getUrl(record, filename, { thumb: `${width}x${height}` });
  }

  // Legacy/Compatibility wrappers if needed, but better to update SiteService
  getFileView(record: any, filename: string): string {
    return this.getImageUrl(record, filename);
  }

  // ==================== AUTHENTICATION ====================

  async login(email: string, password: string) {
    return await this.pb.collection('users').authWithPassword(email, password);
  }

  async getCurrentSession() {
    if (this.pb.authStore.isValid) {
      return {
        userId: this.pb.authStore.model?.id,
        $id: this.pb.authStore.model?.id
      };
    }
    return null;
  }

  async logout() {
    try {
      this.pb.authStore.clear();
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }

  async getCurrentUser() {
    if (this.pb.authStore.isValid && this.pb.authStore.model) {
      return this.pb.authStore.model;
    }
    return null;
  }

  // ==================== UTILITY ====================

  get isAuthenticated(): boolean {
    return this.pb.authStore.isValid;
  }

  get currentUser() {
    return this.pb.authStore.model;
  }
}
