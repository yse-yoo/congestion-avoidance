'use client'; // クライアントサイドで動作させるために必要

import React, { useState, useRef } from 'react';
import { GoogleMap, LoadScript, DirectionsService, DirectionsRenderer, Autocomplete } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '500px',
};

const center = {
  lat: 35.6895, // 東京の緯度
  lng: 139.6917, // 東京の経度
};

const libraries = ['places']; // Autocompleteを使用するために'places'ライブラリが必要です

const MapComponent: React.FC = () => {
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [origin, setOrigin] = useState<google.maps.LatLngLiteral | null>(null);
  const [destination, setDestination] = useState<google.maps.LatLngLiteral | null>(null);
  const originRef = useRef<google.maps.places.Autocomplete | null>(null);
  const destinationRef = useRef<google.maps.places.Autocomplete | null>(null);

  const calculateRoute = () => {
    if (!origin || !destination) {
      alert('Please enter both origin and destination');
      return;
    }

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: 'pessimistic',
        },
      },
      (result, status) => {
        if (status === 'OK' && result) {
          setDirectionsResponse(result);
        } else {
          console.error(`error fetching directions ${status}`);
        }
      }
    );
  };

  const onLoadOrigin = (autocomplete: google.maps.places.Autocomplete) => {
    originRef.current = autocomplete;
  };

  const onPlaceChangedOrigin = () => {
    if (originRef.current) {
      const place = originRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        setOrigin({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    }
  };

  const onLoadDestination = (autocomplete: google.maps.places.Autocomplete) => {
    destinationRef.current = autocomplete;
  };

  const onPlaceChangedDestination = () => {
    if (destinationRef.current) {
      const place = destinationRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        setDestination({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    }
  };

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''} libraries={libraries}>
      <div className="flex flex-col items-center p-5">
        <div className="w-full max-w-4xl mb-6">
          <Autocomplete onLoad={onLoadOrigin} onPlaceChanged={onPlaceChangedOrigin}>
            <input
              type="text"
              placeholder="Enter origin (address or station)"
              className="input-text w-full sm:w-1/2 p-2 border border-gray-300 rounded-lg shadow-sm mb-2"
            />
          </Autocomplete>
        </div>
        <div className="w-full max-w-4xl mb-6">
          <Autocomplete onLoad={onLoadDestination} onPlaceChanged={onPlaceChangedDestination}>
            <input
              type="text"
              placeholder="Enter destination (address or station)"
              className="input-text w-full sm:w-1/2 p-2 border border-gray-300 rounded-lg shadow-sm mb-2"
            />
          </Autocomplete>
        </div>
        <button
          onClick={calculateRoute}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
        >
          Calculate Route
        </button>
        <div className="mt-8 w-full max-w-4xl">
          <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
            {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
          </GoogleMap>
        </div>
      </div>
    </LoadScript>
  );
};

const Home: React.FC = () => {
  return (
    <div>
      <h1 className="text-4xl text-center mt-8 font-bold">Search Address and Show Route</h1>
      <MapComponent />
    </div>
  );
};

export default Home;
