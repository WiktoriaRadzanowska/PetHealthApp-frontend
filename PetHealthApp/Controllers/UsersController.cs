using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetHealthApp.Data;
using PetHealthApp.Logging;
using PetHealthApp.Models;
using PetHealthApp.Services;

namespace PetHealthApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly AuthService _auth;
        private readonly AzureTableLogger _logger;
        private readonly BlobStorageService _blob;

        public UsersController(AppDbContext db, AuthService auth,
            AzureTableLogger logger, BlobStorageService blob)
        {
            _db = db; _auth = auth; _logger = logger; _blob = blob;
        }

        //ZWRACA PROFIL UZYTKOWNIKA - dane wyswietlane na ekranie ustawien
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProfile(int id)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null) return NotFound();
            return Ok(new
            {
                user.Id,
                user.Email,
                user.FirstName,
                user.LastName,
                user.Phone,
                user.NotificationsEnabled,
                user.EmailRemindersEnabled,
                user.CreatedAt
            });
        }

        //AKTUALIZUJE DANE PROFILU
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProfile(
            int id, [FromBody] UserUpdateDto dto)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;
            user.Phone = dto.Phone;
            user.NotificationsEnabled = dto.NotificationsEnabled;
            await _db.SaveChangesAsync();
            await _logger.LogAsync("UpdateProfile",
                $"Zaktualizowano profil ID:{id}", id);

            return Ok(new
            {
                user.Id,
                user.Email,
                user.FirstName,
                user.LastName,
                user.Phone,
                user.NotificationsEnabled,
                user.EmailRemindersEnabled
            });
        }

        //ZMIANA HASLA - wymagane podanie aktualnego do weryfikacji
        [HttpPut("{id}/password")]
        public async Task<IActionResult> ChangePassword(
            int id, [FromBody] ChangePasswordDto dto)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null) return NotFound();

            if (!_auth.VerifyPassword(dto.CurrentPassword, user.PasswordHash))
                return BadRequest(
                    new { message = "Nieprawidłowe aktualne hasło" });

            user.PasswordHash = _auth.HashPassword(dto.NewPassword);
            await _db.SaveChangesAsync();
            await _logger.LogAsync("ChangePassword",
                $"Zmieniono hasło ID:{id}", id);

            return Ok(new { message = "Hasło zmienione pomyślnie" });
        }

        //AKTUALIZUJE USTAWIENIA POWIADOMIEN PUSH I EMAIL OSOBNO
        [HttpPut("{id}/notifications")]
        public async Task<IActionResult> UpdateNotifications(
            int id, [FromBody] NotificationSettingsDto dto)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.NotificationsEnabled = dto.PushEnabled;
            user.EmailRemindersEnabled = dto.EmailEnabled;
            await _db.SaveChangesAsync();

            return Ok(new
            {
                user.NotificationsEnabled,
                user.EmailRemindersEnabled
            });
        }

        //USUWA KONTA UZYTKOWNIKA I WSZYSTKIE POWIAZANE DANE (usuwa tez zdjecia zwierzat z blob storage)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAccount(int id)
        {
            var user = await _db.Users
                .Include(u => u.Pets)
                .FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return NotFound();

            //usuwa wszystkie zdjecia z Blob Storage rownolegle
            var photoTasks = user.Pets
                .Where(p => p.PhotoUrl != null)
                .Select(p => _blob.DeleteAsync(p.PhotoUrl!));

            await Task.WhenAll(photoTasks);

            //usuniecie uzytkownika - efekt kaskadowy
            _db.Users.Remove(user);
            await _db.SaveChangesAsync();
            await _logger.LogAsync("DeleteAccount",
                $"Usunięto konto ID:{id}", id);

            return NoContent();
        }
    }
}