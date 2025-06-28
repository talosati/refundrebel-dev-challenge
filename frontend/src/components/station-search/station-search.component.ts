import { Component, EventEmitter, Output, OnInit, OnDestroy, Inject, InjectionToken } from '@angular/core';
import { Subscription, Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { Station, StationService } from '../../services/station.service';

@Component({
  selector: 'app-station-search',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  providers: [
    HttpClient,
    StationService
  ],
  templateUrl: './station-search.component.html',
  styleUrls: ['./station-search.component.scss']
})
export class StationSearchComponent implements OnInit, OnDestroy {
  @Output() searchEvent = new EventEmitter<string>();
  searchTerm: string = '';
  stations: Station[] = [];
  filteredStations: Observable<Station[]> = of([]);
  private stationSubscription?: Subscription;
  stationsLoaded = false;

  constructor(private stationService: StationService) {}

  ngOnInit(): void {
    this.loadStations();
  }

  private loadStations(): void {
    this.stationSubscription?.unsubscribe();
    this.stations = []; 
    this.stationsLoaded = false;

    this.stationSubscription = this.stationService.getStations().subscribe({
      next: (stations: any) => {
          this.stations = stations.data;
          this.stationsLoaded = true;
          this.filteredStations = of(this._filter(this.searchTerm || ''));
      },
      error: (error: any) => {
        console.error('Error loading stations:', error);
      }
    });
  }

  private _filter(value: string): Station[] {
    if (!this.stationsLoaded || !Array.isArray(this.stations)) {
      return [];
    }
    
    if (!value) {
      return [];
    }
    
    const filterValue = value.toLowerCase().trim();
    
    return this.stations.filter(station => {
      if (!station || !station.name) return false;

      return station.name.toLowerCase().includes(filterValue);
    });
  }

  onInputChange(value: string): void {
    this.searchTerm = value;
    this.filteredStations = of(this._filter(value));
  }

  displayFn(station: Station): string {
    return station && station.name ? station.name : '';
  }

  onOptionSelected(selectedStation: Station): void {
    this.searchTerm = selectedStation.name;
    this.searchEvent.emit(selectedStation.id.toString());
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      console.log("Search term:", this.searchTerm.trim());
      this.searchEvent.emit(this.searchTerm.trim());
    }
  }

  onClear(): void {
    this.searchTerm = '';
    this.searchEvent.emit('');
  }

  ngOnDestroy(): void {
    this.stationSubscription?.unsubscribe();
  }
}
