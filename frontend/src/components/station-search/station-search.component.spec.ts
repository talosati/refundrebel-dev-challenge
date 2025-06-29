import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { of, throwError, Subject } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { StationSearchComponent } from './station-search.component';
import { StationService } from '../../services/station.service';
import { DateTimeFormatPipe } from '../../pipes/date-time-format.pipe';

const mockStations = [
  { id: 1, name: 'Berlin Hbf', address: 'Europaplatz 1, 10557 Berlin' },
  { id: 2, name: 'Hamburg Hbf', address: 'Hachmannplatz 16, 20099 Hamburg' },
  { id: 3, name: 'Munich Hbf', address: 'Bayerstraße 10a, 80335 München' }
];

const mockArrivals = [
  { id: 'a1', station: 'Hamburg Hbf', line: 'ICE 123', arrival: '2025-06-29T10:00:00Z', delay: 5, arrivalPlatform: '1' },
  { id: 'a2', station: 'Hannover Hbf', line: 'ICE 456', arrival: '2025-06-29T11:00:00Z', delay: 0, arrivalPlatform: '2' }
];

const mockDepartures = [
  { id: 'd1', station: 'Munich Hbf', line: 'ICE 789', departure: '2025-06-29T12:00:00Z', delay: 10, departurePlatform: '3' },
  { id: 'd2', station: 'Cologne Hbf', line: 'ICE 101', departure: '2025-06-29T13:00:00Z', delay: 0, departurePlatform: '4' }
];

describe('StationSearchComponent', () => {
  let component: StationSearchComponent;
  let fixture: ComponentFixture<StationSearchComponent>;
  let stationServiceSpy: jasmine.SpyObj<StationService>;
  let destroy$: Subject<void>;
  let searchEmitSpy: jasmine.Spy;
  let arrivalsLoadedEmitSpy: jasmine.Spy;

  beforeEach(async () => {
    const stationSpy = jasmine.createSpyObj('StationService', [
      'getStations',
      'getArrivalsAndDepartures'
    ]);
    stationSpy.getStations.and.returnValue(of(mockStations));
    stationSpy.getArrivalsAndDepartures.and.returnValue(of({
      arrivals: mockArrivals,
      departures: mockDepartures
    }));

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        StationSearchComponent,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatTableModule,
        MatSortModule,
        MatProgressSpinnerModule,
        MatCardModule,
        MatIconModule,
        MatPaginatorModule,
        DateTimeFormatPipe
      ],
      providers: [
        { provide: StationService, useValue: stationSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StationSearchComponent);
    component = fixture.componentInstance;
    stationServiceSpy = stationSpy;
    destroy$ = new Subject<void>();
    searchEmitSpy = spyOn(component.searchEvent, 'emit');
    arrivalsLoadedEmitSpy = spyOn(component.arrivalsLoaded, 'emit');
    
    fixture.detectChanges();
  });

  afterEach(fakeAsync(() => {
    tick(100);
    
    if (destroy$) {
      destroy$.next();
      destroy$.complete();
    }
    if (fixture) {
      fixture.destroy();
    }
    
    if (stationServiceSpy) {
      stationServiceSpy.getStations.calls.reset();
      stationServiceSpy.getArrivalsAndDepartures.calls.reset();
    }
    
    if (searchEmitSpy) {
      searchEmitSpy.calls.reset();
    }
    
    if (arrivalsLoadedEmitSpy) {
      arrivalsLoadedEmitSpy.calls.reset();
    }
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form controls', () => {
    expect(component.filterForm).toBeTruthy();
    expect(component.arrivalFilterForm).toBeTruthy();
  });

  it('should load stations on init', fakeAsync(() => {
    stationServiceSpy.getStations.calls.reset();
    
    const newComponent = new StationSearchComponent(
      stationServiceSpy,
      TestBed.inject(FormBuilder)
    );
    
    stationServiceSpy.getStations.and.returnValue(of({ data: mockStations } as any));
    
    newComponent.ngOnInit();
    tick();
    
    expect(stationServiceSpy.getStations).toHaveBeenCalled();
    expect(newComponent.stations).toEqual(mockStations);
    expect(newComponent.stationsLoaded).toBeTrue();
  }));

  it('should handle station loading error', () => {
    const error: Error = new Error('Failed to load stations');
    stationServiceSpy.getStations.and.returnValue(throwError(() => error));

    fixture = TestBed.createComponent(StationSearchComponent);
    component = fixture.componentInstance;
    searchEmitSpy = spyOn(component.searchEvent, 'emit');
    arrivalsLoadedEmitSpy = spyOn(component.arrivalsLoaded, 'emit');

    fixture.detectChanges();

    expect(component.stationsLoaded).toBeFalse();
    expect(component.filterForm.get('searchTerm')?.disabled).toBeTrue();
  });

  it('should filter stations based on input', (done) => {
    component.stations = [...mockStations];
    component.stationsLoaded = true;

    fixture.detectChanges();

    component.onInputChange('berlin');

    component.filteredStations.subscribe(filtered => {
      try {
        expect(filtered.length).toBe(1);
        expect(filtered[0].name).toContain('Berlin');
        done();
      } catch (err: unknown) {
        done.fail(err instanceof Error ? err : new Error(String(err)));
      }
    });
  });

  it('should emit search event when search button is clicked', fakeAsync(() => {
    const station = { id: 1, name: 'Berlin Hbf', address: 'Europaplatz 1, 10557 Berlin' };
    
    component.stations = [station];
    component.selectedStation = station;
    component.filterForm.enable();
    component.filterForm.patchValue({ searchTerm: 'Berlin Hbf' });
    
    searchEmitSpy.calls.reset();
    
    const mockResponse = { arrivals: [], departures: [] };
    stationServiceSpy.getArrivalsAndDepartures.and.returnValue(of(mockResponse));
    component.onSearch();
    tick();
    fixture.detectChanges();

    expect(searchEmitSpy).toHaveBeenCalledWith('Berlin Hbf');
  }));

  it('should emit search event when Enter key is pressed', fakeAsync(() => {
    const testTerm = 'Hamburg Hbf';
    const station = { id: 1, name: 'Hamburg Hbf', address: 'Hachmannplatz 16, 20099 Hamburg' };
    
    component.stations = [station];
    component.selectedStation = station;
    component.filterForm.enable();
    component.filterForm.patchValue({ searchTerm: testTerm });
    
    searchEmitSpy.calls.reset();
    
    const mockResponse = { arrivals: [], departures: [] };
    stationServiceSpy.getArrivalsAndDepartures.and.returnValue(of(mockResponse));

    const mockEvent = new KeyboardEvent('keyup', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      which: 13,
      bubbles: true,
      cancelable: true
    });
    
    component.onSearch();
    tick();
    fixture.detectChanges();
    expect(searchEmitSpy).toHaveBeenCalledWith(testTerm);
  }));

  it('should clear search and reset form when clear is called', () => {
    component.searchTerm = 'test';
    component.arrivalsDataSource = mockArrivals;
    component.departuresDataSource = mockDepartures;
    component.hasSearched = true;

    component.onClear();

    expect(component.searchTerm).toBe('');
    expect(component.arrivalsDataSource).toEqual([]);
    expect(component.departuresDataSource).toEqual([]);
    expect(component.hasSearched).toBeFalse();
    expect(searchEmitSpy).toHaveBeenCalledWith('');
  });

  it('should handle error when loading arrivals and departures', fakeAsync(() => {
    const error = 'Failed to load data';
    stationServiceSpy.getArrivalsAndDepartures.and.returnValue(throwError(() => error));

    const station = { id: 1, name: 'Berlin Hbf', address: 'Europaplatz 1, 10557 Berlin' };
    component.stations = [station];
    component.selectedStation = station;

    stationServiceSpy.getArrivalsAndDepartures.calls.reset();

    component.onSearch();
    tick();

    expect(component.isLoading).toBeFalse();
    expect(component.arrivalsDataSource).toEqual([]);
    expect(component.departuresDataSource).toEqual([]);
    expect(component.filteredArrivals).toEqual([]);
    expect(component.filteredDepartures).toEqual([]);
  }));

  it('should handle station selection', () => {
    const station = { id: 1, name: 'Berlin Hbf', address: 'Europaplatz 1, 10557 Berlin' };
    const event = { option: { value: station } };
    component.onOptionSelected(event);
    expect(component.selectedStation).toEqual(station);
    expect(component.filterForm.get('searchTerm')?.value).toBe(station.name);
  });

  it('should handle search with invalid station', () => {
    component.stations = mockStations;
    component.filterForm.patchValue({ searchTerm: 'Nonexistent Station' });

    component.onSearch();

    expect(component.selectedStation).toBeNull();
    expect(component.arrivalsDataSource).toEqual([]);
    expect(component.departuresDataSource).toEqual([]);
  });

  it('should apply filters to arrivals', fakeAsync(() => {
    component.arrivalsDataSource = [...mockArrivals];
    component.filteredArrivals = [...mockArrivals];
    component.selectedStation = { id: 1, name: 'Test Station', address: 'Test Address' };
    
    component.arrivalFilterForm.patchValue({ minDelay: '1' });
    component.applyArrivalFilters();
    tick();
    fixture.detectChanges();
    
    const filteredByMinDelay = component.filteredArrivals;
    expect(filteredByMinDelay.length).toBe(1);
    expect(filteredByMinDelay[0].delay).toBe(5);
    
    component.arrivalFilterForm.patchValue({ minDelay: '' });
    component.applyArrivalFilters();
    tick();
    fixture.detectChanges();
    
    component.arrivalFilterForm.patchValue({ maxDelay: '4' });
    component.applyArrivalFilters();
    tick();
    fixture.detectChanges();
    
    const filteredByMaxDelay = component.filteredArrivals;
    expect(filteredByMaxDelay.length).toBe(1);
    expect(filteredByMaxDelay[0].delay).toBe(0);
    
    component.arrivalFilterForm.patchValue({ minDelay: '1', maxDelay: '10' });
    component.applyArrivalFilters();
    tick();
    fixture.detectChanges();
    
    const filteredByBoth = component.filteredArrivals;
    expect(filteredByBoth.length).toBe(1);
    expect(filteredByBoth[0].delay).toBe(5);
    
    component.arrivalFilterForm.patchValue({ minDelay: '100', maxDelay: '200' });
    component.applyArrivalFilters();
    tick();
    fixture.detectChanges();
    
    expect(component.filteredArrivals.length).toBe(0);
  }));

  it('should handle search with invalid station', () => {
    component.stations = mockStations;
    component.filterForm.patchValue({ searchTerm: 'Nonexistent Station' });

    component.onSearch();

    expect(component.selectedStation).toBeNull();
    expect(component.arrivalsDataSource).toEqual([]);
    expect(component.departuresDataSource).toEqual([]);
  });

  it('should clean up subscriptions on destroy', () => {
    const subscription = jasmine.createSpyObj('Subscription', ['unsubscribe']);
    component['stationSubscription'] = subscription as any;
    
    component.ngOnDestroy();
    
    expect(subscription.unsubscribe).toHaveBeenCalled();
  });
});
