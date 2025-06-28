import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Station {
  id: number;
  name: string;
  address: string;
}

@Injectable({
  providedIn: 'root'
})
export class StationService {
  private apiUrl = `${environment.apiUrl}/stations`;

  constructor(private http: HttpClient) {}

  /**
   * Get all stations
   * @returns Observable with array of stations
   */
  getStations(): Observable<Station[]> {
    return this.http.get<Station[]>(this.apiUrl);
  }

  /**
   * Get arrivals for a specific station
   * @param stationId - The ID of the station
   * @returns Observable with the arrivals data
   */
  getArrivals(stationId: string | number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/arrivals/station/${stationId}`);
  }
}
