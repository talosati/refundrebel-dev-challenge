import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, Observable, of } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { JourneyService, JourneyParams } from '../../services/journey.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { map, startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormatDelayPipe, getDelayClass } from '../../pipes/format-delay.pipe';
import { DateTimeFormatPipe } from '../../pipes/date-time-format.pipe';
import { Station, StationService } from '../../services/station.service';

@Component({
  selector: 'app-journey-search',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    MatTableModule,
    MatAutocompleteModule,
    DateTimeFormatPipe,
    FormatDelayPipe
  ],
  providers: [StationService],
  templateUrl: './journey-search.component.html',
  styleUrls: ['./journey-search.component.scss']
})

export class JourneySearchComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  journeys: any[] = [];
  isLoading = false;
  error: string | null = null;
  stationsLoaded = false;
  hasSearched = false;
  
  allStations: Station[] = []; 
  filteredFromStations: Observable<Station[]> = of([]);
  filteredToStations: Observable<Station[]> = of([]);
  selectedFromStation: Station | null = null;
  selectedToStation: Station | null = null;
  
  displayedColumns: string[] = [
    "id",
    "name",
    "destination",
    "line",
    "departure",
    "departureDelay",
    "departurePlatform",
    "arrival",
    "arrivalDelay",
    "arrivalPlatform"
  ];

  private journeySubscription?: Subscription;

  getDelayClass = getDelayClass;

  constructor(
    private fb: FormBuilder,
    private journeyService: JourneyService,
    private stationService: StationService,
    private snackBar: MatSnackBar
  ) {
    this.searchForm = this.fb.group({
      from: ['', Validators.required],
      to: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadStations();
    this.setupStationFilters();
  }
  
  private loadStations(): void {
    this.stationsLoaded = false;
    this.stationService.getStations().subscribe({
      next: (response: any) => {
        this.allStations = response?.data || [];
        this.stationsLoaded = true;
        this.searchForm.get('from')?.setValue('');
        this.searchForm.get('to')?.setValue('');
      },
      error: (error) => {
        console.error('Error loading stations:', error);
        this.allStations = [];
        this.snackBar.open('Error loading stations. Please try again later.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.stationsLoaded = true;
      }
    });
  }
  
  private setupStationFilters(): void {
    this.filteredFromStations = this.searchForm.get('from')!.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      map(value => {
        if (!value) {
          return this.allStations.slice();
        }
        const searchTerm = typeof value === 'string' ? value : value.name || '';
        return searchTerm ? this._filterStations(searchTerm) : this.allStations.slice();
      })
    );
    
    this.filteredToStations = this.searchForm.get('to')!.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      map(value => {
        if (!value) {
          return this.allStations.slice();
        }
        const searchTerm = typeof value === 'string' ? value : value.name || '';
        return searchTerm ? this._filterStations(searchTerm) : this.allStations.slice();
      })
    );
  }
  
  private _filterStations(searchTerm: string): Station[] {
    if (!searchTerm || !Array.isArray(this.allStations)) {
      return [];
    }
    
    const filterValue = searchTerm.toLowerCase().trim();
    return this.allStations.filter(station => {
      if (!station) return false;
      const nameMatch = station.name?.toLowerCase().includes(filterValue) || false;
      const idMatch = station.id ? station.id.toString().includes(filterValue) : false;
      return nameMatch || idMatch;
    });
  }
  
  displayStation(station: Station): string {
    return station && station.name ? station.name : '';
  }
  
  onFromStationSelected(station: Station): void {
    if (station && station.id) {
      this.selectedFromStation = station;
      this.searchForm.get('from')!.setValue(station.name, { emitEvent: false });
    }
  }
  
  onToStationSelected(station: Station): void {
    if (station && station.id) {
      this.selectedToStation = station;
      this.searchForm.get('to')!.setValue(station.name, { emitEvent: false });
    }
  }
  
  clearFromStation(event: Event): void {
    event.stopPropagation();
    this.searchForm.get('from')!.setValue('');
    this.selectedFromStation = null;
    this.filteredFromStations = of(this.allStations);
  }
  
  clearToStation(event: Event): void {
    event.stopPropagation();
    this.searchForm.get('to')!.setValue('');
    this.selectedToStation = null;
    this.filteredToStations = of(this.allStations);
  }

  onSubmit(): void {
    if (this.searchForm.invalid) {
      this.snackBar.open('Please fill in all required fields', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const fromStation = this.selectedFromStation;
    const toStation = this.selectedToStation;
    const fromStationName = this.searchForm.get('from')?.value?.trim();
    const toStationName = this.searchForm.get('to')?.value?.trim();

    if (fromStation && toStation) {
      this.searchJourneys(fromStation.id, toStation.id);
      return;
    }
    if (fromStationName && toStationName) {
      const fromStationMatch = this.allStations.find(s => 
        s.name.toLowerCase() === fromStationName.toLowerCase()
      );
      
      const toStationMatch = this.allStations.find(s => 
        s.name.toLowerCase() === toStationName.toLowerCase()
      );

      if (fromStationMatch && toStationMatch) {
        this.selectedFromStation = fromStationMatch;
        this.selectedToStation = toStationMatch;
        this.searchJourneys(fromStationMatch.id, toStationMatch.id);
        return;
      }
    }

    this.snackBar.open('Please select valid departure and arrival stations from the dropdown', 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private searchJourneys(fromStationId: string | number, toStationId: string | number): void {
    if (!fromStationId || !toStationId) {
      this.error = 'Please select both departure and arrival stations';
      this.snackBar.open(this.error, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.hasSearched = true;
    
    const params: JourneyParams = {
      from: fromStationId.toString(),
      to: toStationId.toString()
    };
    
    this.journeySubscription?.unsubscribe();
    this.journeySubscription = this.journeyService.getJourneys(params).subscribe({
      next: (response: any) => {
        this.journeys = Array.isArray(response?.data) ? response.data : [];
        this.isLoading = false;
      },
      error: (error: any) => {
        this.error = 'Failed to fetch journey data. Please try again.';
        this.isLoading = false;
        console.error('Error fetching journey data:', error);
        this.snackBar.open(this.error, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.journeySubscription?.unsubscribe();
  }
}
