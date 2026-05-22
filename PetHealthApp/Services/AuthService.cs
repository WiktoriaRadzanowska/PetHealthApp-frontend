using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using PetHealthApp.Data;
using PetHealthApp.Models;

namespace PetHealthApp.Services
{

    //serwis odpowiedzialny za autentykacje uzytkownikow,
    //obsluguje hashowanie hasel i generowanie tokenow dostepu
    public class AuthService
    {
        private readonly AppDbContext _db;

        public AuthService(AppDbContext db) => _db = db;


        //hashuje haslo algorytmem SHA-256
        public string HashPassword(string password)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(
                Encoding.UTF8.GetBytes(password + "PetHealthSalt2026"));
            return Convert.ToBase64String(bytes);
        }

        //weryfikuje czy podane haslo odpowiada przechowywanemu hashowi
        public bool VerifyPassword(string password, string hash)
            => HashPassword(password) == hash;

        //wyszukuje uzytkownika po adresie email (uzywane przy rejestracji i logowaniu czy wystepuja duplikaty)
        public async Task<User?> GetByEmailAsync(string email)
            => await _db.Users.FirstOrDefaultAsync(u => u.Email == email);


        //generuje prosty token identyfikujacy uzytkownika
        public string GenerateToken(User user)
            => Convert.ToBase64String(
                Encoding.UTF8.GetBytes(
                    $"{user.Id}:{user.Email}:{DateTime.UtcNow.Ticks}")); //token zawiera ID, email i aktualny czas zakodowania
    }
}