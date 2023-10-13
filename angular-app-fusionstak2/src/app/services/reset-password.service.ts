import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ResetPasswordService {
  constructor(private http: HttpClient) {}

  resetPassword(firstName: string, lastName: string, username: string, newPassword: string) {
    const data = { firstName, lastName, username, newPassword };
    return this.http.post('https://localhost:7227/api/User/reset-password', data);
  }
}
