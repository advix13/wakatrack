'use client';

import React, { useEffect, useRef, useState } from 'react';
import { geocodeLocation } from '@/utils/geocoding';
import { Card, CardContent } from '@/components/ui/card';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapCardProps {
  origin: string;
  destination: string;
  currentLocation?: string;
}

const MapCard: React.FC<MapCardProps> = ({ origin, destination, currentLocation }) => {
  // Refs for map and layers
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const routeLayer = useRef<L.LayerGroup | null>(null);

  // State for coordinates
  const [coordinates, setCoordinates] = useState<{
    origin: { lat: number; lng: number } | null;
    destination: { lat: number; lng: number } | null;
    current: { lat: number; lng: number } | null;
  }>({
    origin: null,
    destination: null,
    current: null
  });

  // Update coordinates when locations change
  useEffect(() => {
    const updateCoordinates = async () => {
      const [originCoords, destCoords, currentCoords] = await Promise.all([
        origin ? geocodeLocation(origin) : null,
        destination ? geocodeLocation(destination) : null,
        currentLocation ? geocodeLocation(currentLocation) : null
      ]);

      setCoordinates({
        origin: originCoords,
        destination: destCoords,
        current: currentCoords
      });
    };

    updateCoordinates();
  }, [origin, destination, currentLocation]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Create map
    mapInstance.current = L.map(mapRef.current, {
      minZoom: 3,
      maxZoom: 18,
      worldCopyJump: true
    }).setView([20, 0], 3);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(mapInstance.current);

    // Create layers
    markersLayer.current = L.layerGroup().addTo(mapInstance.current);
    routeLayer.current = L.layerGroup().addTo(mapInstance.current);

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  // Update markers and route
  useEffect(() => {
    if (!mapInstance.current || !markersLayer.current || !routeLayer.current) return;

    // Clear existing layers
    markersLayer.current.clearLayers();
    routeLayer.current.clearLayers();

    const points: L.LatLngExpression[] = [];

    // Helper function to create custom icon with label
    const createIconWithLabel = (color: string, label: string) => L.divIcon({
      html: `
        <div class="relative">
          <div class="w-3 h-3 rounded-full bg-${color}-500 border-2 border-white shadow-lg"></div>
          <div class="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-1.5 py-0.5 rounded text-[10px] font-medium shadow-sm border border-gray-200">
            ${label}
          </div>
        </div>
      `,
      className: 'custom-div-icon',
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });

    // Add markers with permanent labels
    if (coordinates.origin) {
      const pos: L.LatLngExpression = [coordinates.origin.lat, coordinates.origin.lng];
      points.push(pos);
      L.marker(pos, { icon: createIconWithLabel('green', 'Origin') })
        .addTo(markersLayer.current);
    }

    if (coordinates.current) {
      const pos: L.LatLngExpression = [coordinates.current.lat, coordinates.current.lng];
      points.push(pos);
      L.marker(pos, { icon: createIconWithLabel('blue', 'Current') })
        .addTo(markersLayer.current);
    }

    if (coordinates.destination) {
      const pos: L.LatLngExpression = [coordinates.destination.lat, coordinates.destination.lng];
      points.push(pos);
      L.marker(pos, { icon: createIconWithLabel('red', 'Destination') })
        .addTo(markersLayer.current);
    }

    // Draw routes with different styles for traveled and remaining
    const routePoints = [];
    let lastPoint = null;

    // Origin to Current (traveled)
    if (coordinates.origin && coordinates.current) {
      routePoints.push({
        points: [
          [coordinates.origin.lat, coordinates.origin.lng],
          [coordinates.current.lat, coordinates.current.lng]
        ],
        type: 'traveled'
      });
    }

    // Current to Destination (remaining)
    if (coordinates.current && coordinates.destination) {
      routePoints.push({
        points: [
          [coordinates.current.lat, coordinates.current.lng],
          [coordinates.destination.lat, coordinates.destination.lng]
        ],
        type: 'remaining'
      });
    }

    // If no current location, draw direct line from origin to destination
    if (!coordinates.current && coordinates.origin && coordinates.destination) {
      routePoints.push({
        points: [
          [coordinates.origin.lat, coordinates.origin.lng],
          [coordinates.destination.lat, coordinates.destination.lng]
        ],
        type: 'remaining'
      });
    }

    // Draw the routes
    routePoints.forEach(route => {
      L.polyline(route.points, {
        color: route.type === 'traveled' ? '#22c55e' : '#ef4444',
        weight: 2.5,
        opacity: 0.8,
        dashArray: route.type === 'remaining' ? '8, 8' : null
      }).addTo(routeLayer.current!);
    });

    // Center map on all points with fixed edge distance
    if (points.length > 0 && points.length >= 2) {
      if (mapRef.current && mapInstance.current) {
        const EDGE_PADDING = 40; // Fixed 40px from edges
        const { width, height } = mapRef.current.getBoundingClientRect();
        
        // Get the first and last points (origin and destination)
        const point1 = points[0];
        const point2 = points[points.length - 1];
        
        // Calculate the center point between origin and destination
        const center = L.latLng([
          (point1[0] + point2[0]) / 2,
          (point1[1] + point2[1]) / 2
        ]);
        
        // Function to calculate zoom level for desired pixel distance
        const calculateZoomForPixelDistance = () => {
          let zoom = 0;
          let found = false;
          
          // Binary search for the correct zoom level
          let minZoom = 1;
          let maxZoom = 20;
          
          while (!found && minZoom <= maxZoom) {
            zoom = Math.floor((minZoom + maxZoom) / 2);
            mapInstance.current!.setZoom(zoom, { animate: false });
            
            // Get pixel points
            const pixel1 = mapInstance.current!.latLngToContainerPoint(point1);
            const pixel2 = mapInstance.current!.latLngToContainerPoint(point2);
            
            // Calculate distances from edges
            const leftDist = Math.min(pixel1.x, pixel2.x);
            const rightDist = Math.min(width - pixel1.x, width - pixel2.x);
            const topDist = Math.min(pixel1.y, pixel2.y);
            const bottomDist = Math.min(height - pixel1.y, height - pixel2.y);
            
            // Check if we're at the desired edge distance
            const minEdgeDist = Math.min(leftDist, rightDist, topDist, bottomDist);
            
            if (Math.abs(minEdgeDist - EDGE_PADDING) < 5) {
              found = true;
            } else if (minEdgeDist < EDGE_PADDING) {
              maxZoom = zoom - 1;
            } else {
              minZoom = zoom + 1;
            }
          }
          
          return zoom;
        };
        
        // Set center first
        mapInstance.current.setView(center, 1, { animate: false });
        
        // Calculate and set the optimal zoom
        const optimalZoom = calculateZoomForPixelDistance();
        
        // Apply final view with calculated zoom
        mapInstance.current.setView(center, optimalZoom, {
          animate: true
        });
      }
    }
  }, [coordinates, origin, destination, currentLocation]);

  return (
    <div className="space-y-px">
      {/* Map Card */}
      <Card className="rounded-b-none overflow-hidden shadow-lg">
        <CardContent className="p-0">
          <div ref={mapRef} className="w-full h-[300px]" />
        </CardContent>
      </Card>

      {/* Legend Row */}
      <div className="bg-white shadow-lg rounded-b-xl px-2 py-1.5">
        <div className="grid grid-cols-4 gap-2">
          {/* Origin */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <div className="truncate">
                <span className="text-sm font-medium">Origin</span>
              </div>
            </div>
            <div className="pl-3 -mt-1 text-[11px] text-gray-500 truncate">{origin}</div>
          </div>

          {/* Current Location */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <div className="truncate">
                <span className="text-sm font-medium">Current</span>
              </div>
            </div>
            {currentLocation && (
              <div className="pl-3 -mt-1 text-[11px] text-gray-500 truncate">{currentLocation}</div>
            )}
          </div>

          {/* Destination */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <div className="truncate">
                <span className="text-sm font-medium">Destination</span>
              </div>
            </div>
            <div className="pl-3 -mt-1 text-[11px] text-gray-500 truncate">{destination}</div>
          </div>

          {/* Route Types */}
          <div className="flex flex-col gap-0 items-end">
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-green-500" />
              <span className="text-[11px] text-gray-500">Distance covered</span>
            </div>
            <div className="flex items-center gap-1 -mt-0.5">
              <div className="w-3 h-0.5 bg-red-500 border-t border-dashed" 
                   style={{ borderColor: '#ef4444' }} />
              <span className="text-[11px] text-gray-500">Distance to go</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapCard;
