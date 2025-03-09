import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface DescriptionCardProps {
  description?: string;
}

const DescriptionCard = ({ 
  description = "Fragile electronic equipment packed in protective foam padding. Contains sensitive computer components and displays. Handle with care. Keep away from extreme temperatures and moisture. Do not stack heavy items on top."
}: DescriptionCardProps) => {
  return (
    <Card className="w-full">
      <CardContent className="p-2.5">
        <div className="flex items-center justify-between mb-3">
          <div className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md text-xs font-bold">
            Description
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <FileText className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
            <p className="text-sm font-semibold text-gray-900">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DescriptionCard;
