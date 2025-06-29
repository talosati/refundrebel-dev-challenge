import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
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
import { FormatDelayPipe, getDelayClass } from '../../pipes/format-delay.pipe';
import { DateTimeFormatPipe } from '../../pipes/date-time-format.pipe';

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
    DateTimeFormatPipe,
    FormatDelayPipe
  ],
  templateUrl: './journey-search.component.html',
  styleUrls: ['./journey-search.component.scss']
})

export class JourneySearchComponent implements OnDestroy {
  searchForm: FormGroup;
  journeys: any[] = [];
  isLoading = false;
  error: string | null = null;
  
  displayedColumns: string[] = [
    "id",
    "name",
    "destination",
    "direction",
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

  hasSearched = false;

  constructor(
    private formBuilder: FormBuilder,
    private journeyService: JourneyService,
    private snackBar: MatSnackBar
  ) {
    const now = new Date();
    const defaultDate = now.toISOString().slice(0, 16);
    
    this.searchForm = this.formBuilder.group({
      from: ['8000105', Validators.required],
      to: ['8010330', Validators.required],
      departure: [defaultDate, Validators.required]
    });
  }

  onSubmit(): void {
    if (this.searchForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.journeys = [];

    const params: JourneyParams = {
      from: this.searchForm.value.from,
      to: this.searchForm.value.to,
      departure: new Date(this.searchForm.value.departure).toISOString()
    };

    this.journeySubscription?.unsubscribe();

    this.journeySubscription = this.journeyService.getJourneys(params).subscribe({
      next: (response: any) => {
        this.journeys = response.data || [];
        this.isLoading = false;
        this.hasSearched = true;
      },
      error: (err: any) => {
        console.error('Error fetching journeys:', err);
        this.error = 'Failed to fetch journeys. Please try again.';
        this.isLoading = false;
        this.snackBar.open(this.error, 'Close', {
          duration: 5000,
          panelClass: ['mat-toolbar', 'mat-warn']
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.journeySubscription?.unsubscribe();
  }
}
