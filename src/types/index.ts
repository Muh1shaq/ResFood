export type UserRole = "customer" | "restaurant" | "foodbank" | "volunteer";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  phoneNumber?: string;
  createdAt: string;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  imageUrl: string;
  rating: number;
  latitude: number;
  longitude: number;
  phone: string;
  verified: boolean;
}

export interface FoodItem {
  id: string;
  restaurantId: string;
  restaurantName: string;
  title: string;
  description: string;
  originalPrice: number;
  discountPrice: number; // 0 if free/donation
  quantity: number;
  expiryTime: string; // ISO string
  imageUrl: string;
  category: "makanan berat" | "roti & kue" | "buah & sayur" | "minuman" | "lainnya";
  isHalal: boolean;
  latitude: number;
  longitude: number;
  distance?: number; // Calculated dynamically in client
  type: "surplus" | "donation";
}

export interface DonationRequest {
  id: string;
  foodBankId: string;
  foodBankName: string;
  title: string;
  description: string;
  targetQuantity: number;
  currentQuantity: number;
  deadline: string;
  category: string;
  status: "open" | "fulfilled" | "closed";
}

export interface FoodTransaction {
  id: string;
  itemId: string;
  buyerId: string;
  sellerId: string;
  quantity: number;
  totalPrice: number;
  status: "pending" | "preparing" | "ready_for_pickup" | "completed" | "cancelled";
  pickupCode: string;
  createdAt: string;
}
