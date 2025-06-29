import { Component, EventEmitter, Output, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription, Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
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
import { FormatDelayPipe, getDelayClass } from '../../pipes/format-delay.pipe';
import { DateTimeFormatPipe } from '../../pipes/date-time-format.pipe';

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
    DateTimeFormatPipe,
    FormatDelayPipe
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
  
  stations: Station[] = [];
  filteredStations: Observable<Station[]> = of([]);
  selectedStation: Station | null = null;
  private stationSubscription?: Subscription;
  stationsLoaded = false;
  
  displayedArrivalColumns: string[] = ['station', 'line', 'arrival', 'delay', 'arrivalPlatform'];
  displayedDepartureColumns: string[] = ['station', 'line', 'departure', 'departureDelay', 'departurePlatform'];
  arrivalsDataSource: any[] = [];
  departuresDataSource: any[] = [];
  filteredDepartures: any[] = [];
  filteredArrivals: any[] = [];
  isLoading = false;
  hasSearched = false;
  departureFilterForm: FormGroup;
  arrivalFilterForm: FormGroup;
  searchTerm = '';

  getDelayClass = getDelayClass;

  constructor(
    private stationService: StationService,
    private fb: FormBuilder
  ) {
    this.departureFilterForm = this.fb.group({
      searchTerm: [{ value: '', disabled: false }],
      minDelay: [''],
      maxDelay: [''],
      maxDeparture: [20]
    });

    this.arrivalFilterForm = this.fb.group({
      minDelay: [''],
      maxDelay: [''],
      maxArrival: [20]
    });

    this.stationSubscription = this.stationService.getStations().subscribe({
      next: (stations: any) => {
        this.stations = stations.data;
        this.stationsLoaded = true;
        this.departureFilterForm.get('searchTerm')?.enable();
        this.filteredStations = of(this._filter(''));
      },
      error: (error: any) => {
        console.error('Error loading stations:', error);
        this.stationsLoaded = false;
        this.departureFilterForm.get('searchTerm')?.disable();
      }
    });

    this.departureFilterForm.valueChanges.subscribe((value) => {
      if (value.searchTerm !== undefined) {
        this.searchTerm = value.searchTerm;
        this.onInputChange(value.searchTerm);
      }
      
      if (value.minDelay !== undefined || value.maxDelay !== undefined) {
        this.applyDepartureFilters();
      }
    });

    this.arrivalFilterForm.valueChanges.subscribe(() => {
      this.applyArrivalFilters();
    });
  }

  ngOnInit(): void {
    this.loadStations();
  }

  private loadStations(): void {
    this.stationSubscription?.unsubscribe();
    this.stations = []; 
    this.stationsLoaded = false;
    this.departureFilterForm.get('searchTerm')?.disable();

    this.stationSubscription = this.stationService.getStations().subscribe({
      next: (stations: any) => {
        this.stations = stations.data;
        this.stationsLoaded = true;
        this.departureFilterForm.get('searchTerm')?.enable();
        this.filteredStations = of(this._filter(''));
      },
      error: (error: any) => {
        console.error('Error loading stations:', error);
        this.stationsLoaded = false;
        this.departureFilterForm.get('searchTerm')?.disable();
      }
    });
  }

  private _filter(value: string | null | undefined): Station[] {
    if (!this.stationsLoaded || !Array.isArray(this.stations)) {
      return [];
    }
    
    if (!value) {
      return [];
    }
    
    const filterValue = String(value).toLowerCase().trim();
    
    return this.stations.filter(station => {
      if (!station || !station.name) return false;

      return String(station.name).toLowerCase().includes(filterValue);
    });
  }

  onInputChange(value: string): void {
    this.filteredStations = of(this._filter(value));
  }

  displayFn(station: Station): string {
    return station && station.name ? station.name : '';
  }

  onOptionSelected(event: any): void {
    const selectedStation: Station = event.option?.value ? event.option.value : event;
    if (selectedStation && selectedStation.name) {
      this.departureFilterForm.get('searchTerm')?.setValue(selectedStation.name);
      this.selectedStation = selectedStation;
      this.searchEvent.emit(selectedStation.name);
    }
  }

  onSearch(): void {
    const searchTerm = this.departureFilterForm.get('searchTerm')?.value?.trim();
    if (searchTerm) {
      this.hasSearched = true;
      const foundStation = this.stations.find(station => 
        station.name.toLowerCase() === searchTerm.toLowerCase()
      );

      if (foundStation) {
        this.selectedStation = foundStation;
        this.getArrivalsAndDepartures(foundStation.id);
      } else {
        this.selectedStation = null;
        this.arrivalsDataSource = [];
        this.departuresDataSource = [];
        this.filteredArrivals = [];
        this.filteredDepartures = [];
      }
      
      this.searchEvent.emit(searchTerm);
    }
  }

  onClearDepartureFilters(): void {
    this.departureFilterForm.patchValue({
      minDelay: '',
      maxDelay: '',
      maxDeparture: ''
    });
    this.applyDepartureFilters();
  }

  onClearArrivalFilters(): void {
    this.arrivalFilterForm.patchValue({
      minDelay: '',
      maxDelay: '',
      maxArrival: ''
    });
    this.applyArrivalFilters();
  }

  applyDepartureFilters(): void {
    if (!this.departuresDataSource) {
      this.filteredDepartures = [];
      return;
    }

    const minDelay = this.departureFilterForm.get('minDelay')?.value;
    const maxDelay = this.departureFilterForm.get('maxDelay')?.value;
    const maxDeparture = this.departureFilterForm.get('maxDeparture')?.value;

    if (!minDelay && !maxDelay && !maxDeparture) {
      this.filteredDepartures = [...this.departuresDataSource];
      return;
    }

    const now = new Date();
    const maxTime = maxDeparture ? 
      new Date(now.getTime() + (Number(maxDeparture) * 60000)) : null;

    this.filteredDepartures = this.departuresDataSource.filter(departure => {
      const delay = departure.delay || 0;
      
      const minDelayNum = minDelay ? Number(minDelay) : null;
      const maxDelayNum = maxDelay ? Number(maxDelay) : null;
      
      const minDelayValid = minDelayNum === null || delay >= minDelayNum;
      const maxDelayValid = maxDelayNum === null || delay <= maxDelayNum;
      
      const departureTime = new Date(departure.when);
      const timeValid = !maxTime || departureTime <= maxTime;
      
      return minDelayValid && maxDelayValid && timeValid;
    });
  }

  private getArrivalsAndDepartures(stationId: string | number): void {
    this.isLoading = true;
    this.stationService.getArrivalsAndDepartures(stationId).subscribe({
      next: (response: any) => {
        if (response) {
          this.isLoading = false;
          this.arrivalsDataSource = response.arrivals;
          this.departuresDataSource = response.departures;
          
          this.applyDepartureFilters();
          this.applyArrivalFilters();
          
          this.arrivalsLoaded.emit(response);
        } else {
          this.arrivalsDataSource = [];
          this.departuresDataSource = [];
          this.filteredDepartures = [];
          this.filteredArrivals = [];
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching arrivals:', error);
        this.arrivalsDataSource = [];
        this.departuresDataSource = [];
        this.filteredDepartures = [];
        this.filteredArrivals = [];
      }
    });
  }

  applyArrivalFilters(): void {
    if (!this.arrivalsDataSource) {
      this.filteredArrivals = [];
      return;
    }

    const minDelay = this.arrivalFilterForm.get('minDelay')?.value;
    const maxDelay = this.arrivalFilterForm.get('maxDelay')?.value;
    const maxArrival = this.arrivalFilterForm.get('maxArrival')?.value;

    if (!minDelay && !maxDelay && !maxArrival) {
      this.filteredArrivals = [...this.arrivalsDataSource];
      return;
    }

    const now = new Date();
    const maxTime = maxArrival ? 
      new Date(now.getTime() + (Number(maxArrival) * 60000)) : null;

    this.filteredArrivals = this.arrivalsDataSource.filter(arrival => {
      const delay = arrival.delay || 0;
      
      const minDelayNum = minDelay ? Number(minDelay) : null;
      const maxDelayNum = maxDelay ? Number(maxDelay) : null;
      
      const minDelayValid = minDelayNum === null || delay >= minDelayNum;
      const maxDelayValid = maxDelayNum === null || delay <= maxDelayNum;
      
      const arrivalTime = new Date(arrival.when);
      const timeValid = !maxTime || arrivalTime <= maxTime;
      
      return minDelayValid && maxDelayValid && timeValid;
    });
  }

  onClear(): void {
    this.searchTerm = '';
    this.arrivalsDataSource = [];
    this.departuresDataSource = [];
    this.filteredDepartures = [];
    this.filteredArrivals = [];
    this.hasSearched = false;
    this.selectedStation = null;
    this.departureFilterForm.reset();
    this.arrivalFilterForm.reset();
    this.searchEvent.emit('');
  }

  ngOnDestroy(): void {
    this.stationSubscription?.unsubscribe();
  }
}
