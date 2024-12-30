import { Component } from '@angular/core';

@Component({
  selector: 'app-live-badge',
  imports: [],
  templateUrl: './live-badge.component.html',
  styleUrl: './live-badge.component.scss'
})
export class LiveBadgeComponent {

  @Input({ required: true }) isLive!: boolean;


}
