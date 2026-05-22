using Microsoft.EntityFrameworkCore;
using PetHealthApp.Data;
using PetHealthApp.Extensions;
using PetHealthApp.Logging;
using PetHealthApp.Models;
using PetHealthApp.Services;

namespace PetHealthApp.Facade
{ 
    //wzorzec facade
    public class VisitFacade
    {
        private readonly AppDbContext _db;
        private readonly BlobStorageService _blob;
        private readonly AzureTableLogger _logger;
        private readonly RedisCacheService _cache;

        public VisitFacade(AppDbContext db, BlobStorageService blob,
            AzureTableLogger logger, RedisCacheService cache)
        {
            _db = db; _blob = blob; _logger = logger; _cache = cache;
        }


        //dodanie nowej wizyty
        public async Task<VisitResponseDto> AddVisitAsync(
            VisitCreateDto dto, List<IFormFile>? attachments)
        {
            var visit = new Visit
            {
                PetId = dto.PetId,
                VisitDate = dto.VisitDate,
                Title = dto.Title,
                VisitType = dto.VisitType,
                VetNotes = dto.VetNotes,
                VetName = dto.VetName,
                Cost = dto.Cost,
                WeightAtVisit = dto.WeightAtVisit
            };
            _db.Visits.Add(visit);
            await _db.SaveChangesAsync();


            // rownolegle dodawanie zalacznikow
            if (attachments != null && attachments.Any())
            {
                var uploadTasks = attachments.Select(async file =>
                {
                    var url = await _blob.UploadVisitAttachmentAsync(
                        file, visit.Id);
                    return new VisitAttachment
                    {
                        VisitId = visit.Id,
                        FileName = file.FileName,
                        BlobUrl = url,
                        ContentType = file.ContentType
                    };
                });
                var uploaded = await Task.WhenAll(uploadTasks); // czeka az wszystkie pliki wyląduja w chmurze
                //hurtowo dopisuje ich adresy URL do bazy sql
                _db.VisitAttachments.AddRange(uploaded);
                await _db.SaveChangesAsync();
            }


            //aktualizacja wagi zwierzaka
            if (dto.WeightAtVisit.HasValue)
            {
                var pet = await _db.Pets.FindAsync(dto.PetId);
                if (pet != null)
                {
                    pet.WeightKg = dto.WeightAtVisit.Value;
                    _db.WeightEntries.Add(new WeightEntry
                    {
                        PetId = dto.PetId,
                        WeightKg = dto.WeightAtVisit.Value,
                        MeasuredAt = dto.VisitDate
                    });
                    await _db.SaveChangesAsync();
                }
            }


            //czyszczenie danych w pamieci podrecznej
            await Task.WhenAll(
                _logger.LogAsync("AddVisit",
                    $"Wizyta: {dto.Title} | Pet:{dto.PetId}"),
                _cache.RemoveAsync(
                    $"visits:pet:{dto.PetId}",
                    $"dashboard:{dto.PetId}",
                    $"pet:{dto.PetId}",
                    $"pets:user:")
            );

            //zwraca na telefon nowo utworzona wizyte ze wszystkimi zalacznikami
            var saved = await _db.Visits
                .Include(v => v.Attachments)
                .FirstAsync(v => v.Id == visit.Id);
            return saved.ToResponseDto();
        }


        //pobieranie wizyt + filtrowanie
        public async Task<List<VisitResponseDto>> GetPetVisitsAsync(
            int petId, VisitFilterDto? filter = null)
        {
            var query = _db.Visits
                .Include(v => v.Attachments)
                .Where(v => v.PetId == petId)
                .AsQueryable();


            //uzywa wtyczke z PetExtensions
            if (filter != null)
            {
                query = query
                    .FilterByType(filter.VisitType)
                    .FilterByCostRange(filter.CostMin, filter.CostMax)
                    .FilterByDateRange(filter.DateFrom, filter.DateTo);

                if (filter.HasAttachments == true)
                    query = query.Where(v => v.Attachments.Any());
            }

            var visits = await query
                .OrderByDescending(v => v.VisitDate)
                .ToListAsync();
            return visits.Select(v => v.ToResponseDto()).ToList();
        }

        //pobieranie jednej wizyty
        public async Task<VisitResponseDto?> GetVisitByIdAsync(int id)
        {
            var visit = await _db.Visits
                .Include(v => v.Attachments)
                .FirstOrDefaultAsync(v => v.Id == id);
            return visit?.ToResponseDto();
        }


        //aktualizacja wizyty
        public async Task<VisitResponseDto?> UpdateVisitAsync(
            int id, VisitUpdateDto dto)
        {
            var visit = await _db.Visits.FindAsync(id);
            if (visit == null) return null;

            visit.VisitDate = dto.VisitDate;
            visit.Title = dto.Title;
            visit.VisitType = dto.VisitType;
            visit.VetNotes = dto.VetNotes;
            visit.VetName = dto.VetName;
            visit.Cost = dto.Cost;
            visit.WeightAtVisit = dto.WeightAtVisit;


            //aktualizuje aktualna wage zwierzaka na podstawie edycji
            if (dto.WeightAtVisit.HasValue)
            {
                var pet = await _db.Pets.FindAsync(visit.PetId);
                if (pet != null) pet.WeightKg = dto.WeightAtVisit.Value;
            }

            await _db.SaveChangesAsync();


            //czyszczenie starego cache dla wszystkich widokow zwiazanych z tym zwierzakiem
            await Task.WhenAll(
                _logger.LogAsync("UpdateVisit",
                    $"Zaktualizowano wizytę ID:{id}"),
                _cache.RemoveAsync(
                    $"visits:pet:{visit.PetId}",
                    $"dashboard:{visit.PetId}",
                    $"pet:{visit.PetId}")
            );

            return visit.ToResponseDto();
        }


        //usuwanie wizyty
        public async Task<bool> DeleteVisitAsync(int id)
        {
            var visit = await _db.Visits
                .Include(v => v.Attachments)
                .FirstOrDefaultAsync(v => v.Id == id);
            if (visit == null) return false;


            //zanim usunie wizyte z bazy musi usunac jej pliki  chmury
            var deleteTasks = visit.Attachments
                .Select(a => _blob.DeleteAsync(a.BlobUrl))
                .ToList();

            _db.Visits.Remove(visit);


            //rownoczesnie: usuwa wizyte z sql, usuwa wszystkie przypisane do niej pliki z blob, zapisuje logi 
            await Task.WhenAll(
                _db.SaveChangesAsync(),
                Task.WhenAll(deleteTasks),
                _logger.LogAsync("DeleteVisit",
                    $"Usunięto wizytę ID:{id}")
            );

            //na koniec usuwa stare wizyty z cache
            await _cache.RemoveAsync(
                $"visits:pet:{visit.PetId}",
                $"dashboard:{visit.PetId}",
                $"pet:{visit.PetId}");
            return true;
        }
    }
}