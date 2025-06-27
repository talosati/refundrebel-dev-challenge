import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { JourneySearchComponent } from './journey-search.component';
import { JourneyService } from '../../services/journey.service';
import { of, throwError } from 'rxjs';

describe('JourneySearchComponent', () => {
  let component: JourneySearchComponent;
  let fixture: ComponentFixture<JourneySearchComponent>;
  let journeyServiceSpy: jasmine.SpyObj<JourneyService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('JourneyService', ['getJourneys']);
    
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        JourneySearchComponent
      ],
      providers: [
        { provide: JourneyService, useValue: spy }
      ]
    }).compileComponents();

    journeyServiceSpy = TestBed.inject(JourneyService) as jasmine.SpyObj<JourneyService>;
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

  it('should call journeyService.getJourneys on form submit', () => {
    const mockResponse = { journeys: [] };
    journeyServiceSpy.getJourneys.and.returnValue(of(mockResponse));
    
    component.onSubmit();
    
    expect(journeyServiceSpy.getJourneys).toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();
    expect(component.journeys).toEqual([]);
  });

  it('should handle error when getJourneys fails', () => {
    const error = new Error('API Error');
    journeyServiceSpy.getJourneys.and.returnValue(throwError(() => error));
    
    component.onSubmit();
    
    expect(component.error).toBe('Failed to fetch journeys. Please try again.');
    expect(component.isLoading).toBeFalse();
  });
});
