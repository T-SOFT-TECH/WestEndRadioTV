import {Component, HostListener, inject, OnInit, signal} from '@angular/core';
import { RouterLink, RouterLinkActive} from '@angular/router';
import {Router} from 'express';
import {filter} from 'rxjs';
import {AppwriteService} from '../../../services/appwrite.service';

interface SidebarStats {
  showsCount: number;
  tracksCount: number;
  uptime: string;
  listeners: number;
}

@Component({
  selector: 'app-admin-sidebar',
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.scss'
})
export class AdminSidebarComponent implements OnInit {

  private appwrite = inject(AppwriteService);

  protected isSidebarOpen = signal(false);
  protected sidebarStats = signal<SidebarStats>({
    showsCount: 0,
    tracksCount: 0,
    uptime: '0h 0m',
    listeners: 0
  });

  protected menuItems = [
    {
      path: '/admin/dashboard',
      label: 'Dashboard',
      icon: `<svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
     <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15v4m6-6v6m6-4v4m6-6v6M3 11l6-5 6 5 5.5-5.5"/>
   </svg>`,
      exact: true
    },
    {
      path: '/admin/shows',
      label: 'Shows',
      icon: '📻',
      exact: false
    },
    {
      path: '/admin/events',
      label: 'Events',
      icon: '📅',
      exact: false
    },
    {
      path: '/admin/news',
      label: 'News',
      icon: '📰',
      exact: false
    },
    {
      path: '/admin/tracks',
      label: 'Tracks',
      icon: '🎵',
      exact: false
    },
    {
      path: '/admin/schedule',
      label: 'Schedule',
      icon: '📅',
      exact: false
    },
    {
      path: '/admin/settings',
      label: 'Settings',
      icon: '⚙️',
      exact: false
    }
  ];

  constructor() {
    // Set initial sidebar state based on screen size
    if (typeof window !== 'undefined') {
      this.isSidebarOpen.set(window.innerWidth >= 1024);
    }
  }


  ngOnInit(): void {
    this.loadSidebarStats();
    this.startLiveUpdates();
  }

  private async loadSidebarStats() {
    try {
      const [shows, tracks] = await Promise.all([
        this.appwrite.getShows(),
        this.appwrite.getTracks()
      ]);

      // Calculate uptime (replace with actual uptime tracking)
      const startTime = new Date();
      startTime.setHours(startTime.getHours() - 12); // Example: 12 hours ago
      const uptime = this.calculateUptime(startTime);

      this.sidebarStats.set({
        showsCount: shows.total,
        tracksCount: tracks.total,
        uptime,
        listeners: Math.floor(Math.random() * 2000) // Replace with actual listener count
      });
    } catch (error) {
      console.error('Error loading sidebar stats:', error);
    }
  }

  private calculateUptime(startTime: Date): string {
    const now = new Date();
    const diff = now.getTime() - startTime.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  }

  private startLiveUpdates() {
    // Update stats every minute
    setInterval(() => {
      this.loadSidebarStats();
    }, 60000);
  }






  protected toggleSidebar(): void {
    this.isSidebarOpen.update(state => !state);
  }

  protected closeSidebar(): void {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      this.isSidebarOpen.set(false);
    }
  }

  protected onMenuItemClick(): void {
    this.closeSidebar();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1024) {
        this.isSidebarOpen.set(true);
      } else {
        this.isSidebarOpen.set(false);
      }
    }
  }




}
