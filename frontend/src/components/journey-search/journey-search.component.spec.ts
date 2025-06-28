import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError, Subject } from 'rxjs';
import { JourneySearchComponent } from './journey-search.component';
import { JourneyService } from '../../services/journey.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

describe('JourneySearchComponent', () => {
  let component: JourneySearchComponent;
  let fixture: ComponentFixture<JourneySearchComponent>;
  let journeyServiceSpy: jasmine.SpyObj<JourneyService>;
  let snackBar: MatSnackBar;

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

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('JourneyService', ['getJourneys']);
    
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatIconModule,
        MatTableModule,
        NoopAnimationsModule,
        JourneySearchComponent
      ],
      providers: [
        { provide: JourneyService, useValue: spy }
      ]
    }).compileComponents();

    journeyServiceSpy = TestBed.inject(JourneyService) as jasmine.SpyObj<JourneyService>;
    snackBar = TestBed.inject(MatSnackBar);
    
    spyOn(snackBar, 'open').and.callThrough();
    
    fixture = TestBed.createComponent(JourneySearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.searchForm.get('from')?.value).toBe('8000105');
    expect(component.searchForm.get('to')?.value).toBe('8010330');
    expect(component.searchForm.get('departure')).toBeTruthy();
  });

  it('should mark form as invalid when empty', () => {
    component.searchForm.setValue({
      from: '',
      to: '',
      departure: ''
    });
    expect(component.searchForm.valid).toBeFalse();
  });

  it('should mark form as valid when all fields are filled', () => {
    component.searchForm.setValue({
      from: '8000105',
      to: '8010330',
      departure: new Date().toISOString()
    });
    expect(component.searchForm.valid).toBeTrue();
  });

  it('should call journeyService.getJourneys with correct parameters on form submit', () => {
    const testDate = new Date();
    const mockResponse = { data: [mockJourney] };
    journeyServiceSpy.getJourneys.and.returnValue(of(mockResponse));
    
    component.searchForm.setValue({
      from: '8000105',
      to: '8010330',
      departure: testDate.toISOString()
    });
    
    component.onSubmit();
    
    expect(journeyServiceSpy.getJourneys).toHaveBeenCalledWith({
      from: '8000105',
      to: '8010330',
      departure: testDate.toISOString()
    });
    expect(component.isLoading).toBeFalse();
    expect(component.journeys).toEqual([mockJourney]);
  });

  it('should not call journeyService.getJourneys when form is invalid', () => {
    component.searchForm.setValue({
      from: '',
      to: '',
      departure: ''
    });
    
    component.onSubmit();
    
    expect(journeyServiceSpy.getJourneys).not.toHaveBeenCalled();
  });

  it('should set loading state to true during API call', () => {
    const responseSubject = new Subject<any>();
    journeyServiceSpy.getJourneys.and.returnValue(responseSubject.asObservable());
    
    component.onSubmit();
    
    expect(component.isLoading).toBeTrue();
    
    responseSubject.complete();
  });

  it('should handle empty results by setting journeys to empty array', fakeAsync(() => {
    const mockResponse = { data: [] };
    journeyServiceSpy.getJourneys.and.returnValue(of(mockResponse));
    
    component.onSubmit();
    tick();
    
    expect(component.journeys).toEqual([]);
    expect(component.isLoading).toBeFalse();
  }));

  it('should handle API errors by setting error state', fakeAsync(() => {
    const error = new Error('API Error');
    journeyServiceSpy.getJourneys.and.returnValue(throwError(() => error));
    
    component.onSubmit();
    tick();
    
    expect(component.error).toBe('Failed to fetch journeys. Please try again.');
    expect(component.isLoading).toBeFalse();
  }));

  it('should unsubscribe from journey subscription on destroy', () => {
    const mockSubscription = jasmine.createSpyObj('Subscription', ['unsubscribe']);
    
    journeyServiceSpy.getJourneys.and.returnValue({
      subscribe: () => mockSubscription
    } as any);
    
    component.onSubmit();
    component.ngOnDestroy();
    
    expect(mockSubscription.unsubscribe).toHaveBeenCalled();
  });

  it('should render the journey table when there are results', () => {
    const mockResponse = { data: [mockJourney] };
    journeyServiceSpy.getJourneys.and.returnValue(of(mockResponse));
    
    component.onSubmit();
    fixture.detectChanges();
    
    const table = fixture.nativeElement.querySelector('table');
    expect(table).toBeTruthy();
    
    const rows = fixture.nativeElement.querySelectorAll('tr');
    expect(rows.length).toBe(2);
  });

  it('should display loading spinner when loading', () => {
    component.isLoading = true;
    fixture.detectChanges();
    
    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).toBeTruthy();
    
    const button = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBeTrue();
  });
});
