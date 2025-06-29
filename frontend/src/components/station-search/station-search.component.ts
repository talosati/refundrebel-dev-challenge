import { Component, EventEmitter, Output, OnInit, OnDestroy, ViewChild } from '@angular/core';
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
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { HttpClient } from '@angular/common/http';
import { Station, StationService } from '../../services/station.service';
import { DateTimeFormatPipe } from '../../pipes';

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
    MatProgressSpinnerModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    DateTimeFormatPipe
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
  @Output() arrivalsLoaded = new EventEmitter<any[]>();
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  searchTerm: string = '';
  stations: Station[] = [];
  filteredStations: Observable<Station[]> = of([]);
  selectedStation: Station | null = null;
  private stationSubscription?: Subscription;
  stationsLoaded = false;
  
  displayedArrivalColumns: string[] = ['station', 'line', 'arrival', 'delay', 'arrivalPlatform'];
  displayedDepartureColumns: string[] = ['station', 'line', 'departure', 'departureDelay', 'departurePlatform'];
  arrivalsDataSource: any[] = [];
  departuresDataSource: any[] = [];
  isLoading = false;

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
      const searchTerm = this.searchTerm.trim().toLowerCase();
      const foundStation = this.stations.find(station => 
        station.name.toLowerCase() === searchTerm
      );
      
      if (foundStation) {
        this.selectedStation = foundStation;
        this.getArrivalsAndDepartures(foundStation.id);
      } else {
        this.selectedStation = null;
      }
      
      this.searchEvent.emit(this.searchTerm.trim());
    }
  }

  private getArrivalsAndDepartures(stationId: string | number): void {
    this.isLoading = true;
    this.stationService.getArrivalsAndDepartures(stationId).subscribe({
      next: (response: any) => {
        if (response) {
          this.isLoading = false;
          console.log("response", response);
          this.arrivalsDataSource = response.arrivals;
          this.departuresDataSource = response.departures;
          console.log("this.arrivalsDataSource", this.arrivalsDataSource)
          console.log("this.departuresDataSource", this.departuresDataSource)
          this.arrivalsLoaded.emit(response);
        } else {
          this.arrivalsDataSource = [];
          this.departuresDataSource = [];
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching arrivals:', error);
        this.arrivalsDataSource = [];
        this.departuresDataSource = [];
      }
    });
  }

  onClear(): void {
    this.searchTerm = '';
    this.arrivalsDataSource = [];
    this.departuresDataSource = [];
    this.searchEvent.emit('');
  }

  ngOnDestroy(): void {
    this.stationSubscription?.unsubscribe();
  }

  formatDelay(delayInSeconds: number): string {
    if (!delayInSeconds) return 'On time';
    const minutes = Math.floor(delayInSeconds / 60);
    return `${minutes} min${minutes !== 1 ? 's' : ''} late`;
  }
}
