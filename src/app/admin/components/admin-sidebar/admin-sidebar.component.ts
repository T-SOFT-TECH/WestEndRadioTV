import {Component, HostListener, inject, OnDestroy, OnInit, signal} from '@angular/core';
import { RouterLink, RouterLinkActive} from '@angular/router';
import {AppwriteService} from '../../../services/appwrite.service';
import { DomSanitizer } from '@angular/platform-browser';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroHome,
  heroRadio,
  heroCalendar,
  heroNewspaper,
  heroMusicalNote,
  heroClock,
  heroCog
} from '@ng-icons/heroicons/outline';


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
    RouterLinkActive,
    NgIcon
  ],
  providers: [
    provideIcons({
      heroHome,
      heroRadio,
      heroCalendar,
      heroNewspaper,
      heroMusicalNote,
      heroClock,
      heroCog
    })
  ],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.scss'
})
export class AdminSidebarComponent implements OnInit, OnDestroy {

  private appwrite = inject(AppwriteService);

  protected isSidebarOpen = signal(false);
  protected sidebarStats = signal<SidebarStats>({
    showsCount: 0,
    tracksCount: 0,
    uptime: '0h 0m',
    listeners: 0
  });

  protected isLoading = signal(false);


  protected menuItems = [
    {
      path: '/admin/dashboard',
      label: 'Dashboard',
      icon: 'heroHome',
      exact: true
    },
    {
      path: '/admin/listeners',
      label: 'Listeners',
      icon: 'heroUsers',
      exact: true
    },
    {
      path: '/admin/shows',
      label: 'Shows',
      icon: 'heroRadio',
      exact: false
    },
    {
      path: '/admin/events',
      label: 'Events',
      icon: 'heroCalendar',
      exact: false
    },
    {
      path: '/admin/news',
      label: 'News',
      icon: 'heroNewspaper',
      exact: false
    },
    {
      path: '/admin/tracks',
      label: 'Tracks',
      icon: 'heroMusicalNote',
      exact: false
    },
    {
      path: '/admin/schedule',
      label: 'Schedule',
      icon: 'heroClock',
      exact: false
    },
    {
      path: '/admin/settings',
      label: 'Settings',
      icon: 'heroCog',
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

  private calculateUptime(startTime: Date): string {
    const now = new Date();
    const diff = now.getTime() - startTime.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  }


  private async loadSidebarStats() {
    this.isLoading.set(true);
    try {
      // Cache the promises
      const showsPromise = this.appwrite.getShows();
      const tracksPromise = this.appwrite.getTracks();

      // Start both requests concurrently
      const [shows, tracks] = await Promise.all([showsPromise, tracksPromise]);

      const startTime = new Date();
      startTime.setHours(startTime.getHours() - 12);

      this.sidebarStats.update(current => ({
        ...current,
        showsCount: shows.total,
        tracksCount: tracks.total,
        uptime: this.calculateUptime(startTime),
        // Keep existing listeners if loading fails
        listeners: current.listeners
      }));
    } catch (error) {
      console.error('Error loading sidebar stats:', error);
    }
    finally {
      this.isLoading.set(false);
    }
  }

  private startLiveUpdates() {
    this.updateInterval = setInterval(() => {
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

// Add cleanup
  private updateInterval: any;

  ngOnDestroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }


}
