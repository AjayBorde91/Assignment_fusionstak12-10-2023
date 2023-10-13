import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterUsers',
})
export class FilterUsersPipe implements PipeTransform {
  transform(users: any[], searchTerm: string): any[] {
    if (!users || !searchTerm) {
      return users;
    }

    searchTerm = searchTerm.toLowerCase();

    return users.filter((user) => {
      return (
        (user.firstName && user.firstName.toLowerCase().includes(searchTerm)) ||
        (user.lastName && user.lastName.toLowerCase().includes(searchTerm)) ||
        (user.username && user.username.toLowerCase().includes(searchTerm))
      );
    });
  }
}
