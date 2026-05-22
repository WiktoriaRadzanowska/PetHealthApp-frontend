using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetHealthApp.Data;
using PetHealthApp.Models;
using PetHealthApp.Services;

namespace PetHealthApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WeightController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly RedisCacheService _cache;

        public WeightController(AppDbContext db, RedisCacheService cache)
        {
            _db = db; _cache = cache;
        }

        //ZWRACA HISTORIE WAGI Z FILTREM ZAKRESU DAT
        [HttpGet("pet/{petId}")]
        public async Task<IActionResult> GetWeightHistory(
            int petId, [FromQuery] string? range)
        {
            var cutoff = range switch
            {
                "1M" => DateTime.UtcNow.AddMonths(-1),
                "6M" => DateTime.UtcNow.AddMonths(-6),
                "1R" => DateTime.UtcNow.AddYears(-1),
                _ => DateTime.UtcNow.AddMonths(-6)
            };

            //oblicza date graniczna na podstawie wybranego zakresu
            var entries = await _db.WeightEntries
                .Where(w => w.PetId == petId && w.MeasuredAt >= cutoff)
                .OrderBy(w => w.MeasuredAt)
                .ToListAsync();

            return Ok(entries);
        }

        //ZWRACA CALA HISTORIE WAGI BEZ FILTRA DAT
        [HttpGet("pet/{petId}/all")]
        public async Task<IActionResult> GetAllWeightHistory(int petId)
        {
            var entries = await _db.WeightEntries
                .Where(w => w.PetId == petId)
                .OrderBy(w => w.MeasuredAt)
                .ToListAsync();

            return Ok(entries);
        }


        //DODAJE RĘCZNY POMIAR WAGI (poza wizytą)
        [HttpPost]
        public async Task<IActionResult> AddWeight(
            [FromBody] WeightEntryCreateDto dto)
        {
            var entry = new WeightEntry
            {
                PetId = dto.PetId,
                WeightKg = dto.WeightKg,
                MeasuredAt = dto.MeasuredAt.ToUniversalTime(), //zapobiega problemom ze strefami czasowymi
                Note = dto.Note
            };
            _db.WeightEntries.Add(entry);

            //zaaktualizuj aktualna wage zwierzaka
            var pet = await _db.Pets.FindAsync(dto.PetId);
            if (pet != null) pet.WeightKg = dto.WeightKg;

            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetWeightHistory),
                new { petId = dto.PetId }, entry);
        }
    }
}