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
  filterForm: FormGroup;
  arrivalFilterForm: FormGroup;
  searchTerm = '';

  getDelayClass = getDelayClass;

  constructor(
    private stationService: StationService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      searchTerm: [{ value: '', disabled: false }],
      minDelay: [''],
      maxDelay: ['']
    });

    this.arrivalFilterForm = this.fb.group({
      minDelay: [''],
      maxDelay: ['']
    });

    this.stationSubscription = this.stationService.getStations().subscribe({
      next: (stations: any) => {
        this.stations = stations.data;
        this.stationsLoaded = true;
        this.filterForm.get('searchTerm')?.enable();
        this.filteredStations = of(this._filter(''));
      },
      error: (error: any) => {
        console.error('Error loading stations:', error);
        this.stationsLoaded = false;
        this.filterForm.get('searchTerm')?.disable();
      }
    });

    this.filterForm.valueChanges.subscribe((value) => {
      if (value.searchTerm !== undefined) {
        this.searchTerm = value.searchTerm;
        this.onInputChange(value.searchTerm);
      }
      
      if (value.minDelay !== undefined || value.maxDelay !== undefined) {
        this.applyFilters();
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
    this.filterForm.get('searchTerm')?.disable();

    this.stationSubscription = this.stationService.getStations().subscribe({
      next: (stations: any) => {
        this.stations = stations.data;
        this.stationsLoaded = true;
        this.filterForm.get('searchTerm')?.enable();
        this.filteredStations = of(this._filter(''));
      },
      error: (error: any) => {
        console.error('Error loading stations:', error);
        this.stationsLoaded = false;
        this.filterForm.get('searchTerm')?.disable();
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
      this.filterForm.get('searchTerm')?.setValue(selectedStation.name);
      this.searchEvent.emit(selectedStation.id.toString());
    }
  }

  onSearch(): void {
    const searchTerm = this.filterForm.get('searchTerm')?.value?.trim();
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
      }
      
      this.searchEvent.emit(searchTerm);
    }
  }

  onClearFilters(): void {
    this.filterForm.patchValue({
      minDelay: '',
      maxDelay: ''
    });
    this.applyFilters();
  }

  onClearArrivalFilters(): void {
    this.arrivalFilterForm.patchValue({
      minDelay: '',
      maxDelay: ''
    });
    this.applyArrivalFilters();
  }

  applyFilters(): void {
    if (!this.departuresDataSource) {
      this.filteredDepartures = [];
      return;
    }

    const minDelay = this.filterForm.get('minDelay')?.value;
    const maxDelay = this.filterForm.get('maxDelay')?.value;

    if (!minDelay && !maxDelay) {
      this.filteredDepartures = [...this.departuresDataSource];
      return;
    }

    this.filteredDepartures = this.departuresDataSource.filter(departure => {
      const delay = departure.delay || 0;
      
      const minDelayNum = minDelay ? Number(minDelay) : null;
      const maxDelayNum = maxDelay ? Number(maxDelay) : null;
      
      const minDelayValid = minDelayNum === null || delay >= minDelayNum;
      const maxDelayValid = maxDelayNum === null || delay <= maxDelayNum;
      
      return minDelayValid && maxDelayValid;
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
          this.filteredDepartures = [...this.departuresDataSource];
          this.filteredArrivals = [...this.arrivalsDataSource];
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

    if (!minDelay && !maxDelay) {
      this.filteredArrivals = [...this.arrivalsDataSource];
      return;
    }

    this.filteredArrivals = this.arrivalsDataSource.filter(arrival => {
      const delay = arrival.delay || 0;
      
      const minDelayNum = minDelay ? Number(minDelay) : null;
      const maxDelayNum = maxDelay ? Number(maxDelay) : null;
      
      const minDelayValid = minDelayNum === null || delay >= minDelayNum;
      const maxDelayValid = maxDelayNum === null || delay <= maxDelayNum;
      
      return minDelayValid && maxDelayValid;
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
    this.filterForm.reset();
    this.arrivalFilterForm.reset();
    this.searchEvent.emit('');
  }

  ngOnDestroy(): void {
    this.stationSubscription?.unsubscribe();
  }
}
