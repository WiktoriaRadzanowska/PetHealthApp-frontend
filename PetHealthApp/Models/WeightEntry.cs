namespace PetHealthApp.Models
{
    public class WeightEntry
    {

        //model pojedynczej wagi zwierzaka odpowiadajacy tabeli WeightEntries w Azure SQL Database
        public int Id { get; set; }
        public int PetId { get; set; } //klucz obcy (do ktorego zwierzaka należy pomiar)
        public Pet? Pet { get; set; }
        public decimal WeightKg { get; set; } //zmierzona waga w kg
        public DateTime MeasuredAt { get; set; } = DateTime.UtcNow;
        public string? Note { get; set; } //opcjonalna notatka, np. Pomiar domowy
    }
}