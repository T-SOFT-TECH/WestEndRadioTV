import {Component, Inject} from '@angular/core';
import {Listener} from '../../../model/listeners.model';
import {DIALOG_DATA, DialogRef} from '@angular/cdk/dialog';
import {ListenersMapComponent} from '../listeners-map/listeners-map.component';
import {NgIcon} from '@ng-icons/core';

export interface MapModalData {
  listeners: Listener[];
  type: 'live' | 'history';
}

@Component({
  selector: 'app-map-modal',
  imports: [
    ListenersMapComponent,
    NgIcon
  ],
  templateUrl: './map-modal.component.html',
  styleUrl: './map-modal.component.scss'
})
export class MapModalComponent {
  constructor(
    public dialogRef: DialogRef<void>,
    @Inject(DIALOG_DATA) public data: MapModalData
  ) {}

  close() {
    this.dialogRef.close();
  }

}
