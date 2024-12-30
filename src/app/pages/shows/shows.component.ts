import {Component, computed, inject, signal} from '@angular/core';
import {SiteService} from '../../services/site.service';
import {DatePipe, TitleCasePipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {WeeklySchedulesComponent} from '../../components/weekly-schedules/weekly-schedules.component';

@Component({
  selector: 'app-shows',
  imports: [

    FormsModule,
    WeeklySchedulesComponent,

  ],
  templateUrl: './shows.component.html',
  styleUrl: './shows.component.scss'
})
export class ShowsComponent {


}
