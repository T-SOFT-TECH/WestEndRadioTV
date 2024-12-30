import { Injectable } from '@angular/core';
import {Client, Databases, Storage, Account, Query, ID} from 'appwrite';
import {Contact} from '../model/contact.model';



@Injectable({
  providedIn: 'root'
})
export class AppwriteService {

  appwrite = {
    endpoint: 'https://appwrite.tsoft-tech.dev/v1',
    projectId: 'westend-radio-tv',
    bucketId: 'media',
    databaseId: 'westendradiotv-db'
  }

  private client = new Client();
  private databases: Databases;
  private storage: Storage;
  private account: Account;

  constructor() {
    this.client
      .setEndpoint(this.appwrite.endpoint)
      .setProject(this.appwrite.projectId);

    this.databases = new Databases(this.client);
    this.storage = new Storage(this.client);
    this.account = new Account(this.client);
  }

  // Shows
  async getShows() {
    return await this.databases.listDocuments(
      this.appwrite.databaseId,
      'shows',
      [
        Query.equal('active', true),
        Query.orderAsc('startTime')
      ]
    );
  }

  async getFeaturedShows() {
    return await this.databases.listDocuments(
      this.appwrite.databaseId,
      'shows',
      [
        Query.equal('featured', true),
        Query.equal('active', true),
        Query.limit(3)
      ]
    );
  }

  async getCurrentShow() {
    return await this.databases.listDocuments(
      this.appwrite.databaseId,
      'shows',
      [
        Query.equal('isLive', true),
        Query.equal('active', true),
        Query.limit(1)
      ]
    );
  }



  // Settings


  // Media
  async getMediaUrl(fileId: string) {
    return this.storage.getFileView(
      'media',
      fileId
    );
  }


  async createShow(data: any) {
    return await this.databases.createDocument(
      this.appwrite.databaseId,
      'shows',
      ID.unique(),
      data
    );
  }

  async updateShow(showId: string, data: any) {
    return await this.databases.updateDocument(
      this.appwrite.databaseId,
      'shows',
      showId,
      data
    );
  }

  async deleteShow(showId: string) {
    return await this.databases.deleteDocument(
      this.appwrite.databaseId,
      'shows',
      showId
    );
  }

  async uploadFile(file: File) {
    return await this.storage.createFile(
      this.appwrite.bucketId,
      ID.unique(),
      file
    );
  }

  getFileView(fileId: string): string {
    return this.storage.getFileView(
      this.appwrite.bucketId,
      fileId
    );
  }

  async getTracks() {
    return await this.databases.listDocuments(
      this.appwrite.databaseId,
      'tracks',
      [Query.orderDesc('playedAt')]
    );
  }

  async createTrack(data: any) {
    return await this.databases.createDocument(
      this.appwrite.databaseId,
      'tracks',
      ID.unique(),
      data
    );
  }

  async updateTrack(trackId: string, data: any) {
    return await this.databases.updateDocument(
      this.appwrite.databaseId,
      'tracks',
      trackId,
      data
    );
  }

  async deleteTrack(trackId: string) {
    return await this.databases.deleteDocument(
      this.appwrite.databaseId,
      'tracks',
      trackId
    );
  }

  // Settings
  async getSettings() {
    try {
      return await this.databases.getDocument(
        this.appwrite.databaseId,
        'settings',
        'main'
      );
    } catch (error: any) {
      if (error.type === 'document_not_found') {
        // Create default settings if they don't exist
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

    return await this.databases.createDocument(
      this.appwrite.databaseId,
      'settings',
      'main',
      defaultSettings
    );
  }

  async updateSettings(data: any) {
    return await this.databases.updateDocument(
      this.appwrite.databaseId,
      'settings',
      'main',
      data
    );
  }

  // Add to AppwriteService class
// Events Methods
  async getEvents() {
    return await this.databases.listDocuments(
      this.appwrite.databaseId,
      'events',
      [Query.orderDesc('startDate')]
    );
  }

  async getFeaturedEvents() {
    return await this.databases.listDocuments(
      this.appwrite.databaseId,
      'events',
      [
        Query.equal('featured', true),
        Query.equal('active', true),
        Query.limit(3)
      ]
    );
  }

  async createEvent(data: any) {
    return await this.databases.createDocument(
      this.appwrite.databaseId,
      'events',
      ID.unique(),
      data
    );
  }

  async updateEvent(eventId: string, data: any) {
    return await this.databases.updateDocument(
      this.appwrite.databaseId,
      'events',
      eventId,
      data
    );
  }

  async deleteEvent(eventId: string) {
    return await this.databases.deleteDocument(
      this.appwrite.databaseId,
      'events',
      eventId
    );
  }

// News Methods
  async getNews() {
    return await this.databases.listDocuments(
      this.appwrite.databaseId,
      'news',
      [Query.orderDesc('publishDate')]
    );
  }

  async getFeaturedNews() {
    return await this.databases.listDocuments(
      this.appwrite.databaseId,
      'news',
      [
        Query.equal('featured', true),
        Query.equal('active', true),
        Query.limit(3)
      ]
    );
  }

  // Create News Method
  async createNews(data: any) {
    return await this.databases.createDocument(
      this.appwrite.databaseId,
      'news',
      ID.unique(),
      data
    );
  }

  // Update News Method
  async updateNews(newsId: string, data: any) {
    return await this.databases.updateDocument(
      this.appwrite.databaseId,
      'news',
      newsId,
      data
    );
  }

  // Delete News Method
  async deleteNews(newsId: string) {
    return await this.databases.deleteDocument(
      this.appwrite.databaseId,
      'news',
      newsId
    );
  }

// Get related content methods
  async getRelatedEvents(category: string, currentEventId: string) {
    return await this.databases.listDocuments(
      this.appwrite.databaseId,
      'events',
      [
        Query.equal('category', [category]),
        Query.notEqual('$id', currentEventId),
        Query.equal('active', true),
        Query.orderDesc('startDate'),
        Query.limit(3)
      ]
    );
  }

  async getRelatedNews(category: string, currentNewsId: string) {
    return await this.databases.listDocuments(
      this.appwrite.databaseId,
      'news',
      [
        Query.equal('category', [category]),
        Query.notEqual('$id', currentNewsId),
        Query.equal('active', true),
        Query.orderDesc('publishDate'),
        Query.limit(3)
      ]
    );
  }

  async createContactMessage(data: Contact) {
    return await this.databases.createDocument(
      this.appwrite.databaseId,
      'contact-messages',  // collection name
      ID.unique(),
      {
        ...data,
        status: 'unread'  // you can use this to track message status
      }
    );
  }

  async getShowTracks(showId: string) {
    return await this.databases.listDocuments(
      this.appwrite.databaseId,
      'tracks',
      [
        Query.equal('showId', showId),
        Query.orderDesc('playedAt'),
        Query.limit(5)
      ]
    );
  }

  async getShowEpisodes(showId: string) {
    return await this.databases.listDocuments(
      this.appwrite.databaseId,
      'episodes',
      [
        Query.equal('showId', showId),
        Query.orderDesc('date'),
        Query.limit(6)
      ]
    );
  }

  async login(email: string, password: string) {
    return await this.account.createEmailPasswordSession(email, password);
  }

  async getCurrentSession() {
    try {
      return await this.account.getSession('current');
    } catch (error) {
      return null;
    }
  }


  async logout() {
    try {
      await this.account.deleteSession('current');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }


  async getCurrentUser() {
    try {
      return await this.account.get();
    } catch (error) {
      return null;
    }
  }

  async newsletterSubscribe(email: string) {
    try {
      return await this.databases.createDocument(
        this.appwrite.databaseId,
        'newsletter-subscriber',
        ID.unique(),
        {
          email,
        }
      );
    } catch (error) {
      throw error;
    }
  }

}
