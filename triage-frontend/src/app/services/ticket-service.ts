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

    getById(id:number):Observable<Ticket>{
        return this.http.get<Ticket>(`${this.baseUrl}/${id}`);
    }

    create(ticket:CreateTicketRequest):Observable<Ticket>{
        return this.http.post<Ticket>(this.baseUrl,ticket);
    }

    classify(id:number):Observable<Ticket>{
        return this.http.post<Ticket>(`${this.baseUrl}/${id}/classify`,{});
    }

    delete(id:number):Observable<void>{
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
}
