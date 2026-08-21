import { HttpClient } from '@angular/common/http';
import { Injectable, Service } from '@angular/core';
import { TicketOptions } from '../models/ticket-options';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OptionsService {
  private readonly baseUrl = 'http://localhost:5155/api/options';

  constructor(private http: HttpClient) {}

  getOptions(): Observable<TicketOptions> {
    return this.http.get<TicketOptions>(this.baseUrl);
  }
}
