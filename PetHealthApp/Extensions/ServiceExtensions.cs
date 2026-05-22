using Azure.Data.Tables;
using Azure.Storage.Blobs;
using Microsoft.EntityFrameworkCore;
using PetHealthApp.Data;
using PetHealthApp.Facade;
using PetHealthApp.Logging;
using PetHealthApp.Services;
using StackExchange.Redis;

namespace PetHealthApp.Extensions
{

    //wzorzec - metody rozszerzające
    public static class ServiceExtensions
    {

        //rejestruje Entity Framework Core z polaczeniem do Azure SQL Database
        public static IServiceCollection AddDatabaseServices(
            this IServiceCollection services, IConfiguration config)
        {
            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(
                    config.GetConnectionString("SqlConnection")));
            return services;
        }


        //rejestruje polaczenie z Azure Cache for Redis jako jeden obiekt polaczenia dla wszystkich, tylko raz
        public static IServiceCollection AddRedisCache(
            this IServiceCollection services, IConfiguration config)
        {
            services.AddSingleton<IConnectionMultiplexer>(_ =>
                ConnectionMultiplexer.Connect(
                    config.GetConnectionString("RedisConnection")!));
            return services;
        }


        //rejestruje klientow Azure Blob Storage i Azure Table Storage jako singleton
        public static IServiceCollection AddAzureStorage(
            this IServiceCollection services, IConfiguration config)
        {
            var conn = config.GetConnectionString("StorageConnection")!;
            services.AddSingleton(_ => new BlobServiceClient(conn));
            services.AddSingleton(_ => new TableServiceClient(conn));
            return services;
        }


        //rejestruje wszystkie wlasne serwisy aplikacji jako scooped -jeden na żądanie
        public static IServiceCollection AddApplicationServices(
            this IServiceCollection services)
        {
            services.AddScoped<BlobStorageService>();
            services.AddScoped<RedisCacheService>();
            services.AddScoped<AzureTableLogger>();
            services.AddScoped<AuthService>();
            services.AddScoped<PetFacade>();
            services.AddScoped<VisitFacade>();
            return services;
        }
    }
}