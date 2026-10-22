export interface FoodItem {
  id: string;
  restaurantId: string;
  restaurantName: string;
  title: string;
  description: string;
  originalPrice: number;
  discountPrice: number;
  quantity: number;
  expiryTime: string;
  imageUrl: string;
  category: string;
  isHalal: boolean;
  latitude: number;
  longitude: number;
  distance?: number;
  type: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  role_target: string;
  merchant_id?: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  data?: Record<string, any>;
  created_at: string;
}
