import {Component, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {CountUpDirective} from '../../Directives/Count-Up.directive';

@Component({
  selector: 'app-about',
  imports: [
    CountUpDirective
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {

  protected currentImageId = signal<string | null>(null);

  protected stats = [
    {
      value: 15,
      label: 'Years On Air',
      icon: 'https://cdn-icons-png.flaticon.com/512/2940/2940016.png'
    },
    {
      value: 50,
      label: 'Radio Shows',
      icon: 'https://cdn-icons-png.flaticon.com/512/3588/3588243.png'
    },
    {
      value: 100000,
      label: 'Daily Listeners',
      icon: 'https://cdn-icons-png.flaticon.com/512/1189/1189182.png'
    },
    {
      value: 24,
      label: 'Hours Live',
      icon: 'https://cdn-icons-png.flaticon.com/512/2972/2972531.png'
    }
  ];

  protected services = [
    {
      title: 'Live Broadcasting',
      description: '24/7 live radio programming featuring music, talk shows, and community updates.',
      icon: 'https://cdn-icons-png.flaticon.com/512/9516/9516075.png'
    },
    {
      title: 'Podcast Production',
      description: 'Professional podcast recording and production services for content creators.',
      icon: 'https://cdn-icons-png.flaticon.com/512/2368/2368327.png'
    },
    {
      title: 'Event Coverage',
      description: 'Comprehensive coverage of local events, concerts, and community gatherings.',
      icon: 'https://cdn-icons-png.flaticon.com/512/3176/3176395.png'
    }
  ];

  protected milestones = [
    { year: 2020, event: 'Founded WestEnd Radio TV with our first studio' },
    { year: 2021, event: 'Launched digital streaming platform and mobile app' },
    { year: 2022, event: 'Expanded to 24/7 programming and reached 50,000 daily listeners' },
    { year: 2023, event: 'Opened new state-of-the-art broadcasting facility' },
    { year: 2024, event: 'Launched podcast network and educational programs' }
  ];

  protected partners = [
    {
      id: 1,
      name: 'Spotify',
      logo: 'https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_White.png'
    },
    {
      id: 2,
      name: 'Apple Music',
      logo: 'https://www.apple.com/v/apple-music/p/images/overview/apple_music_logo_white.svg'
    },
    {
      id: 3,
      name: 'SoundCloud',
      logo: 'https://developers.soundcloud.com/assets/logo_white.png'
    },
    {
      id: 4,
      name: 'YouTube Music',
      logo: 'https://music.youtube.com/img/on_platform_logo_light.svg'
    }
  ];

  showImageDetail(id: string) {
    this.currentImageId.set(id);
  }

  hideImageDetail() {
    this.currentImageId.set(null);
  }



}
