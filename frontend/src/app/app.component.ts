import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { JourneySearchComponent } from '../components/journey-search/journey-search.component';
import { StationSearchComponent } from '../components/station-search/station-search.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    JourneySearchComponent,
    StationSearchComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'RefundRebel';
}
