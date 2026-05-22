using Microsoft.AspNetCore.Mvc;
using PetHealthApp.Facade;
using PetHealthApp.Models;

namespace PetHealthApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VisitsController : ControllerBase
    {
        private readonly VisitFacade _facade;
        public VisitsController(VisitFacade facade) => _facade = facade;

        //ZWRACA LISTE WIZYT ZWIERZAKA, POSORTOWANA OD NAJNOWSZEJ
        [HttpGet("pet/{petId}")]
        public async Task<IActionResult> GetPetVisits(
            int petId, [FromQuery] VisitFilterDto? filter)
        {
            var visits = await _facade.GetPetVisitsAsync(petId, filter);
            return Ok(visits);
        }

        //ZWRACA SZCZEGOLY WIZYTY WRAZ Z LISTA ZALACZNIKOW
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var visit = await _facade.GetVisitByIdAsync(id);
            return visit == null ? NotFound() : Ok(visit);
        }

        //TWORZY NOWA WIZYTE Z OPCJONALNYMI ZALACZNIKAMI
        [HttpPost]
        public async Task<IActionResult> Create(
            [FromForm] VisitCreateDto dto,
            List<IFormFile>? attachments)
        {
            var result = await _facade.AddVisitAsync(dto, attachments);
            return CreatedAtAction(nameof(GetById),
                new { id = result.Id }, result);
        }

        //AKTUALIZUJE WIZYTE 
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id, [FromBody] VisitUpdateDto dto)
        {
            var result = await _facade.UpdateVisitAsync(id, dto);
            return result == null ? NotFound() : Ok(result);
        }


        //USUWA WIZYTE WRAZ ZE WSZYSTKIMI ZALACZNIKAMI
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _facade.DeleteVisitAsync(id);
            return ok ? NoContent() : NotFound();
        }
    }
}