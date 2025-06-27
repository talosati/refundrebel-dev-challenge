/// <reference types="@types/jasmine" />

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AppComponent } from './app.component';
import { JourneyService } from '../services/journey.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  let journeyServiceSpy: jasmine.SpyObj<JourneyService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('JourneyService', ['getJourneys']);
    
    await TestBed.configureTestingModule({
      imports: [
        MatToolbarModule,
        AppComponent
      ],
      providers: [
        { provide: JourneyService, useValue: spy }
      ]
    }).compileComponents();

    journeyServiceSpy = TestBed.inject(JourneyService) as jasmine.SpyObj<JourneyService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have the 'RefundRebel' title`, () => {
    expect(component.title).toEqual('RefundRebel');
  });

  it('should render toolbar', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('mat-toolbar')).toBeTruthy();
  });
});
