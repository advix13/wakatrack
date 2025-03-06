import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, User } from 'lucide-react';

interface AddressCardProps {
  type: 'origin' | 'destination';
  name: string;
  streetAddress: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
}

const AddressCard = ({
  type,
  name,
  streetAddress,
  city,
  stateProvince,
  postalCode,
  country
}: AddressCardProps) => {
  const isOrigin = type === 'origin';
  
  return (
    <Card className="w-full">
      <CardContent>

        <div className="flex items-center justify-between mb-3">
          <div className={`${isOrigin ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'} px-2.5 py-1 rounded-md text-xs font-medium`}>
            {isOrigin ? 'Origin Address' : 'Destination Address'}
          </div>
          <span className="text-gray-500 text-sm font-medium">{country}</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <User className={`w-5 h-5 ${isOrigin ? 'text-orange-500' : 'text-green-500'} mt-0.5`} />
            <div>
              <p className="text-gray-900 font-bold">{name}</p>
              <p className="text-gray-600 mt-0.5">{streetAddress}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className={`w-5 h-5 ${isOrigin ? 'text-orange-500' : 'text-green-500'} mt-0.5`} />
            <div>
              <p className="text-gray-600">{`${city} | ${stateProvince} | ${postalCode}`}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddressCard;
