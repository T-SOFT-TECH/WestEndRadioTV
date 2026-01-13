import { Component, HostListener, inject, Input, signal } from '@angular/core';
import { PocketbaseService } from '../../../services/pocketbase.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { Router, RouterLink } from '@angular/router';
import { AutoAnimationDirective } from '../../../Directives/auto-Animate.directive';

@Component({
  selector: 'app-admin-header',
  imports: [
    AutoAnimationDirective,
    RouterLink
  ],
  templateUrl: './admin-header.component.html',
  styleUrl: './admin-header.component.scss'
})
export class AdminHeaderComponent {
  @Input() title = 'Dashboard';
  @Input() breadcrumb?: string;

  private pocketbase = inject(PocketbaseService);
  private toast = inject(HotToastService);
  private router = inject(Router);

  protected showUserMenu = signal(false);
  protected currentUser = signal<any>(null);

  ngOnInit() {
    this.loadUserData();
  }

  private async loadUserData() {
    const user = await this.pocketbase.getCurrentUser();
    this.currentUser.set(user);
  }

  protected getInitials(name: string): string {
    if (!name) return '';
    return name.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    // Update the selector to match your menu container
    if (!target.closest('.user-menu-container')) {
      this.showUserMenu.set(false);
    }
  }

  protected toggleUserMenu(event: Event) {
    event.stopPropagation(); // Prevent event from bubbling up
    this.showUserMenu.update(state => !state);
  }

  async logout() {
    const success = await this.pocketbase.logout();
    if (success) {
      this.toast.success('Logged out successfully');
      await this.router.navigate(['/']);
    } else {
      this.toast.error('Failed to logout');
    }
  }

}
