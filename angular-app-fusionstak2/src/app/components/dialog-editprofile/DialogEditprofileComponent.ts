import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service'; 
import { ResetPasswordService } from 'src/app/services/reset-password.service';
import { NgToastService } from 'ng-angular-popup';
import { UserStoreService } from 'src/app/services/user-store.service';
import { OnInit } from '@angular/core';



@Component({
  selector: 'app-dialog-editprofile',
  templateUrl: './dialog-editprofile.component.html',
  styleUrls: ['./dialog-editprofile.component.scss']
})
export class DialogEditprofileComponent implements OnInit {
  username: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  firstName: string = '';
  lastName: string = '';
  public role!: string;
  public email!: string;





  constructor(
    private authService: AuthService, 
    private resetPasswordService: ResetPasswordService,
    private toast: NgToastService, 
    private userStore: UserStoreService,
    private auth: AuthService,

    
  ) {
    // Get the username of the logged-in user
    this.username = this.authService.getUsername(); }

    ngOnInit(){
      

      this.userStore.getEmailFromStore()
      .subscribe(val => {
        const emailFromToken = this.auth.getEmailFromToken();
        this.email = val || emailFromToken;
      });
    }
  resetPassword() {
    
    if (this.newPassword === this.confirmPassword) {
      // Get the username of the currently logged-in user
      const loggedInUsername = this.email;
      
      console.log('loggedInUsername:', this.email);
      console.log('this.username:', this.username);



      if (loggedInUsername === this.username) { // Check if the user making the request matches the logged-in user
        this.resetPasswordService.resetPassword(this.firstName, this.lastName, this.username, this.newPassword)
          .subscribe(() => {
              this.toast.success({ detail: 'Success', summary: 'Password Updated Successfully!', duration: 1000 });
            },
            (error) => {
              console.error('Password reset failed:', error);
              this.toast.error({ detail: 'ERROR', summary: 'Something went wrong!', duration: 1000 });
            }
          );
      } else {
        this.toast.error({ detail: 'ERROR', summary: 'Invalid user for password reset!', duration: 1000 });
      }
    } else {
      this.toast.error({ detail: 'ERROR', summary: 'Passwords do not match!', duration: 1000 });
    }
  }
}
