import { HttpClient } from '@angular/common/http';
import { Injectable, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateTicketRequest, Ticket } from '../models/ticket';
import { tick } from '@angular/core/testing';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
    private readonly baseUrl = 'http://localhost:5155/api/Tickets';

    constructor(private http:HttpClient){}

    getAll(): Observable<Ticket[]>{
        return this.http.get<Ticket[]>(this.baseUrl);
    }

    getById(incidentId:string):Observable<Ticket>{
        return this.http.get<Ticket>(`${this.baseUrl}/${incidentId}`);
    }

    create(ticket:CreateTicketRequest):Observable<Ticket>{
        return this.http.post<Ticket>(this.baseUrl,ticket);
    }

    classify(incidentId:string):Observable<Ticket>{
        return this.http.post<Ticket>(`${this.baseUrl}/${incidentId}/classify`,{});
    }

    delete(incidentId:string):Observable<void>{
        return this.http.delete<void>(`${this.baseUrl}/${incidentId}`);
    }

    resolve(incidentId: string, rootCause: string, resolution: string): Observable<Ticket> {
      return this.http.post<Ticket>(`${this.baseUrl}/${incidentId}/resolve`, {
        rootCause,
        resolution
    });
}
}
