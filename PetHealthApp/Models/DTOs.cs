namespace PetHealthApp.Models
{
    //DTO, obiekty slużące do transferu danych miedzy frontendem a backendem

    //DLA AUTORYZACJI
     
    //dane potrzebne do rejestracji nowego uzytkownika
    public class RegisterDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
    }

    //dane potrzebne do logowania
    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }


    //odpowiedz zwracana po udanym logowaniu lub rejestracji
    public class AuthResponseDto
    {
        public int UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty; //token uzywany przez frontend do identyfikacji uzytkownika
    }



    // DLA ZWIERZĄT

    //dane potrzebne do utworzenia nowego zwierzaka
    public class PetCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public string Species { get; set; } = string.Empty;
        public string Breed { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public decimal? WeightKg { get; set; }
        public string? Gender { get; set; }
        public string? FurColor { get; set; }
        public int UserId { get; set; }
    }


    //dane potrzebne do aktualizacji nowego zwierzaka
    public class PetUpdateDto
    {
        public string Name { get; set; } = string.Empty;
        public string Species { get; set; } = string.Empty;
        public string Breed { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public decimal? WeightKg { get; set; }
        public string? Gender { get; set; }
        public string? FurColor { get; set; }
    }


    //odpowiedz zwracana przez API przy pobieraniu zwierzaka
    public class PetResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Species { get; set; } = string.Empty;
        public string Breed { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public string AgeDisplay { get; set; } = string.Empty; //wiek jako tekst, np. 3 lata
        public int AgeYears { get; set; } //wiek jako liczba calkowita
        public decimal? WeightKg { get; set; }
        public string? PhotoUrl { get; set; }
        public string? Gender { get; set; }
        public string? FurColor { get; set; }
        public int VisitCount { get; set; } //liczba wszystkich wizyt tego zwierzaka
        public VisitResponseDto? LastVisit { get; set; } //ostatnia wizyta (wyswietlana na dashboardzie)
    }


    //DLA WIZYT

    //dane potrzebne do dodania nowej wizyty
    public class VisitCreateDto
    {
        public int PetId { get; set; }
        public DateTime VisitDate { get; set; }
        public string Title { get; set; } = string.Empty;
        public string VisitType { get; set; } = string.Empty;
        public string VetNotes { get; set; } = string.Empty;
        public string VetName { get; set; } = string.Empty;
        public decimal Cost { get; set; }
        public decimal? WeightAtVisit { get; set; }
    }


    //dane potrzebne do aktualizacji istniejacej wizyty
    public class VisitUpdateDto
    {
        public DateTime VisitDate { get; set; }
        public string Title { get; set; } = string.Empty;
        public string VisitType { get; set; } = string.Empty;
        public string VetNotes { get; set; } = string.Empty;
        public string VetName { get; set; } = string.Empty;
        public decimal Cost { get; set; }
        public decimal? WeightAtVisit { get; set; }
    }


    //parametry filtrowania listy wizyt
    public class VisitFilterDto
    {
        public string? VisitType { get; set; }
        public decimal? CostMin { get; set; }
        public decimal? CostMax { get; set; }
        public bool? HasAttachments { get; set; }
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
    }


    //odpowiedz zwracana przez API przy pobieraniu wizyty, zawiera liste zalacznikow
    public class VisitResponseDto
    {
        public int Id { get; set; }
        public int PetId { get; set; }
        public DateTime VisitDate { get; set; }
        public string Title { get; set; } = string.Empty;
        public string VisitType { get; set; } = string.Empty;
        public string VetNotes { get; set; } = string.Empty;
        public string VetName { get; set; } = string.Empty;
        public decimal Cost { get; set; }
        public decimal? WeightAtVisit { get; set; }
        public List<AttachmentResponseDto> Attachments { get; set; } = new();
    }

    //odpowiedz dla pojedynczego załącznika
    public class AttachmentResponseDto
    {
        public int Id { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string BlobUrl { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public DateTime UploadedAt { get; set; }
    }


    // DLA DASHBOARDU

    //odpowiedz dla ekranu glownego zwierzaka (dashboard)
    public class DashboardResponseDto
    {
        public PetResponseDto Pet { get; set; } = null!; //podstawowe dane zwierzaka
        public List<UpcomingVaccinationDto> UpcomingVaccinations { get; set; } = new(); //lista nadchodzących szczepien 
        public VisitResponseDto? LastVisit { get; set; } //ostatnia odbyta wizyta
        public decimal? CurrentWeight { get; set; } //aktualna waga zwierzaka
    }


    //informacje o nadchodzącym szczepieniu - wyswietlana jako alert na dashboardzie 
    public class UpcomingVaccinationDto
    {
        public string VaccineName { get; set; } = string.Empty;
        public DateTime DueDate { get; set; } //data kolejnego szczepienia 
        public int DaysRemaining { get; set; } //ile dni pozostalo do szczepienia
    }


    // DLA WAGI

    //dane potrzebne do recznego dodania pomiaru wagi
    public class WeightEntryCreateDto
    {
        public int PetId { get; set; }
        public decimal WeightKg { get; set; }
        public DateTime MeasuredAt { get; set; } = DateTime.UtcNow;
        public string? Note { get; set; }
    }


    //DLA UŻYTKOWNIKA

    //dane potrzebne do aktualizacji profilu uzytkownika
    public class UserUpdateDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public bool NotificationsEnabled { get; set; }
    }


    //dane potrzebne do zmiany hasla 
    public class ChangePasswordDto
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }


    //dane potrzebne do aktualizacji ustawien powiadomien 
    public class NotificationSettingsDto
    {
        public bool PushEnabled { get; set; }
        public bool EmailEnabled { get; set; }
    }
}