import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Scale, Box, FileText, Hash } from 'lucide-react';

interface PackageDetailsCardProps {
  weight: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  packageType: string;
  referenceNumber: string;
  contentsDescription: string;
}

const PackageDetailsCard = ({
  weight = "0.00",
  dimensions = { length: 0, width: 0, height: 0 },
  packageType = "Package Type",
  referenceNumber = "REF-12345",
  contentsDescription = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
}: Partial<PackageDetailsCardProps>) => {
  return (
    <Card className="w-full">
      <CardContent className="p-2.5">
        <div className="flex items-center justify-between mb-3">
          <div className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-md text-xs font-bold">
            Package Details
          </div>
        </div>

        <div className="space-y-4">
          {/* Weight and Dimensions Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-xs text-gray-700 font-medium">Weight</p>
                <p className="text-sm font-semibold text-gray-900">{weight} kg</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-xs text-gray-700 font-medium">Dimensions</p>
                <p className="text-sm font-semibold text-gray-900">L: {dimensions.length} × W: {dimensions.width} × H: {dimensions.height} cm</p>
              </div>
            </div>
          </div>

          {/* Package Type and Reference Number */}
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="flex items-start gap-2">
              <Package className="w-4 h-4 text-purple-500 mt-1" />
              <div>
                <p className="text-xs text-gray-700 font-medium">Package Type</p>
                <p className="text-sm font-semibold text-gray-900">{packageType}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Hash className="w-4 h-4 text-purple-500 mt-1" />
              <div>
                <p className="text-xs text-gray-700 font-medium">Reference Number</p>
                <p className="text-sm font-semibold text-gray-900">{referenceNumber}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 col-span-2">
              <FileText className="w-4 h-4 text-purple-500 mt-1" />
              <div>
                <p className="text-xs text-gray-700 font-medium">Contents Description</p>
                <p className="text-sm font-semibold text-gray-900 leading-relaxed">{contentsDescription}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PackageDetailsCard;
