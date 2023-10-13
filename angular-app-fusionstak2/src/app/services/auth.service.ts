import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt'
import { TokenApiModel } from '../models/token-api.model';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedInUsername: string = '';
  private baseUrl: string = "https://localhost:7227/api/User/"
  private userPayload: any;
  constructor(private http: HttpClient, private router: Router) {
    this.userPayload = this.decodedToken();
    
  }

  signUp(userObj: any) {
    return this.http.post<any>(`${this.baseUrl}register`, userObj)
  }

  signIn(loginObj: any) {
    return this.http.post<any>(`${this.baseUrl}authenticate`, loginObj)
      .pipe(
        tap(response => {
          // Set the username when the user logs in successfully
          this.loggedInUsername = response.username;
        })
      );
  }

  getUsername() {
    return this.loggedInUsername;
  }

  signOut() {
    localStorage.clear();
    this.router.navigate(['login'])
  }

  storeToken(tokenValue: string) {
    localStorage.setItem('token', tokenValue)
  }
  storeRefreshToken(tokenValue: string) {
    localStorage.setItem('refreshToken', tokenValue)
  }

  getToken() {
    return localStorage.getItem('token')
  }
  getRefreshToken() {
    return localStorage.getItem('refreshToken')
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token')
  }

  decodedToken() {
    const jwtHelper = new JwtHelperService();
    const token = this.getToken()!;
    console.log(jwtHelper.decodeToken(token))
    return jwtHelper.decodeToken(token)
  }

  getfullNameFromToken() {
    if (this.userPayload)
      return this.userPayload.name;
  }

  getRoleFromToken() {
    if (this.userPayload)
      return this.userPayload.role;
  }

  getEmailFromToken() {
    if (this.userPayload)
      return this.userPayload.email;
  }

  renewToken(tokenApi: TokenApiModel) {
    return this.http.post<any>(`${this.baseUrl}refresh`, tokenApi)
  }
}
