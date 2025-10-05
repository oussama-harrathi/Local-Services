export type Category = "food_home" | "haircut_mobile" | "cleaning" | "tutoring" | "repairs" | "pet_care" | "gardening" | "photography" | "fitness_training" | "music_lessons";

export type ReviewSummary = {
  rating: number;
  count: number;
};

export type Provider = {
  id: string;
  name: string;
  city: "Tunis" | "Sousse" | "Budapest";
  coords: { lat: number; lng: number };
  categories: Category[];
  bio: string;
  avatarUrl: string;
  review: ReviewSummary;
  whatsapp?: string;
  messenger?: string;
  schedules?: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isActive: boolean;
  }[];
};

export type CityCenter = {
  lat: number;
  lng: number;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
};