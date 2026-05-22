namespace PetHealthApp.Models
{
    public class VisitAttachment
    {

        //model załączników do wizyty przechowywany w Azure Blob Storage
        public int Id { get; set; }
        public int VisitId { get; set; } //klucz obcy (do której wizyty należy załącznik)
        public Visit? Visit { get; set; }

        public string FileName { get; set; } = string.Empty; //oryginalna nazwa pliku
        public string BlobUrl { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty; //typ pliku np. image/jpeg
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow; //data i czas przeslania pliku (ustawiana automatycznie)

    }
}
