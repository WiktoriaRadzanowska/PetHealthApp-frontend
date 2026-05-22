using Swashbuckle.AspNetCore.Annotations;
using PetHealthApp.Extensions;

var builder = WebApplication.CreateBuilder(args);


//konfiguracja serwisów przez Extension Methods
builder.Services
    .AddDatabaseServices(builder.Configuration) //Azure SQL + Entity Framework
    .AddRedisCache(builder.Configuration) //Azure Cache for Redis
    .AddAzureStorage(builder.Configuration) // Azure Blob +Table Storage
    .AddApplicationServices();

//ustawienia przesyłania danych (JSON)
builder.Services.AddControllers()
    .AddJsonOptions(o =>
        o.JsonSerializerOptions.ReferenceHandler =
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles); //zapobiega nieskończonej pętli

//swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "PetHealth App", Version = "v1" });
});

//odblokowanie dostępu dla aplikacji mobilnej
builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

var app = builder.Build();

//automatyczne tworzenie bazy danych - jesli baza SQL nie ma naszych tabel, sam je tworzy
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider
        .GetRequiredService<PetHealthApp.Data.AppDbContext>();
    db.Database.EnsureCreated();
}

//uruchomienie panelu swaggera
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "PetHealth App v1");
    c.RoutePrefix = string.Empty;
});

app.UseCors();
app.MapControllers(); //przekierowanie żądan w odpowiednie miejsca aplikacji
app.Run();