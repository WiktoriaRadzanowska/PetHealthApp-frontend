using Azure.Data.Tables;

namespace PetHealthApp.Logging
{
    //Serwis odpowiedzialny za zapis logow systemowych do Azure Table Storage
    public class AzureTableLogger
    {
        private readonly TableClient _tableClient;
        private readonly ILogger<AzureTableLogger> _logger;

        public AzureTableLogger(TableServiceClient tableServiceClient,
            ILogger<AzureTableLogger> logger)
        {
            _logger = logger;
            //pobierz klienta dla tabeli SystemLogs
            _tableClient = tableServiceClient.GetTableClient("SystemLogs");
            _tableClient.CreateIfNotExists(); //tworzy tabele jesli jeszcze nie istnieje
        }


        //zapisuje wpis logu do Azure Table Storage asynchronicznie
        public async Task LogAsync(string operation, string message, int? userId = null)
        {
            try
            {
                var entity = new LogEntity
                {
                    Operation = operation,
                    Message = message,
                    UserId = userId,
                    Timestamp = DateTimeOffset.UtcNow
                };
                await _tableClient.AddEntityAsync(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Błąd zapisu logu"); //brak mozliwosci zapisania logu - nie powinien blokowac glownego dzialania aplikacji
            }
        }


        //pobieranie ostatnich logow posortowanych od najnowszych (dla GET/api/logs)
        public async Task<List<LogEntity>> GetLogsAsync(int count = 100)
        {
            var logs = new List<LogEntity>();
            await foreach (var log in _tableClient.QueryAsync<LogEntity>(maxPerPage: count))
            {
                logs.Add(log);
                if (logs.Count >= count) break;
            }
            return logs.OrderByDescending(l => l.Timestamp).ToList();
        }
    }
}