using Microsoft.AspNetCore.Mvc;
using PetHealthApp.Data;
using PetHealthApp.Logging;
using PetHealthApp.Models;
using PetHealthApp.Services;

namespace PetHealthApp.Controllers
{
    //kontroler obslugujący rejestrację i logowanie użytkowników
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly AuthService _auth;
        private readonly AzureTableLogger _logger;

        public AuthController(AppDbContext db, AuthService auth,
            AzureTableLogger logger)
        {
            _db = db; _auth = auth; _logger = logger;
        }


        //REJESTRUJE NOWE KONTO UZYTKOWNIKA
        [HttpPost("register")] 
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (await _auth.GetByEmailAsync(dto.Email) != null)
                return Conflict(new { message = "Email już istnieje" });

            var user = new User
            {
                Email = dto.Email,
                PasswordHash = _auth.HashPassword(dto.Password),
                FirstName = dto.FirstName,
                LastName = dto.LastName
            };
            _db.Users.Add(user);
            await _db.SaveChangesAsync();
            await _logger.LogAsync("Register",
                $"Nowy użytkownik: {dto.Email}", user.Id);

            return CreatedAtAction(nameof(Register), new AuthResponseDto
            {
                UserId = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                Token = _auth.GenerateToken(user)
            });
        }

        //LOGUJE UZYTKOWNIKA I ZWRACA TOKEN DOSTEPU
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _auth.GetByEmailAsync(dto.Email);
            if (user == null ||
                !_auth.VerifyPassword(dto.Password, user.PasswordHash))
                return Unauthorized(
                    new { message = "Nieprawidłowe dane logowania" });

            await _logger.LogAsync("Login",
                $"Zalogowano: {dto.Email}", user.Id);
            return Ok(new AuthResponseDto
            {
                UserId = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                Token = _auth.GenerateToken(user)
            });
        }
    }
}