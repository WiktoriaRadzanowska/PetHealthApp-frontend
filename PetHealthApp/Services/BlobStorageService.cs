using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace PetHealthApp.Services
{

    //serwis do zarządzania plikami w Azure Blob Storage
    public class BlobStorageService
    {
        private readonly BlobServiceClient _client;
        private readonly ILogger<BlobStorageService> _logger;

        //nazwy kontenerów w Azure Blob Storage
        private const string PetPhotosContainer = "pet-photos";
        private const string AttachmentsContainer = "visit-attachments";

        public BlobStorageService(BlobServiceClient client,
            ILogger<BlobStorageService> logger)
        {
            _client = client;
            _logger = logger;
        }


        //Przesyla zdjecie profilowe zwierzaka do pet-photos, zwraca URL pliku ktory zapisywany jest w bazie SQL
        public async Task<string> UploadPetPhotoAsync(IFormFile file, int petId)
        {
            return await UploadFileAsync(file, PetPhotosContainer,
                $"pet-{petId}-{Guid.NewGuid()}");
        }

        //Przesyla załącznik do wizyty (PDF/zdjęcie) do visit-attachments
        public async Task<string> UploadVisitAttachmentAsync(IFormFile file, int visitId)
        {
            return await UploadFileAsync(file, AttachmentsContainer,
                $"visit-{visitId}-{Guid.NewGuid()}");
        }


        //wspolna metoda uploadu pliku do wskazanego konetnera
        private async Task<string> UploadFileAsync(IFormFile file,
            string containerName, string blobPrefix)
        {
            var container = _client.GetBlobContainerClient(containerName);
            await container.CreateIfNotExistsAsync(PublicAccessType.Blob); //tworzy kontener jesli nie istnieje + daje adres publiczny

            var ext = Path.GetExtension(file.FileName);
            var blobName = $"{blobPrefix}{ext}";
            var blobClient = container.GetBlobClient(blobName);

            await blobClient.UploadAsync(file.OpenReadStream(), new BlobHttpHeaders
            {
                ContentType = file.ContentType //dodanie etykiety co to, np. pdf dla poprawnego wyswietlania
            });

            _logger.LogInformation("Upload: {BlobName}", blobName);
            return blobClient.Uri.ToString(); //zwroc publiczny URL do pliku
        }



        //usuwa plik blob storage na podstawie jego url (wywolane przy usuwaniu zwierzaka lub wizyty)
        public async Task DeleteAsync(string url)
        {
            try
            {
                var uri = new Uri(url);
                //wyodrebnij nazwe kontenera i pliku URL
                var segments = uri.AbsolutePath
                    .Split('/', StringSplitOptions.RemoveEmptyEntries);
                if (segments.Length < 2) return;
                var containerName = segments[0];
                var blobName = string.Join("/", segments.Skip(1));
                var container = _client.GetBlobContainerClient(containerName);
                await container.GetBlobClient(blobName).DeleteIfExistsAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Błąd usuwania blob: {Url}", url);
            }
        }
    }
}