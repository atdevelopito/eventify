import { useEffect, useRef, useState, useCallback } from 'react';

interface Place {
    formatted_address?: string;
    name?: string;
    geometry?: {
        location: {
            lat: () => number;
            lng: () => number;
        };
    };
}

export const useGooglePlacesAutocomplete = (
    inputRef: React.RefObject<HTMLInputElement>
) => {
    const [place, setPlace] = useState<Place | null>(null);
    const autoCompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const onPlaceSelectedRef = useRef<((place: Place) => void) | null>(null);

    useEffect(() => {
        if (!inputRef.current) return;

        // Check if google maps script is loaded
        if (!window.google || !window.google.maps || !window.google.maps.places) {
            console.warn('Google Maps API not loaded');
            return;
        }

        autoCompleteRef.current = new window.google.maps.places.Autocomplete(
            inputRef.current,
            {
                types: ['geocode', 'establishment'],
                fields: ['formatted_address', 'geometry', 'name'],
            }
        );

        autoCompleteRef.current.addListener('place_changed', () => {
            const placeResult = autoCompleteRef.current?.getPlace();
            if (placeResult) {
                setPlace(placeResult);
                if (onPlaceSelectedRef.current) {
                    onPlaceSelectedRef.current(placeResult);
                }
            }
        });

        // Cleanup
        return () => {
            if (autoCompleteRef.current) {
                google.maps.event.clearInstanceListeners(autoCompleteRef.current);
            }
        };
    }, [inputRef]);

    const onPlaceSelected = useCallback((callback: (place: Place) => void) => {
        onPlaceSelectedRef.current = callback;
    }, []);

    return {
        place,
        onPlaceSelected,
    };
};
