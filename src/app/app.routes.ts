import { Routes } from '@angular/router';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import {authGuard} from './Guards/auth.guard';
import {roleGuard} from './Guards/role.guard';


export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home/home.component')
          .then(m => m.HomeComponent),
        title: 'WestEndRadioTV - Home',
        data: {
          meta: {
            title: 'WestEndRadioTV - Your Premier Radio Station',
            description: 'Listen to the best music, news, and entertainment on WestEndRadioTV',
            keywords: 'radio, music, news, entertainment, live radio',
            ogImage: 'assets/img/og-home.jpg'
          }
        }
      },
      {
        path: 'live',
        loadComponent: () => import('./pages/live/live.component')
          .then(m => m.LiveComponent),
        title: 'Live Radio - WestEndRadioTV',
        data: {
          meta: {
            title: 'Live Radio Stream - WestEndRadioTV',
            description: 'Listen to our live radio stream featuring the best music and shows',
            keywords: 'live radio, streaming, music, radio shows',
            ogImage: 'assets/img/og-live.jpg'
          }
        }
      },
      {
        path: 'news',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/news/news.component')
              .then(m => m.NewsComponent),
            title: 'News - WestEndRadioTV',
            data: {
              meta: {
                title: 'Latest News - WestEndRadioTV',
                description: 'Stay updated with the latest news and updates from WestEndRadioTV',
                keywords: 'radio news, updates, latest news, media news',
                ogImage: 'assets/img/og-news.jpg'
              }
            }
          },
          {
            path: ':slug',
            loadComponent: () => import('./pages/news-detail/news-detail.component')
              .then(m => m.NewsDetailComponent),
            title: 'News Article - WestEndRadioTV'
            // Meta tags handled dynamically in component
          }
        ]
      },
      {
        path: 'events',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/events/events.component')
              .then(m => m.EventsComponent),
            title: 'Events - WestEndRadioTV',
            data: {
              meta: {
                title: 'Radio Events - WestEndRadioTV',
                description: 'Discover upcoming events and shows at WestEndRadioTV',
                keywords: 'radio events, shows, live events, concerts',
                ogImage: 'assets/img/og-events.jpg'
              }
            }
          },
          {
            path: ':slug',
            loadComponent: () => import('./pages/events-detail/events-detail.component')
              .then(m => m.EventsDetailComponent)
            // Meta tags handled dynamically in component
          }
        ]
      },
      {
        path: 'shows',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/shows/shows.component')
              .then(m => m.ShowsComponent),
            title: 'Radio Shows - WestEndRadioTV',
            data: {
              meta: {
                title: 'Radio Shows and Programs - WestEndRadioTV',
                description: 'Explore our diverse lineup of radio shows and programs',
                keywords: 'radio shows, programs, DJ shows, talk shows',
                ogImage: 'assets/img/og-shows.jpg'
              }
            }
          },
          {
            path: ':slug',
            loadComponent: () => import('./pages/show-detail/show-detail.component')
              .then(m => m.ShowDetailComponent)
            // Meta tags handled dynamically in component
          }
        ]
      },
      {
        path: 'schedule',
        loadComponent: () => import('./pages/schedule/schedule.component')
          .then(m => m.ScheduleComponent),
        title: 'Program Schedule - WestEndRadioTV',
        data: {
          meta: {
            title: 'Radio Program Schedule - WestEndRadioTV',
            description: 'View our complete radio program schedule and show timings',
            keywords: 'radio schedule, program timing, show schedule',
            ogImage: 'assets/img/og-schedule.jpg'
          }
        }
      },
      {
        path: 'contact',
        loadComponent: () => import('./pages/contact/contact.component')
          .then(m => m.ContactComponent),
        title: 'Contact Us - WestEndRadioTV',
        data: {
          meta: {
            title: 'Contact WestEndRadioTV',
            description: 'Get in touch with WestEndRadioTV. We\'d love to hear from you!',
            keywords: 'contact radio, feedback, support, reach us',
            ogImage: 'assets/img/og-contact.jpg'
          }
        }
      },
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component')
          .then(m => m.LoginComponent),
        title: 'Login - WestEndRadioTV'
      },
    ]
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/components/admin-layout/admin-layout.component')
      .then(m => m.AdminLayoutComponent),
    canActivate: [authGuard, roleGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./admin/pages/dashboard/dashboard.component')
          .then(m => m.DashboardComponent),
        title: 'Admin Dashboard'
      },
      {
        path: 'shows',
        loadComponent: () => import('./admin/pages/admin-shows/admin-shows.component')
          .then(m => m.AdminShowsComponent),
        title: 'Manage Shows'
      },
      {
        path: 'tracks',
        loadComponent: () => import('./admin/pages/admin-tracks/admin-tracks.component')
          .then(m => m.AdminTracksComponent),
        title: 'Manage Tracks'
      },
      {
        path: 'schedule',
        loadComponent: () => import('./admin/pages/admin-schedule/admin-schedule.component')
          .then(m => m.AdminScheduleComponent),
        title: 'Manage Schedules'
      },
      {
        path: 'news',
        loadComponent: () => import('./admin/pages/admin-news-management/admin-news-management.component')
          .then(m => m.AdminNewsManagementComponent),
        title: 'Manage News'
      },
      {
        path: 'events',
        loadComponent: () => import('./admin/pages/admin-events-management/admin-events-management.component')
          .then(m => m.AdminEventsManagementComponent),
        title: 'Manage Events'
      },
      {
        path: 'settings',
        loadComponent: () => import('./admin/pages/admin-settings/admin-settings.component')
          .then(m => m.AdminSettingsComponent),
        title: 'Manage Site Settings'
      },
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./pages/error/not-found/not-found.component')
      .then(m => m.NotFoundComponent),
    title: '404 - Page Not Found',
    data: {
      meta: {
        title: 'Page Not Found - WestEndRadioTV',
        description: 'The page you are looking for could not be found.',
        noindex: true
      }
    }
  }
];
