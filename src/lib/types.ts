export type Category = "food_home" | "haircut_mobile" | "cleaning" | "tutoring" | "repairs";

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