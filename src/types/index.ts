export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  notificationsEnabled: boolean;
  emailRemindersEnabled: boolean;
}

export interface Pet {
  id: number;
  name: string;
  species: string;
  breed: string;
  dateOfBirth: string;
  ageDisplay: string;
  weightKg?: number;
  photoUrl?: string;
  gender?: string;
  furColor?: string;
  visitCount: number;
  lastVisit?: Visit;
}

export interface Visit {
  id: number;
  petId: number;
  visitDate: string;
  title: string;
  visitType: string; // "Kontrola" | "Szczepienie" | "Badanie" | "Zabieg" | "Leki"
  vetNotes: string;
  vetName: string;
  cost: number;
  weightAtVisit?: number;
  attachments: Attachment[];
}

export interface Attachment {
  id: number;
  fileName: string;
  blobUrl: string;
  contentType: string;
  uploadedAt: string;
}

export interface WeightEntry {
  id: number;
  petId: number;
  weightKg: number;
  measuredAt: string;
  note?: string;
}

export interface Dashboard {
  pet: Pet;
  upcomingVaccinations: UpcomingVaccination[];
  lastVisit?: Visit;
  currentWeight?: number;
}

export interface UpcomingVaccination {
  vaccineName: string;
  dueDate: string;
  daysRemaining: number;
}

// Typy dla nawigacji
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  PetSelect: undefined;
  MainTabs: { petId: number };
  HealthBook: { petId: number };
  VisitDetail: { visitId: number };
  AddVisit: { petId: number };
  EditVisit: { visitId: number };
  Weight: { petId: number };
  PetDetail: { petId: number };
  AddPet: undefined;
  ManagePets: undefined;
  Settings: undefined;
  ChangePassword: undefined;
  AccountInfo: undefined;
};