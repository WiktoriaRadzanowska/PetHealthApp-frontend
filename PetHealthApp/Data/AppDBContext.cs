using Microsoft.EntityFrameworkCore;
using PetHealthApp.Models;

namespace PetHealthApp.Data
{
    //glowna klasa kontekstu bazy danych (dostarcza przez EntityFrameworkCore)
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; } //tabela użytkownika
        public DbSet<Pet> Pets { get; set; } //tabela zwierząt
        public DbSet<Visit> Visits { get; set; } //tabela wizyt weterynaryjnych
        public DbSet<VisitAttachment> VisitAttachments { get; set; } //tabela załączników do wizyt
        public DbSet<WeightEntry> WeightEntries { get; set; } //tabela historii wagi


        //konfiguracja relacji i ograniczeń w bazie danych
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            //uzytkownik ma wiele zwierzat (usunienice konta usuwa wszystkie zwierzaki)
            modelBuilder.Entity<Pet>()
                .HasOne(p => p.User)
                .WithMany(u => u.Pets)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            //zwierzak ma wiele wizyt (usunienice zwierzaka usuwa wszystkie wizyty)
            modelBuilder.Entity<Visit>()
                .HasOne(v => v.Pet)
                .WithMany(p => p.Visits)
                .HasForeignKey(v => v.PetId)
                .OnDelete(DeleteBehavior.Cascade);

            //wizyta ma wiele zalacznikow (usunienice wizyty usuwa wszystkie zalaczniki)
            modelBuilder.Entity<VisitAttachment>()
                .HasOne(a => a.Visit)
                .WithMany(v => v.Attachments)
                .HasForeignKey(a => a.VisitId)
                .OnDelete(DeleteBehavior.Cascade);

            //zwierzak ma wiele wpisow wagi (usuniecie zwierzaka usuwa historie wagi)
            modelBuilder.Entity<WeightEntry>()
                .HasOne(w => w.Pet)
                .WithMany(p => p.WeightHistory)
                .HasForeignKey(w => w.PetId)
                .OnDelete(DeleteBehavior.Cascade);


            modelBuilder.Entity<Visit>()
                .Property(v => v.Cost)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Visit>()
                .Property(v => v.WeightAtVisit)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<WeightEntry>()
                .Property(w => w.WeightKg)
                .HasColumnType("decimal(5,2)");

            modelBuilder.Entity<Pet>()
                .Property(p => p.WeightKg)
                .HasColumnType("decimal(5,2)");


            //indeks unikalny na email (zapobiega rejestracji dwoch kont o tym adresie email)
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
        }
    }
}