namespace PetHealthApp.Models
{
    public class User
    {

        //model konta uzytkownika odpowiadajacy tabeli Users w Azure SQL Database
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty; //haslo szyfrowane 
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? Phone { get; set; } //numer telefonu opcjonalnie
        public bool NotificationsEnabled { get; set; } = true;
        public bool EmailRemindersEnabled { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; //data i czas zalozenia konta (ustawiana automatycznie)
        public ICollection<Pet> Pets { get; set; } = new List<Pet>(); //lista zwierząt należących do tego uzytkownika
    }
}