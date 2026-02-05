import React, { useState, useCallback } from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import { MapPin, Navigation } from 'lucide-react';

interface EventMapProps {
    address: string;
    coordinates?: { lat: number; lng: number };
}

const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '12px',
    border: '2px solid #000000',
};

const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: true,
    styles: [
        {
            featureType: 'all',
            elementType: 'geometry',
            stylers: [{ color: '#f5f5f5' }],
        },
        {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#e9e9e9' }],
        },
        {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#9e9e9e' }],
        },
    ],
};

// Define libraries outside component to prevent re-renders
const libraries: ("marker" | "places")[] = ["marker"];

export const EventMap: React.FC<EventMapProps> = ({ address, coordinates }) => {
    // Default to a central location if no coordinates provided
    const [center, setCenter] = useState(
        coordinates || { lat: 23.8103, lng: 90.4125 } // Dhaka, Bangladesh as default
    );
    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
    const [markerInstance, setMarkerInstance] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Google Maps API Key & Map ID
    // Google Maps API Key & Map ID
    const GOOGLE_MAPS_API_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';
    const isKeyValid = GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'your_google_maps_api_key_here' && GOOGLE_MAPS_API_KEY !== 'YOUR_API_KEY_HERE';
    const GOOGLE_MAPS_MAP_ID = (import.meta as any).env?.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';

    const onLoad = useCallback(() => {
        setIsLoaded(true);

        // If no coordinates provided, try to geocode the address
        if (!coordinates && address && window.google) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ address }, (results, status) => {
                if (status === 'OK' && results && results[0]) {
                    const location = results[0].geometry.location;
                    setCenter({ lat: location.lat(), lng: location.lng() });
                }
            });
        }
    }, [address, coordinates]);

    const onMapLoad = useCallback((map: google.maps.Map) => {
        setMapInstance(map);
    }, []);

    // Manage AdvancedMarkerElement imperatively
    React.useEffect(() => {
        if (mapInstance && center && window.google && window.google.maps.marker) {
            // Remove existing marker if any
            if (markerInstance) {
                markerInstance.map = null;
            }

            const newMarker = new window.google.maps.marker.AdvancedMarkerElement({
                map: mapInstance,
                position: center,
                title: address || "Event Location",
            });

            setMarkerInstance(newMarker);
        }

        // Cleanup function
        return () => {
            if (markerInstance) {
                markerInstance.map = null;
            }
        }
    }, [mapInstance, center]);

    const handleGetDirections = () => {
        const destination = coordinates
            ? `${coordinates.lat},${coordinates.lng}`
            : encodeURIComponent(address);
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Event Location</h3>
                <button
                    onClick={handleGetDirections}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-bold uppercase border border-black hover:bg-[#FA76FF] hover:text-black transition-colors"
                >
                    <Navigation className="w-4 h-4" />
                    Get Directions
                </button>
            </div>

            <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-4 border border-gray-200 rounded-lg">
                <MapPin className="w-5 h-5 mt-0.5 shrink-0" />
                <p>{address}</p>
            </div>

            <div className="relative">
                {isKeyValid ? (
                    <LoadScript
                        googleMapsApiKey={GOOGLE_MAPS_API_KEY}
                        onLoad={onLoad}
                        libraries={libraries}
                    >
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={center}
                            zoom={15}
                            options={mapOptions}
                            onLoad={onMapLoad}
                        >
                            {/* Marker removed in favor of AdvancedMarkerElement via useEffect */}
                        </GoogleMap>
                    </LoadScript>
                ) : (
                    <div
                        style={mapContainerStyle}
                        className="bg-gray-100 flex flex-col items-center justify-center text-center p-6"
                    >
                        <MapPin className="w-12 h-12 text-gray-300 mb-4" />
                        <h4 className="text-gray-900 font-medium mb-2">Map Unavailable</h4>
                        <p className="text-gray-500 text-sm max-w-xs mb-4">
                            We couldn't load the interactive map right now, but you can still get directions.
                        </p>
                        <button
                            onClick={handleGetDirections}
                            className="text-sm font-medium text-blue-600 hover:underline"
                        >
                            Open in Google Maps
                        </button>
                    </div>
                )}

                {!isLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl border-2 border-black">
                        <div className="text-center space-y-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                            <p className="text-sm text-gray-500">Loading map...</p>
                        </div>
                    </div>
                )}
            </div>

            <p className="text-xs text-gray-500 italic">
                💡 Tip: You can zoom and pan the map to explore the area around the event venue.
            </p>
        </div>
    );
};
