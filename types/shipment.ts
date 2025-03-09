export type ShipmentStatus = 
  | "Pending"
  | "In Transit"
  | "Out for Delivery"
  | "Delivered"
  | "Exception";

export interface ShipmentRecord {
  id: string;
  userId?: string;
  userEmail?: string;
  trackingNumber: string;
  status: ShipmentStatus;
  origin: string;
  destination: string;
  currentLocation: string;
  lastUpdated: string;
  currentStatus?: string;
}

export const getStatusColor = (status: ShipmentStatus): string => {
  const colors = {
    "Pending": "bg-gray-100 text-gray-800",
    "In Transit": "bg-blue-100 text-blue-800",
    "Out for Delivery": "bg-amber-100 text-amber-800",
    "Delivered": "bg-green-100 text-green-800",
    "Exception": "bg-red-100 text-red-800"
  };
  return colors[status];
};
