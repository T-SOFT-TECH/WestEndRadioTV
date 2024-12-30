import {Component, inject} from '@angular/core';
import {Location} from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [
    RouterLink
  ],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent {

  private location = inject(Location)

  goBack() {
    this.location.back();
  }

}
