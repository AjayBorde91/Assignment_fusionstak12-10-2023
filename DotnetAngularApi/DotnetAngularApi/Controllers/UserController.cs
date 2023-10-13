using DotnetAngularApi.Context;
using DotnetAngularApi.Models;
using DotnetAngularApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Swashbuckle.AspNetCore.Annotations;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace DotnetAngularApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly JwtTokenService _jwtTokenService;
        private readonly AppDbContext _authContext;

        public UserController(UserService userService, JwtTokenService jwtTokenService, AppDbContext authContext)
        {
            _userService = userService;
            _jwtTokenService = jwtTokenService;
            _authContext = authContext; 
        }

        [HttpPost("authenticate")]
        public async Task<IActionResult> Authenticate([FromBody] User userObj)
        {
            if (userObj == null)
                return BadRequest();

            var user = await _userService.AuthenticateAsync(userObj.Username, userObj.Password);

            if (user == null)
                return NotFound(new { Message = "User Not Found!" });

            if (!user.IsActive)
                return BadRequest(new { Message = "User is inactive. Please contact an administrator." });

            var identity = new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.Role, user.Industry),
                new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
                new Claim(ClaimTypes.Email, user.Username)
            });

            var token = _jwtTokenService.GenerateJwtToken(identity);

            return Ok(new
            {
                Token = token,
                Message = "Login Success!"
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterUser([FromBody] User userObj)
        {
            if (userObj == null)
                return BadRequest();
            userObj.IsActive = true;

            var success = await _userService.RegisterAsync(userObj);

            if (success)
            {
                return Ok(new
                {
                    Message = "User Registered!"
                });
            }
            else
            {
                return BadRequest(new { Message = "User registration failed." });
            }
        }

        // all users
        [Authorize]
        [HttpGet("get-all-users")]
        [SwaggerOperation(Summary = "Get all users")]
        [SwaggerResponse(StatusCodes.Status200OK, "Returns the list of users")]
        public async Task<ActionResult<IEnumerable<User>>> GetAllUsers()
        {
            var users = await _authContext.Users.ToListAsync();
            return Ok(users);
        }

        // Check username exists
        [Authorize]
        [HttpGet("username-exists")]
        [SwaggerOperation(Summary = "Check if a username exists")]
        [SwaggerResponse(StatusCodes.Status200OK, "Returns true if the username exists")]
        public async Task<IActionResult> CheckUsernameExists(string username)
        {
            if (string.IsNullOrWhiteSpace(username))
                return BadRequest();

            var userExists = await _authContext.Users.AnyAsync(u => u.Username == username);

            return Ok(new { exists = userExists });
        }

        // Reset a user's password
        [Authorize]
        [HttpPost("reset-password")]
        [SwaggerOperation(Summary = "Reset a user's password")]
        [SwaggerResponse(StatusCodes.Status200OK, "Password reset successful")]
        [SwaggerResponse(StatusCodes.Status404NotFound, "User not found")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest resetRequest)
        {
            if (resetRequest == null)
                return BadRequest();

            var user = await _authContext.Users.FirstOrDefaultAsync(x =>
                x.FirstName == resetRequest.FirstName &&
                x.LastName == resetRequest.LastName &&
                x.Username == resetRequest.Username);

            if (user == null)
                return NotFound(new { Message = "User Not Found!" });

            // Update the user's password with the new password
            user.Password = resetRequest.NewPassword;

            // Save changes to the database
            await _authContext.SaveChangesAsync();

            // Return a success message
            return Ok(new
            {
                Message = "Password Reset Successfully!"
            });
        }

        // Delete user
        [Authorize]
        [HttpDelete("delete-user")]
        [SwaggerOperation(Summary = "Delete a user")]
        [SwaggerResponse(StatusCodes.Status200OK, "User deleted successfully")]
        [SwaggerResponse(StatusCodes.Status404NotFound, "User not found")]
        public async Task<IActionResult> DeleteUser(string username)
        {
            if (string.IsNullOrWhiteSpace(username))
                return BadRequest();

            var user = await _authContext.Users.FirstOrDefaultAsync(x => x.Username == username);

            if (user == null)
                return NotFound(new { Message = "User Not Found!" });

            _authContext.Users.Remove(user);
            await _authContext.SaveChangesAsync();

            return Ok(new
            {
                Message = "User Deleted Successfully!"
            });
        }

        [Authorize]
        [HttpPost("toggle-activity")]
        [SwaggerOperation(Summary = "Toggle user activity status")]
        [SwaggerResponse(StatusCodes.Status200OK, "User activity status updated")]
        [SwaggerResponse(StatusCodes.Status404NotFound, "User not found")]
        public async Task<IActionResult> ToggleUserActivity(string username, bool isActive)
        {
            if (string.IsNullOrWhiteSpace(username))
                return BadRequest();

            var success = await _userService.UpdateUserActivityStatusAsync(username, isActive);

            if (!success)
                return NotFound(new { Message = "User Not Found!" });

            return Ok(new
            {
                Message = isActive ? "User Activated!" : "User Deactivated!"
            });
        }


    }
}
