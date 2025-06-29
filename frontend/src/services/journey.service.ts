import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface JourneyParams {
  from: string;
  to: string;
}

@Injectable({
  providedIn: 'root'
})
export class JourneyService {
  private apiUrl = `${environment.apiUrl}/journeys`;

  constructor(private http: HttpClient) {}

  /**
   * Get journey information between two stations
   * @param params Journey parameters including from, to, and departure
   * @returns Observable with journey data
   */
  getJourneys(params: JourneyParams): Observable<any> {
    const httpParams = new HttpParams()
      .set('from', params.from)
      .set('to', params.to);

    return this.http.get(this.apiUrl, { params: httpParams });
  }
}
