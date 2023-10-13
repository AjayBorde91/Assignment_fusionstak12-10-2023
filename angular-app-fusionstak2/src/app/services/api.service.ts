import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl: string = 'https://localhost:7227/api/User/';
  constructor(private http: HttpClient) {}

  getUsers() {
    return this.http.get<any>('https://localhost:7227/api/User/get-all-users');
  }
  
}
