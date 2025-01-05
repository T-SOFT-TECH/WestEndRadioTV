import {Component, computed, effect, HostListener, inject, PLATFORM_ID, signal} from '@angular/core';
import {isPlatformBrowser, NgClass,} from '@angular/common';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {fadeInOut, slideInOutRight,} from '../../animations/animations'


import {AudioService} from '../../services/audio.service';
import {SiteService} from '../../services/site.service';
import {AutoAnimationDirective} from '../../Directives/auto-Animate.directive';


interface NavItem {
  path: string;
  label: string;
  exact: boolean;
}

@Component({
  selector: 'app-header',
  imports: [
    RouterLinkActive,
    RouterLink,
    NgClass,
    AutoAnimationDirective
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  animations: [slideInOutRight, fadeInOut]


})
export class HeaderComponent {
  private platformId = inject(PLATFORM_ID);
  private audioService = inject(AudioService);
  private router = inject(Router);
  private siteService = inject(SiteService);
   settings = this.siteService.settings;


  isScrolled = signal(false);
  isMobileMenuOpen = signal(false);
  currentPath = signal('');

  protected isPlaying = computed(() => this.audioService.audioState().isPlaying);
  protected isBuffering = computed(() => this.audioService.audioState().isBuffering);



  protected readonly navItems: NavItem[] = [
    { path: '/', label: 'Home', exact: true },
    { path: '/shows', label: 'Shows', exact: false },
    { path: '/schedule', label: 'Schedule', exact: false },
    { path: '/news', label: 'News ', exact: false },
    { path: '/events', label: 'Events ', exact: false },
   // { path: '/about', label: 'About', exact: false },
    { path: '/contact', label: 'Contact', exact: false },
  ];

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      effect(() => {
        this.currentPath.set(window.location.pathname);
      });
    }
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isScrolled.set(window.scrollY > 0);
    }
  }

  @HostListener('document:keydown.escape')
  handleEscapeKey(): void {
    this.closeMobileMenu();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(value => !value);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  toggleLiveStream() {
    this.audioService.toggleStream();
  }

  // Add search functionality
  openSearchDialog() {
    // Update the URL state to show search modal
    this.router.navigate([], {
      queryParams: { search: 'true' },
      queryParamsHandling: 'merge'
    });
  }

}
