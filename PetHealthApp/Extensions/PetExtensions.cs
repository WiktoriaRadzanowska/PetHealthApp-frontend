using PetHealthApp.Models;

namespace PetHealthApp.Extensions
{

    //wzorzec - metody rozszerzające, dodaje metody pomocnicze do modeli Pet i Visit oraz metody filtrowania
    public static class PetExtensions
    {

        //oblicza aktualny wiek zwierzaka w pelnych latach
        public static int GetAge(this Pet pet)
        {
            var today = DateTime.Today;
            var age = today.Year - pet.DateOfBirth.Year;
            if (pet.DateOfBirth.Date > today.AddYears(-age)) age--; //korekta jesli urodziny jeszcze nie minely w tym roku
            return age;
        }


        //zwraca wiek jako tekst po polsku z poprawna odmiana
        public static string GetAgeDisplay(this Pet pet)
        {
            var years = pet.GetAge();
            return years switch
            {
                0 => "< 1 rok",
                1 => "1 rok",
                <= 4 => $"{years} lata",
                _ => $"{years} lat"
            };
        }


        //mapuje model bazodanowy Pet na PetResponseDto, zapobiega zwracaniu zagniezdzonych obiektow przez API
        public static PetResponseDto ToResponseDto(this Pet pet)
        {
            return new PetResponseDto
            {
                Id = pet.Id,
                Name = pet.Name,
                Species = pet.Species,
                Breed = pet.Breed,
                DateOfBirth = pet.DateOfBirth,
                AgeDisplay = pet.GetAgeDisplay(),
                AgeYears = pet.GetAge(),
                WeightKg = pet.WeightKg,
                PhotoUrl = pet.PhotoUrl,
                Gender = pet.Gender,
                FurColor = pet.FurColor,
                VisitCount = pet.Visits?.Count ?? 0,
                //pobiera ostatnia wizyte posortowana po dacie
                LastVisit = pet.Visits?
                    .OrderByDescending(v => v.VisitDate)
                    .FirstOrDefault()
                    ?.ToResponseDto()
            };
        }


        //mapuje model bazodanowy Visit na VisitResponseDto
        public static VisitResponseDto ToResponseDto(this Visit visit)
        {
            return new VisitResponseDto
            {
                Id = visit.Id,
                PetId = visit.PetId,
                VisitDate = visit.VisitDate,
                Title = visit.Title,
                VisitType = visit.VisitType,
                VetNotes = visit.VetNotes,
                VetName = visit.VetName,
                Cost = visit.Cost,
                WeightAtVisit = visit.WeightAtVisit,
                //mapuje zalaczniki lub zwroci pusta liste jesli brak
                Attachments = visit.Attachments?
                    .Select(a => new AttachmentResponseDto
                    {
                        Id = a.Id,
                        FileName = a.FileName,
                        BlobUrl = a.BlobUrl,
                        ContentType = a.ContentType,
                        UploadedAt = a.UploadedAt
                    }).ToList() ?? new()
            };
        }


        //filtruje zapytanie po typie wizyty - uzywane w VisitFacade
        public static IQueryable<Visit> FilterByType(
            this IQueryable<Visit> query, string? visitType)
        {
            if (string.IsNullOrEmpty(visitType)) return query;
            return query.Where(v => v.VisitType == visitType);
        }


        //filtruje zapytanie po przedziale kosztow
        public static IQueryable<Visit> FilterByCostRange(
            this IQueryable<Visit> query, decimal? min, decimal? max)
        {
            if (min.HasValue) query = query.Where(v => v.Cost >= min.Value);
            if (max.HasValue) query = query.Where(v => v.Cost <= max.Value);
            return query;
        }


        //filtruje zapytanie po zakresie dat
        public static IQueryable<Visit> FilterByDateRange(
            this IQueryable<Visit> query, DateTime? from, DateTime? to)
        {
            if (from.HasValue) query = query.Where(v => v.VisitDate >= from.Value);
            if (to.HasValue) query = query.Where(v => v.VisitDate <= to.Value);
            return query;
        }
    }
}