import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { JourneySearchComponent } from './journey-search.component';
import { JourneyService, JourneyParams } from '../../services/journey.service';
import { StationService, Station } from '../../services/station.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormatDelayPipe } from '../../pipes/format-delay.pipe';
import { DateTimeFormatPipe } from '../../pipes/date-time-format.pipe';

describe('JourneySearchComponent', () => {
  let component: JourneySearchComponent;
  let fixture: ComponentFixture<JourneySearchComponent>;
  let journeyServiceSpy: jasmine.SpyObj<JourneyService>;
  let stationServiceSpy: jasmine.SpyObj<StationService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  const mockJourney = {
    id: '1',
    name: 'ICE 123',
    destination: 'Berlin Hbf',
    direction: 'Berlin',
    line: 'ICE 123',
    arrival: '2025-06-28T12:00:00Z',
    departure: '2025-06-28T10:00:00Z',
    arrivalDelay: 5,
    arrivalPlatform: '5',
    departureDelay: 0,
    departurePlatform: '8'
  };

  const mockStations: Station[] = [
    { id: 1, name: 'Berlin Hbf', address: 'Berlin' },
    { id: 2, name: 'Hamburg Hbf', address: 'Hamburg' },
    { id: 3, name: 'München Hbf', address: 'München' },
    { id: 4, name: 'Köln Hbf', address: 'Köln' },
  ];

  beforeEach(waitForAsync(() => {
    stationServiceSpy = jasmine.createSpyObj('StationService', ['getStations']);
    journeyServiceSpy = jasmine.createSpyObj('JourneyService', ['getJourneys']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        JourneySearchComponent,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatIconModule,
        MatTableModule,
        MatAutocompleteModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        FormatDelayPipe,
        DateTimeFormatPipe
      ],
      providers: [
        { provide: StationService, useValue: stationServiceSpy },
        { provide: JourneyService, useValue: journeyServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
      ]
    });
    
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(JourneySearchComponent);
      component = fixture.componentInstance;
      stationServiceSpy.getStations.and.returnValue(of(mockStations));
      fixture.detectChanges();
    });
  }));
  
  afterEach(() => {
    stationServiceSpy.getStations.calls.reset();
    snackBarSpy.open.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.searchForm.get('from')?.value).toBe('');
    expect(component.searchForm.get('to')?.value).toBe('');
    expect(component.selectedFromStation).toBeNull();
    expect(component.selectedToStation).toBeNull();
    expect(component.searchForm.get('date')).toBeFalsy();
    expect(component.searchForm.get('time')).toBeFalsy();
  });

  it('should mark form as invalid when empty', () => {
    component.searchForm.setValue({
      from: '',
      to: '',
    });
    expect(component.searchForm.valid).toBeFalse();
    
    component.searchForm.setValue({
      from: mockStations[0],
      to: mockStations[1],
    });
    expect(component.searchForm.valid).toBeTrue();
  });

  it('should mark form as valid when all fields are filled with station objects', () => {
    component.searchForm.setValue({
      from: mockStations[0],
      to: mockStations[1],
    });
    expect(component.searchForm.valid).toBeTrue();
  });

  it('should call journeyService.getJourneys with station IDs on form submit', () => {
    const mockResponse = { data: [mockJourney] };
    journeyServiceSpy.getJourneys.and.returnValue(of(mockResponse));
    
    component.selectedFromStation = mockStations[0];
    component.selectedToStation = mockStations[1];
    
    component.searchForm.setValue({
      from: mockStations[0].name,
      to: mockStations[1].name,
    });
    
    component.onSubmit();
    
    expect(journeyServiceSpy.getJourneys).toHaveBeenCalledWith({
      from: mockStations[0].id.toString(),
      to: mockStations[1].id.toString(),
    } as JourneyParams);
    expect(component.isLoading).toBeFalse();
    expect(component.journeys).toEqual([mockJourney]);
  });

  it('should not call journeyService.getJourneys when form is invalid', () => {
    component.searchForm.setValue({
      from: '',
      to: '',
    });
    
    component.onSubmit();
    
    expect(journeyServiceSpy.getJourneys).not.toHaveBeenCalled();
  });

  it('should filter stations based on input', () => {
    component.allStations = [...mockStations];
    
    const filtered = component['_filterStations']('Berlin');
    expect(filtered.length).withContext('Should find one matching station').toBe(1);
    expect(filtered[0].name).withContext('Should find Berlin Hbf').toBe('Berlin Hbf');
    
    const emptySearch = component['_filterStations']('');
    expect(emptySearch).withContext('Should return empty array on empty input').toEqual([]);
    
    const noMatch = component['_filterStations']('Nonexistent');
    expect(noMatch).withContext('Should return empty array for no matches').toEqual([]);
  });

  it('should handle station selection', () => {
    const station = mockStations[0];
    
    component.onFromStationSelected(station);
    
    expect(component.selectedFromStation).toEqual(station);
    expect(component.searchForm.get('from')?.value).toBe(station.name);
    
    component.onToStationSelected(mockStations[1]);
    expect(component.selectedToStation).toEqual(mockStations[1]);
    expect(component.searchForm.get('to')?.value).toBe(mockStations[1].name);
    
    expect(component.searchForm.valid).toBeTrue();
  });

  it('should clear selected station', () => {
    component.selectedFromStation = mockStations[0];
    component.searchForm.get('from')?.setValue(mockStations[0].name);
    
    const event = { stopPropagation: jasmine.createSpy('stopPropagation') } as any;
    component.clearFromStation(event);
    
    expect(component.selectedFromStation).toBeNull();
    expect(component.searchForm.get('from')?.value).toBe('');
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('should have journey data structure', () => {
    component.journeys = [
      { 
        id: 1, 
        name: 'ICE 123',
        destination: 'Berlin Hbf',
        direction: 'Berlin',
        line: 'ICE 123',
        arrival: '2025-06-28T12:00:00Z',
        departure: '2025-06-28T10:00:00Z',
        arrivalDelay: 5,
        arrivalPlatform: '5',
        departureDelay: 0,
        departurePlatform: '8',
        price: 29.99,
        duration: 90
      }
    ];
    
    expect(component.journeys.length).toBe(1);
    expect(component.journeys[0].id).toBeDefined();
    expect(component.journeys[0].name).toBeDefined();
    expect(component.journeys[0].destination).toBeDefined();
    expect(component.journeys[0].line).toBeDefined();
    expect(component.journeys[0].arrival).toBeDefined();
    expect(component.journeys[0].departure).toBeDefined();
    expect(component.journeys[0].arrivalDelay).toBeDefined();
    expect(component.journeys[0].departureDelay).toBeDefined();
  });

  it('should show loading spinner when loading', () => {
    component.isLoading = true;
    fixture.detectChanges();
    
    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).withContext('Loading spinner should be shown when loading').toBeTruthy();
    
    const button = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).withContext('Submit button should be disabled when loading').toBeTrue();
  });
});
