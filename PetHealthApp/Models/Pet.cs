using PetHealthApp.Models;

namespace PetHealthApp.Models
{
    public class Pet
    {

        //model zwierzaka odpowiadający tabeli Pets w Azure SQL Database
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Species { get; set; } = string.Empty; //np. pies, kot
        public string Breed { get; set; } = string.Empty; //np. owczarek niemiecki
        public DateTime DateOfBirth { get; set; } 
        public decimal? WeightKg { get; set; } //aktuana waga w kilogramach
        public string? PhotoUrl { get; set; }
        public string? Gender { get; set; }
        public string? FurColor { get; set; }
        public int UserId { get; set; } //klucz obcy (do jakiego uzytkownika nalezy)
        public User? User { get; set; }
        public ICollection<Visit> Visits { get; set; } = new List<Visit>(); //lista wizyt weterynaryjnych powiązanych z tym zwierzakiem
        public ICollection<WeightEntry> WeightHistory { get; set; } = new List<WeightEntry>(); //historia pomiaró wagi zwierzaka
    }
}