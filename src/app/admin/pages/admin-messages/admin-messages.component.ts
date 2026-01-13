import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { PocketbaseService } from '../../../services/pocketbase.service';
import { CommonModule, DatePipe } from '@angular/common';
import { HotToastService } from '@ngxpert/hot-toast';
import { AutoAnimationDirective } from '../../../Directives/auto-Animate.directive';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  created: string;
}

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    AutoAnimationDirective
  ],
  templateUrl: './admin-messages.component.html',
  styleUrl: './admin-messages.component.scss'
})
export class AdminMessagesComponent implements OnInit {
  private pocketbase = inject(PocketbaseService);
  private toast = inject(HotToastService);

  protected messages = signal<ContactMessage[]>([]);
  protected selectedMessage = signal<ContactMessage | null>(null);
  protected isLoading = signal(false);

  protected unreadCount = computed(() => 
    this.messages().filter(m => !m.read).length
  );

  async ngOnInit() {
    await this.loadMessages();
  }

  protected async loadMessages() {
    this.isLoading.set(true);
    try {
      const response = await this.pocketbase.getContactMessages();
      this.messages.set(response.documents as unknown as ContactMessage[]);
    } catch (error) {
      console.error('Error loading messages:', error);
      this.toast.error('Failed to load messages');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected async viewMessage(message: ContactMessage) {
    this.selectedMessage.set(message);
    if (!message.read) {
      try {
        await this.pocketbase.markMessageAsRead(message.id);
        // Update local state
        this.messages.update(msgs => 
          msgs.map(m => m.id === message.id ? { ...m, read: true } : m)
        );
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
  }

  protected async deleteMessage(event: Event, id: string) {
    event.stopPropagation();
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      await this.pocketbase.deleteContactMessage(id);
      this.messages.update(msgs => msgs.filter(m => m.id !== id));
      if (this.selectedMessage()?.id === id) {
        this.selectedMessage.set(null);
      }
      this.toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      this.toast.error('Failed to delete message');
    }
  }

  protected closeDetail() {
    this.selectedMessage.set(null);
  }
}
