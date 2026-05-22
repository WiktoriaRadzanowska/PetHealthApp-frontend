using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace PetHealthApp.Models
{
    public class Visit
    {
        //model wizyt odpowiadajacy tabeli Visits w Azure SQL Database
        public int Id { get; set; }
        public int PetId { get; set; } //klucz obcy (do ktorego zwierzaka nalezy wizyta)
        public Pet? Pet { get; set; }
        public DateTime VisitDate { get; set; }
        public string Title { get; set; } = string.Empty; //np. Szczepienie roczne
        public string VisitType { get; set; } = string.Empty; // np. kontrola/badanie/szczepienie
        public string VetNotes { get; set; } = string.Empty;
        public string VetName { get; set; } = string.Empty;
        [Precision(18, 2)]
        public decimal Cost { get; set; }
        [Precision(18, 2)]
        public decimal? WeightAtVisit { get; set; }
        public ICollection<VisitAttachment> Attachments { get; set; } = new List<VisitAttachment>(); //lista zalacznikow do wizyty (dokuemnty, wyniki badań w blob storage)
    }
}