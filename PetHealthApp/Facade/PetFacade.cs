using Microsoft.EntityFrameworkCore;
using PetHealthApp.Data;
using PetHealthApp.Extensions;
using PetHealthApp.Logging;
using PetHealthApp.Models;
using PetHealthApp.Services;

namespace PetHealthApp.Facade
{

    //wzorzec Facade - ukrywa zlozonosc operacji na wielu serwisach za prostym interfejsem
    //kontroler wywoluje tylko metody tej klasy nie wiedzac o redis, blob itp
    public class PetFacade
    {
        private readonly AppDbContext _db;
        private readonly BlobStorageService _blob;
        private readonly AzureTableLogger _logger;
        private readonly RedisCacheService _cache;


        //wzorzec Dependency Injection (wstrzykiwanie zaleznosci)
        public PetFacade(AppDbContext db, BlobStorageService blob,
            AzureTableLogger logger, RedisCacheService cache)
        {
            _db = db; _blob = blob; _logger = logger; _cache = cache;
        }


        //dodaje nowego zwierzaka - dla sql, blob, cache, log
        public async Task<PetResponseDto> AddPetAsync(
            PetCreateDto dto, IFormFile? photo)
        {
            //przepisuje dane z formularza DTO na obiekt bazy danych
            var pet = new Pet
            {
                Name = dto.Name,
                Species = dto.Species,
                Breed = dto.Breed,
                DateOfBirth = dto.DateOfBirth,
                WeightKg = dto.WeightKg,
                Gender = dto.Gender,
                FurColor = dto.FurColor,
                UserId = dto.UserId
            };
            _db.Pets.Add(pet);
            await _db.SaveChangesAsync(); //zapisanie do bazy danych


            //jesli przeslano zdjecie - wysyla do blob storage i zapisuje URL
            if (photo != null)
            {
                pet.PhotoUrl = await _blob.UploadPetPhotoAsync(photo, pet.Id);
                await _db.SaveChangesAsync(); //aktualizuje baze danych
            }


            //wzorzec wspolbieznosci - dwie czynnosci robione jednoczesnie
            await Task.WhenAll(
                _logger.LogAsync("AddPet",
                    $"Dodano: {pet.Name} ID:{pet.Id}", dto.UserId),
                _cache.RemoveAsync($"pets:user:{dto.UserId}")
            );

            return pet.ToResponseDto(); //uzywamy metody rozszerzajacej, aby uciac relacje bazy i zwrocic czysty formularz DTO
        }


        //pobiera liste zwierzat uzytkownika 
        public async Task<List<PetResponseDto>> GetUserPetsAsync(int userId)
        {
            var cacheKey = $"pets:user:{userId}"; //klucz pod ktorym szukamy danych

            //wzorzec cache-aside - sprawdza czy mamy juz to w cache
            var cached = await _cache.GetAsync<List<PetResponseDto>>(cacheKey);
            if (cached != null) return cached; //jesli tak, odrazu dodajemy i konczymy


            // jesli nie ma w cache, pobiera z SQL z dolaczonymi wizytami i zalacznikami
            var pets = await _db.Pets
                .Include(p => p.Visits)
                    .ThenInclude(v => v.Attachments)
                .Where(p => p.UserId == userId)
                .ToListAsync();

            var result = pets.Select(p => p.ToResponseDto()).ToList(); //przepisuje kazdy model na plaskie obiekty DTO
            
            //zapisz wynik w cache na 5 minut
            await _cache.SetAsync(cacheKey, result, TimeSpan.FromMinutes(5));
            return result;
        }


        //pobiera szczegoly jednego zwierzaka po ID - sprawdza cache
        public async Task<PetResponseDto?> GetPetByIdAsync(int id)
        {
            var cacheKey = $"pet:{id}";
            var cached = await _cache.GetAsync<PetResponseDto>(cacheKey);
            if (cached != null) return cached;

            var pet = await _db.Pets
                .Include(p => p.Visits)
                    .ThenInclude(v => v.Attachments)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (pet == null) return null;

            var result = pet.ToResponseDto();
            await _cache.SetAsync(cacheKey, result, TimeSpan.FromMinutes(10));
            return result;
        }


        //aktualizuje dane zwierzaka - obsluguje wymiane zdjecia w Blob Storage
        public async Task<PetResponseDto?> UpdatePetAsync(
            int id, PetUpdateDto dto, IFormFile? photo)
        {
            //znajduje zwierzaka 
            var pet = await _db.Pets.FindAsync(id);
            if (pet == null) return null;

            //aktualizuje dane tekstowe w pamieci programu
            pet.Name = dto.Name;
            pet.Species = dto.Species;
            pet.Breed = dto.Breed;
            pet.DateOfBirth = dto.DateOfBirth;
            pet.WeightKg = dto.WeightKg;
            pet.Gender = dto.Gender;
            pet.FurColor = dto.FurColor;


            //obsluga zmiany zdjecia w chmurze
            if (photo != null)
            {
                var oldUrl = pet.PhotoUrl;
                //upload nowego i usuniecie starego zdjecia rownolegle
                var uploadTask = _blob.UploadPetPhotoAsync(photo, pet.Id);
                var deleteTask = oldUrl != null
                    ? _blob.DeleteAsync(oldUrl)
                    : Task.CompletedTask;
                await Task.WhenAll(uploadTask, deleteTask);
                pet.PhotoUrl = await uploadTask; //po dodaniu nowego zdjecia przypisuje nowy link
            }

            await _db.SaveChangesAsync();


            //rownolegle zapisuje log i usuwa stare dane z cache
            await Task.WhenAll(
                _logger.LogAsync("UpdatePet", $"Zaktualizowano ID:{id}"),
                _cache.RemoveAsync($"pet:{id}", $"pets:user:{pet.UserId}")
            );

            return pet.ToResponseDto();
        }


        //usuwanie zwierzaka z systemu 
        public async Task<bool> DeletePetAsync(int id)
        {
            var pet = await _db.Pets.FindAsync(id);
            if (pet == null) return false;

            var userId = pet.UserId;
            var photoUrl = pet.PhotoUrl;
            _db.Pets.Remove(pet); //baza wtedy wie ze chcemy usunac tego zwierzaka


            //rownolegle usuwa go z bazy i zapisujemy log
            await Task.WhenAll(
                _db.SaveChangesAsync(),
                _logger.LogAsync("DeletePet", $"Usunięto ID:{id}")
            );


            //czyszczenie pamieci podrecznej ze starych danych
            var cleanup = new List<Task> 
            {
                _cache.RemoveAsync($"pet:{id}", $"pets:user:{userId}")
            };
            if (photoUrl != null) cleanup.Add(_blob.DeleteAsync(photoUrl)); //jesli zwierzak mial zdjecia w chmurze dodaje go do listy do usuniecia
            await Task.WhenAll(cleanup);//usuwa wszystko rownolegle

            return true;
        }


        //generowanie danych dla glownego ekranu aplikacji (dashboard)
        //nie korzysta z cache - nie ma sensu zapisywania dni do szczepienia w pamieci podrecznej
        public async Task<DashboardResponseDto?> GetDashboardAsync(int petId)
        {

            //pobiera zwierzaka i laduje historie jego wizyt
            var pet = await _db.Pets
                .Include(p => p.Visits.OrderByDescending(v => v.VisitDate))
                    .ThenInclude(v => v.Attachments)
                .FirstOrDefaultAsync(p => p.Id == petId);

            if (pet == null) return null;


            //algorytm dla nadchodzących szczepien
            var upcoming = pet.Visits
                .Where(v => v.VisitType == "Szczepienie") //wyciaga tylko szczepienia
                .Select(v => new
                {
                    Visit = v,
                    DueDate = v.VisitDate.Date.AddYears(1), //wylicza termin - 1 rok od daty ostatniego szczepienia
                    DaysRemaining = (int)(v.VisitDate.Date.AddYears(1)
                        - DateTime.Today).TotalDays
                })
                .Where(x => x.DaysRemaining >= -7 && x.DaysRemaining <= 60) //wyswietla jesli termin uplynal (do 7 dni wstecz) + przypomina 60 dni przed
                .OrderBy(x => x.DaysRemaining) //sortowanie po dniach
                .Select(x => new UpcomingVaccinationDto //pakuje wynik do konkretnego DTO
                {
                    VaccineName = x.Visit.Title,
                    DueDate = x.DueDate,
                    DaysRemaining = x.DaysRemaining
                })
                .ToList();

            var lastVisit = pet.Visits.FirstOrDefault(); //pobiera pierwsza pozycje ze złączonej tabeli

            return new DashboardResponseDto //zwraca obiekt łączący wszystkie te dane w jeden plik JSON
            {
                Pet = pet.ToResponseDto(),
                UpcomingVaccinations = upcoming,
                LastVisit = lastVisit?.ToResponseDto(),
                CurrentWeight = pet.WeightKg
            };
        }
    }
}