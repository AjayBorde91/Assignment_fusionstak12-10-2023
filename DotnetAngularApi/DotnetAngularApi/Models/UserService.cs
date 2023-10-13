using DotnetAngularApi.Context;
using DotnetAngularApi.Models;
using Microsoft.EntityFrameworkCore;

namespace DotnetAngularApi.Services
{
    public class UserService
    {
        private readonly AppDbContext _authContext;

        public UserService(AppDbContext appDbContext)
        {
            _authContext = appDbContext;
        }

        public async Task<User> AuthenticateAsync(string username, string password)
        {
            return await _authContext.Users.FirstOrDefaultAsync(x => x.Username == username && x.Password == password);
        }

        public async Task<bool> RegisterAsync(User userObj)
        {
            _authContext.Users.Add(userObj);
            await _authContext.SaveChangesAsync();
            return true;
        }

        public async Task<User> GetUserByUsernameAsync(string username)
        {
            return await _authContext.Users.FirstOrDefaultAsync(u => u.Username == username);
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordRequest resetRequest)
        {
            var user = await _authContext.Users.FirstOrDefaultAsync(x =>
             x.FirstName == resetRequest.FirstName &&
             x.LastName == resetRequest.LastName &&
             x.Username == resetRequest.Username);

            if (user == null)
                return false;

            user.Password = resetRequest.NewPassword;

            await _authContext.SaveChangesAsync();
            return true;
        }
        public async Task<bool> UpdateUserActivityStatusAsync(string username, bool isActive)
        {
            var user = await _authContext.Users.FirstOrDefaultAsync(u => u.Username == username);

            if (user == null)
                return false;

            user.IsActive = isActive;
            await _authContext.SaveChangesAsync();

            return true;
        }

    }
}
