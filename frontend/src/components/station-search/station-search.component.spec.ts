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
  { 
    id: 'a1', 
    station: 'Hamburg Hbf', 
    line: 'ICE 123',
    when: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    delay: 5, 
    platform: '1',
    plannedWhen: new Date(Date.now() + 15 * 60 * 1000).toISOString()
  },
  { 
    id: 'a2', 
    station: 'Hannover Hbf', 
    line: 'ICE 456',
    when: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    delay: 0, 
    platform: '2',
    plannedWhen: new Date(Date.now() + 45 * 60 * 1000).toISOString()
  }
];

const mockDepartures = [
  { 
    id: 'd1', 
    station: 'Munich Hbf', 
    line: 'ICE 789',
    when: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    delay: 10, 
    platform: '3',
    plannedWhen: new Date(Date.now() + 20 * 60 * 1000).toISOString()
  },
  { 
    id: 'd2', 
    station: 'Cologne Hbf', 
    line: 'ICE 101',
    when: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
    delay: 0, 
    platform: '4',
    plannedWhen: new Date(Date.now() + 90 * 60 * 1000).toISOString()
  }
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
    expect(component.departureFilterForm).toBeTruthy();
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
    expect(component.departureFilterForm.get('searchTerm')?.disabled).toBeTrue();
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
    component.departureFilterForm.enable();
    component.departureFilterForm.patchValue({ searchTerm: 'Berlin Hbf' });
    
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
    component.departureFilterForm.enable();
    component.departureFilterForm.patchValue({ searchTerm: testTerm });
    
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
    expect(component.departureFilterForm.get('searchTerm')?.value).toBe(station.name);
  });

  it('should handle search with invalid station', () => {
    component.stations = mockStations;
    component.departureFilterForm.patchValue({ searchTerm: 'Nonexistent Station' });

    component.onSearch();

    expect(component.selectedStation).toBeNull();
    expect(component.arrivalsDataSource.length).toBe(0);
    expect(component.departuresDataSource.length).toBe(0);
    expect(component.filteredArrivals.length).toBe(0);
    expect(component.filteredDepartures.length).toBe(0);
  });

  describe('Departure Time Filter', () => {
    beforeEach(() => {
      component.stations = mockStations;
      component.selectedStation = mockStations[0];
      
      const now = new Date();
      const in30min = new Date(now.getTime() + 30 * 60 * 1000);
      const in90min = new Date(now.getTime() + 90 * 60 * 1000);
      
      component.departuresDataSource = [
        { 
          id: 'd1',
          station: 'Berlin Hbf',
          line: 'ICE 101',
          when: in30min.toISOString(),
          plannedWhen: in30min.toISOString(),
          delay: 0,
          platform: '1'
        },
        { 
          id: 'd2',
          station: 'Hamburg Hbf',
          line: 'ICE 202',
          when: in90min.toISOString(),
          plannedWhen: new Date(in90min.getTime() - 10 * 60 * 1000).toISOString(),
          delay: 10,
          platform: '2'
        }
      ];
      component.filteredDepartures = [...component.departuresDataSource];
    });

    it('should filter departures by maxDeparture time', () => {
      component.departureFilterForm.patchValue({ 
        maxDeparture: 60,
        minDelay: '',
        maxDelay: ''
      });
      
      component.applyDepartureFilters();
      
      expect(component.filteredDepartures.length).toBe(1);
      expect(component.filteredDepartures[0].id).toBe('d1');
    });

    it('should combine maxDeparture with delay filters', () => {
      component.departureFilterForm.patchValue({ 
        maxDeparture: 120,  
        minDelay: '5',
        maxDelay: ''
      });
      
      component.applyDepartureFilters();
      
      expect(component.filteredDepartures.length).toBe(1);
      expect(component.filteredDepartures[0].id).toBe('d2');
      expect(component.filteredDepartures[0].delay).toBe(10);
    });

    it('should clear departure filters', () => {
      component.departureFilterForm.patchValue({ 
        maxDeparture: 30,
        minDelay: '5'
      });
      
      component.onClearDepartureFilters();
      
      expect(component.departureFilterForm.get('maxDeparture')?.value).toBe('');
      expect(component.departureFilterForm.get('minDelay')?.value).toBe('');
      
      expect(component.filteredDepartures.length).toBe(2);
    });
  });

  describe('Arrival Time Filter', () => {
    beforeEach(() => {
      component.stations = mockStations;
      component.selectedStation = mockStations[0];
      
      const now = new Date();
      const in15min = new Date(now.getTime() + 15 * 60 * 1000);
      const in45min = new Date(now.getTime() + 45 * 60 * 1000);
      
      component.arrivalsDataSource = [
        { 
          id: 'a1',
          station: 'Berlin Hbf',
          line: 'ICE 101',
          when: in15min.toISOString(),
          plannedWhen: in15min.toISOString(),
          delay: 0,
          platform: '1'
        },
        { 
          id: 'a2',
          station: 'Hamburg Hbf',
          line: 'ICE 202',
          when: in45min.toISOString(),
          plannedWhen: new Date(in45min.getTime() - 10 * 60 * 1000).toISOString(),
          delay: 10,
          platform: '2'
        }
      ];
      component.filteredArrivals = [...component.arrivalsDataSource];
    });
    
    it('should filter arrivals by maxArrival time', () => {
      component.arrivalFilterForm.patchValue({
        maxArrival: 30,
        minDelay: null,
        maxDelay: null
      });
      
      component.applyArrivalFilters();
      
      expect(component.filteredArrivals.length).toBe(1);
      expect(component.filteredArrivals[0].id).toBe('a1');
    });
    
    it('should filter arrivals by delay', () => {
      component.arrivalFilterForm.patchValue({
        minDelay: '5',
        maxDelay: null,
        maxArrival: null
      });
      
      component.applyArrivalFilters();
      
      expect(component.filteredArrivals.length).toBe(1);
      expect(component.filteredArrivals[0].id).toBe('a2');
      expect(component.filteredArrivals[0].delay).toBe(10);
    });
    
    it('should clear arrival filters', () => {
      component.arrivalFilterForm.patchValue({
        maxArrival: 30,
        minDelay: '5'
      });
      
      component.onClearArrivalFilters();
      
      expect(component.arrivalFilterForm.get('maxArrival')?.value).toBe('');
      expect(component.arrivalFilterForm.get('minDelay')?.value).toBe('');
      
      expect(component.filteredArrivals.length).toBe(2);
    });
  });

  it('should apply filters to arrivals', fakeAsync(() => {
    component.arrivalsDataSource = JSON.parse(JSON.stringify(mockArrivals));
    component.filteredArrivals = JSON.parse(JSON.stringify(mockArrivals));
    component.selectedStation = { id: 1, name: 'Test Station', address: 'Test Address' };
    
    component.arrivalFilterForm.patchValue({ 
      minDelay: '1',
      maxDelay: '',
      maxArrival: ''
    });
    component.applyArrivalFilters();
    tick();
    fixture.detectChanges();
    
    expect(component.filteredArrivals.length).toBe(1);
    expect(component.filteredArrivals[0].id).toBe('a1');
    
    component.arrivalFilterForm.patchValue({ 
      minDelay: '',
      maxDelay: '4',
      maxArrival: ''
    });
    component.applyArrivalFilters();
    tick();
    fixture.detectChanges();
    
    expect(component.filteredArrivals.length).toBe(1);
    expect(component.filteredArrivals[0].id).toBe('a2');
    
    component.arrivalFilterForm.patchValue({ 
      minDelay: '1', 
      maxDelay: '10',
      maxArrival: ''
    });
    component.applyArrivalFilters();
    tick();
    fixture.detectChanges();
    
    expect(component.filteredArrivals.length).toBe(1);
    expect(component.filteredArrivals[0].id).toBe('a1');
    
    component.arrivalFilterForm.patchValue({ 
      minDelay: '100', 
      maxDelay: '200',
      maxArrival: ''
    });
    component.applyArrivalFilters();
    tick();
    fixture.detectChanges();
    
    expect(component.filteredArrivals.length).toBe(0);
  }));

  it('should handle search with invalid station', () => {
    component.stations = mockStations;
    component.departureFilterForm.patchValue({ searchTerm: 'Nonexistent Station' });

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
