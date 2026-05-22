using Microsoft.AspNetCore.Mvc;
using PetHealthApp.Facade;
using PetHealthApp.Models;

namespace PetHealthApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PetsController : ControllerBase
    {
        private readonly PetFacade _facade;
        public PetsController(PetFacade facade) => _facade = facade;


        //ZWRACA LISTE WSZYSTKICH ZWIERZAT NALEZACYCH DO DANEGO UZYTKOWNIKA
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserPets(int userId)
        {
            var pets = await _facade.GetUserPetsAsync(userId);
            return Ok(pets);
        }


        //ZWRACA SZCZEGOLY JEDNEGO ZWIERZAKA
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var pet = await _facade.GetPetByIdAsync(id);
            return pet == null ? NotFound() : Ok(pet);
        }

        //ZWRACA DANE DASHBOARDU - zwierzak, nadchodzace szczepinia, ostatnia wizyta
        [HttpGet("{id}/dashboard")]
        public async Task<IActionResult> GetDashboard(int id)
        {
            var dashboard = await _facade.GetDashboardAsync(id);
            return dashboard == null ? NotFound() : Ok(dashboard);
        }


        //TWORZY NOWEGO ZWIERZAKA Z OPCJONALNYM ZDJECIEM
        [HttpPost]
        public async Task<IActionResult> Create(
            [FromForm] PetCreateDto dto, IFormFile? photo)
        {
            var result = await _facade.AddPetAsync(dto, photo);
            return CreatedAtAction(nameof(GetById),
                new { id = result.Id }, result);
        }

        //AKTUALIZUJE DANE ZWIERZAKA Z OPCJONALNA WYMIANA ZDJECIA
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id, [FromForm] PetUpdateDto dto, IFormFile? photo)
        {
            var result = await _facade.UpdatePetAsync(id, dto, photo);
            return result == null ? NotFound() : Ok(result);
        }


        //USUWA ZWERZAKA WRAZ ZE ZDJECIEM I WSZYSTKIMI WIZYTAMI
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _facade.DeletePetAsync(id);
            return ok ? NoContent() : NotFound();
        }
    }
}