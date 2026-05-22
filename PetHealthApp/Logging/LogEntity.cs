using Azure;
using Azure.Data.Tables;

namespace PetHealthApp.Logging
{
    //encja logu systemowego przechowywana w Azure Table Storage
    public class LogEntity : ITableEntity
    {
        public string PartitionKey { get; set; } = "SystemLog"; //grupuje logi w jednej partycji "SystemLog"
        public string RowKey { get; set; } = Guid.NewGuid().ToString(); //unikalny numer identyfikujący
        public string Operation { get; set; } = string.Empty; //rodzaj operacji, np. dodanie zwierzaka
        public string Message { get; set; } = string.Empty; //szczegóły akcji
        public int? UserId { get; set; } // ID uzytkownika, ktory dokonal akcji
        public DateTimeOffset? Timestamp { get; set; } //automatyczne przypisywanie daty i godziny logu
        public ETag ETag { get; set; } //dla Azure, do kontroli współbieżności
    }
}