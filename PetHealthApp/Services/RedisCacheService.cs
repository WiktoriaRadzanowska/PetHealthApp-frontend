using StackExchange.Redis;
using System.Text.Json;

namespace PetHealthApp.Services
{

    //serwis do zarządzania pamięcią podreczną w Azure Cache for Redis
    public class RedisCacheService
    {
        //interfejs do bazy danych Redis
        private readonly IDatabase _db;
        private readonly ILogger<RedisCacheService> _logger;

        public RedisCacheService(IConnectionMultiplexer redis,
            ILogger<RedisCacheService> logger)
        {
            _db = redis.GetDatabase();
            _logger = logger;
        }


        //zapisuje obiekt cache, domyslny czas uzycia to 10 minut
        public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null)
        {
            try
            {
                //serializuje do JSON 
                var json = JsonSerializer.Serialize(value,
                    new JsonSerializerOptions
                    {
                        ReferenceHandler =
                            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles //jesli dane zapetlaja sie w kolko, przerywa petle
                    });
                await _db.StringSetAsync(key, json,
                    expiry ?? TimeSpan.FromMinutes(10));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Cache SET error: {Key}", key);
            }
        }


        //pobiera i deserializuje obiekt z cache (zwraca NULL jesli klucz nie istnieje lub wygasl)
        public async Task<T?> GetAsync<T>(string key)
        {
            try
            {
                var json = await _db.StringGetAsync(key);
                if (json.IsNullOrEmpty) return default;
                return JsonSerializer.Deserialize<T>(json.ToString());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Cache GET error: {Key}", key);
                return default;
            }
        }


        //usuwa jeden lub wiele kluczy z cache
        //wywolywane po kazdej operacji modyfikujacej dane (dodanie, edycja itp)
        //aby zapewnic logiczna poprawnosc z danymi z bazy sql
        public async Task RemoveAsync(params string[] keys)
        {
            try
            {
                var tasks = keys.Select(k => _db.KeyDeleteAsync(k));
                await Task.WhenAll(tasks); //usuwa wspolbieznie
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Cache REMOVE error");
            }
        }
    }
}