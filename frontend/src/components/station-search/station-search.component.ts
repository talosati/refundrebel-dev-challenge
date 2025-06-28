import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Station } from '../../services/station.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { StationService } from '../../services/station.service';

@Component({
  selector: 'app-station-search',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  providers: [HttpClient],
  templateUrl: './station-search.component.html',
  styleUrls: ['./station-search.component.scss']
})
export class StationSearchComponent implements OnInit, OnDestroy {
  @Output() searchEvent = new EventEmitter<string>();
  searchTerm: string = '';
  stations: Station[] = [];
  private stationSubscription?: Subscription;

  constructor(private stationService: StationService) {}

  ngOnInit(): void {
    this.loadStations();
  }

  private loadStations(): void {
    this.stationSubscription?.unsubscribe();

    this.stationSubscription = this.stationService.getStations().subscribe({
        next: (stations: Station[]) => {
          this.stations = stations;
        },
        error: (error) => {
          console.error('Error loading stations:', error);
        }
      });
  }

  ngOnDestroy(): void {
    this.stationSubscription?.unsubscribe();
  }

  onSearch(): void {
    if (this.searchTerm) {
      this.searchEvent.emit(this.searchTerm.trim());
    }
  }

  onClear(): void {
    this.searchTerm = '';
    this.searchEvent.emit('');
  }
}
