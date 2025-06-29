/// <reference types="@types/jasmine" />

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AppComponent } from './app.component';
import { JourneyService } from '../services/journey.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let compiled: HTMLElement;

  let journeyServiceSpy: jasmine.SpyObj<JourneyService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('JourneyService', ['getJourneys']);
    
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MatToolbarModule,
        AppComponent
      ],
      providers: [
        { provide: JourneyService, useValue: spy }
      ]
    }).compileComponents();

    journeyServiceSpy = TestBed.inject(JourneyService) as jasmine.SpyObj<JourneyService>;
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should have the correct title', () => {
    expect(component.title).toBe('refundrebel');
  });

  it('should render the title in the header toolbar', () => {
    const headerToolbar = compiled.querySelector('mat-toolbar:first-child');
    expect(headerToolbar?.textContent).toContain('refundrebel');
  });

  it('should render the title in the footer toolbar', () => {
    const footerToolbar = compiled.querySelector('.footer .footer-content');
    expect(footerToolbar?.textContent).toContain('refundrebel');
  });

  it('should render the journey-search component', () => {
    expect(compiled.querySelector('app-journey-search')).toBeTruthy();
  });

  it('should have a main content container', () => {
    expect(compiled.querySelector('main.main-content')).toBeTruthy();
    expect(compiled.querySelector('.container')).toBeTruthy();
  });
});
