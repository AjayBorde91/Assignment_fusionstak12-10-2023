import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ToggleService {
  private baseUrl = 'https://localhost:7227/api/User';
  constructor(private http: HttpClient) { }

  toggleUserActivity(username: string, isActive: boolean) {
    const body = {
      username: username,
      isActive: isActive,
    };

    return this.http.post(`${this.baseUrl}/toggle-activity`, body);
  }
}
