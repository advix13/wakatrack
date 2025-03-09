import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Circle } from 'lucide-react';

interface TrackingHistoryProps {
  trackingNumber?: string;
  status?: string;
  statusDetails?: string;
  events?: Array<{
    type: string;
    location: string;
    datetime: string;
  }>;
}

// Custom styles to hide scrollbar across all browsers
const hideScrollbarStyle = {
  msOverflowStyle: 'none',  /* IE and Edge */
  scrollbarWidth: 'none',   /* Firefox */
  '&::-webkit-scrollbar': {
    display: 'none'         /* Chrome, Safari and Opera */
  }
};

const TrackingHistory = ({
  trackingNumber,
  status,
  statusDetails = "",
  events = []
}: TrackingHistoryProps) => {
  return (
    <Card className="w-full bg-white">
      <CardContent className="p-2.5">
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-gray-900">Tracking History</h2>
            <p className="text-gray-500 text-sm">{trackingNumber}</p>
          </div>
          <div className="bg-amber-100 text-amber-900 px-4 py-1 rounded-full text-sm font-medium">
            {status}
          </div>
        </div>

        <div 
          className="h-[180px] overflow-y-auto pr-6" 
          style={{ 
            msOverflowStyle: 'none', 
            scrollbarWidth: 'none' 
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <div className="relative">
            {events.length > 0 && (
              <div className="absolute left-1 top-2 bottom-2 w-0.5 bg-amber-200" />
            )}
            <div className="space-y-3">
              {events.map((event, index) => (
                <div key={index} className="relative">
                  <div className="flex gap-2">
                    <div className="relative w-2.5 h-2.5">
                      <div className="absolute w-2.5 h-2.5 bg-amber-500 rounded-full z-10" />
                    </div>
                    <div className="flex-1 pr-8">
                      <div className="flex justify-between items-start">
                        <p className="text-gray-900 font-medium text-sm">{event.type}</p>
                        <p className="text-gray-500 text-sm">
                          {event.datetime.replace(/^([A-Za-z]+)[a-z]*\s+(\d+).*$/, (_, month, day) => 
                            `${month.slice(0, 3)} ${day}`
                          )}
                        </p>
                      </div>
                      <p className="text-gray-600 text-sm mt-0.5">{event.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3 bg-amber-50 text-amber-800 px-4 py-2 rounded-lg text-sm">
          {statusDetails}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrackingHistory;
