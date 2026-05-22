using Microsoft.AspNetCore.Mvc;
using PetHealthApp.Logging;

namespace PetHealthApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LogsController : ControllerBase
    {
        private readonly AzureTableLogger _logger;
        public LogsController(AzureTableLogger logger) => _logger = logger;

        //zwraca ostatnie logi (domyslnie 50), posortowane od najnowszego
        [HttpGet]
        public async Task<IActionResult> GetLogs([FromQuery] int count = 50)
        {
            var logs = await _logger.GetLogsAsync(count);
            return Ok(logs);
        }
    }
}