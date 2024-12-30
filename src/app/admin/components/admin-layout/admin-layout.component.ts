import {Component, inject, signal} from '@angular/core';
import {AdminHeaderComponent} from '../admin-header/admin-header.component';
import {AdminSidebarComponent} from '../admin-sidebar/admin-sidebar.component';
import {ActivatedRouteSnapshot, NavigationEnd, RouterOutlet} from '@angular/router';
import {Router} from 'express';
import {filter} from 'rxjs';

@Component({
  selector: 'app-admin-layout',
  imports: [
    AdminHeaderComponent,
    AdminSidebarComponent,
    RouterOutlet
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent {




}
