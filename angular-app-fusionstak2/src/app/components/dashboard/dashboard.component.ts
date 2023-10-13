import { Component, OnInit } from '@angular/core';
import { ApiService } from './../../services/api.service';
import { AuthService } from './../../services/auth.service';
import { UserStoreService } from 'src/app/services/user-store.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddnewuserComponent } from '../dialog-addnewuser/dialog-addnewuser.component';
import { DialogEditprofileComponent } from '../dialog-editprofile/DialogEditprofileComponent';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FilterUsersPipe } from './../.././filter-users.pipe'; 
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [FilterUsersPipe], 
})
export class DashboardComponent implements OnInit {
  public users: any = [];
  isAscending = true;
  searchTerm: string = '';
  public role!: string;
  public fullName: string = "";
  public isDropdownOpen: boolean = false;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;
  pages: number[] = [];
  paginatedUsers: any[] = [];
  

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private userStore: UserStoreService,
    private MatDialog: MatDialog,
    private http: HttpClient,
  ) {}

  opendialog() {
    this.MatDialog.open(DialogAddnewuserComponent, {
      width: '600px',
      height: '320px'
    });
  }

  performSearch() {
    // Convert the search term to lowercase
    const searchTerm = this.searchTerm.toLowerCase();

    // Filter the users using the FilterUsersPipe
    this.paginatedUsers = this.users.filter((user: any) => {
      return (
        user.firstName.toLowerCase().includes(searchTerm) ||
        user.lastName.toLowerCase().includes(searchTerm) ||
        user.username.toLowerCase().includes(searchTerm)
      );
    });
  }

  sortUsersByFirstName() {
    this.isAscending = !this.isAscending;
    this.paginatedUsers.sort((a, b) => {
      const nameA = a.firstName.toUpperCase();
      const nameB = b.firstName.toUpperCase();

      if (nameA < nameB) {
        return this.isAscending ? -1 : 1;
      } else if (nameA > nameB) {
        return this.isAscending ? 1 : -1;
      } else {
        return 0;
      }
    });
  }
  
  
  toggleUserActivity(username: string, isActive: boolean) {
    this.http
      .post(`https://localhost:7227/api/User/toggle-activity?username=${username}&isActive=${isActive}`, null)
      .subscribe(
        (response) => {
          // Handle success, e.g., show a success message to the user
          console.log(`User ${isActive ? 'activated' : 'deactivated'} successfully:`, response);
          // Update the user's isActive status in your UI as needed
          const user = this.users.find((u: any) => u.username === username);
          if (user) {
            user.isActive = isActive;
          }
        },
        (error) => {
          // Handle error, e.g., show an error message to the user
          console.error('Error toggling user activity:', error);
        }
      );
  }

  onUserActivityChange(user: any) {
    // Toggle the user's isActive property
    user.isActive = user.isActive;
  
    // Call the toggleUserActivity method to update the backend
    this.toggleUserActivity(user.username, user.isActive);
  }

  openeditdialog() {
    this.MatDialog.open(DialogEditprofileComponent, {
      width: '400px',
      height: '470px'
    });
  }

  ngOnInit() {
    this.itemsPerPage = 10;
    this.api.getUsers().subscribe(res => {
      this.users = res;
      this.calculateTotalPages();
      this.updatePages();
      this.updatePaginatedUsers();
      this.sortUsersByFirstName();
    });

    this.userStore.getFullNameFromStore().subscribe(val => {
      const fullNameFromToken = this.auth.getfullNameFromToken();
      this.fullName = val || fullNameFromToken;
    });

    this.userStore.getRoleFromStore().subscribe(val => {
      const roleFromToken = this.auth.getRoleFromToken();
      this.role = val || roleFromToken;
    });
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout() {
    this.auth.signOut();
  }

  calculateTotalPages() {
    this.totalPages = Math.ceil(this.users.length / this.itemsPerPage);
  }

  updatePages() {
    this.pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      this.pages.push(i);
    }
  }

  updatePaginatedUsers() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedUsers = this.users.slice(startIndex, endIndex);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedUsers();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedUsers();
    }
  }

  gotoPage(page: number) {
    this.currentPage = page;
    this.updatePaginatedUsers();
  }

  // Method to delete a user
  deleteUser(username: string) {
    this.http
      .delete(`https://localhost:7227/api/User/delete-user?username=${username}`)
      .subscribe(
        (response) => {
          // Handle success, e.g., show a success message to the user
          console.log('User deleted successfully:', response);
          // Refresh the user list or update the UI as needed
          // You can reload the user list or remove the deleted user from the current list
          this.users = this.users.filter((user: any) => user.username !== username);
          this.calculateTotalPages();
          this.updatePages();
          this.updatePaginatedUsers();
        },
        (error) => {
          // Handle error, e.g., show an error message to the user
          console.error('Error deleting user:', error);
        }
      );
  }
}
