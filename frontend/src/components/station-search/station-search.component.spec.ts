import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { StationSearchComponent } from './station-search.component';

describe('StationSearchComponent', () => {
  let component: StationSearchComponent;
  let fixture: ComponentFixture<StationSearchComponent>;
  let searchSpy: jasmine.Spy;
  let clearSpy: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [StationSearchComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(StationSearchComponent);
    component = fixture.componentInstance;
    searchSpy = spyOn(component.searchEvent, 'emit');
    clearSpy = spyOn(component, 'onClear').and.callThrough();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit search term when search button is clicked', () => {
    const testTerm = 'test station';
    component.searchTerm = testTerm;
    const button = fixture.debugElement.query(By.css('.search-button'));
    
    button.triggerEventHandler('click', null);
    
    expect(searchSpy).toHaveBeenCalledWith(testTerm);
  });

  it('should emit search term when Enter key is pressed', () => {
    const testTerm = 'test station';
    const input = fixture.debugElement.query(By.css('input'));
    component.searchTerm = testTerm;
    
    input.triggerEventHandler('keyup.enter', {});
    
    expect(searchSpy).toHaveBeenCalledWith(testTerm);
  });

  it('should clear search term and emit empty string when clear button is clicked', () => {
    component.searchTerm = 'test';
    fixture.detectChanges();
    
    const clearButton = fixture.debugElement.query(By.css('.clear-button'));
    clearButton.triggerEventHandler('click', null);
    
    expect(component.searchTerm).toBe('');
    expect(searchSpy).toHaveBeenCalledWith('');
  });

  it('should show clear button only when there is text in the input', () => {
    // Initially should not show clear button
    let clearButton = fixture.debugElement.query(By.css('.clear-button'));
    expect(clearButton).toBeNull();

    // Add text to input
    component.searchTerm = 'test';
    fixture.detectChanges();
    
    // Now should show clear button
    clearButton = fixture.debugElement.query(By.css('.clear-button'));
    expect(clearButton).not.toBeNull();
  });
});
