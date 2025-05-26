import { useEffect, useState } from "react";
import { Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

const THRESHOLD = 0.2;

const getDistanceInMiles = (
  loc1: google.maps.LatLngLiteral,
  loc2: google.maps.LatLngLiteral
): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 3958.8;
  const dLat = toRad(loc2.lat - loc1.lat);
  const dLng = toRad(loc2.lng - loc1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(loc1.lat)) *
      Math.cos(toRad(loc2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const PanToButton = ({ requestLocation }: { requestLocation: () => void }) => (
  <button
    onClick={requestLocation}
    style={{
      position: "absolute",
      top: "10px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 20,
      padding: "6px 10px",
      fontSize: "16px",
      color: "#000",
      backgroundColor: "#fff",
      border: "1px solid #ccc",
      borderRadius: "6px",
      cursor: "pointer",
    }}
  >
    Center on Me
  </button>
);

interface ActiveHuntsMapProps {
  crumbLocation: google.maps.LatLngLiteral | null;
  onDistanceCheck: (isWithinRange: boolean, distance: number) => void;
}

const ActiveHuntsMap = ({
  crumbLocation,
  onDistanceCheck,
}: ActiveHuntsMapProps) => {
  const [center, setCenter] = useState<google.maps.LatLngLiteral>(
    crumbLocation || { lat: 41.316307, lng: -72.922585 }
  );
  const [userLocation, setUserLocation] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [errorShown, setErrorShown] = useState(false);

  useEffect(() => {
    if (crumbLocation) {
      setCenter(crumbLocation);
    }
  }, [crumbLocation]);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(newLocation);
        setCenter(newLocation);

        if (crumbLocation) {
          const distance = getDistanceInMiles(newLocation, crumbLocation);
          const isWithinRange = distance <= THRESHOLD;
          onDistanceCheck(isWithinRange, distance);
        }
      },
      (error) => {
        console.warn("Geolocation error:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 20000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [crumbLocation, onDistanceCheck]);

  const safeGetCurrentPosition = () => {
    if (!navigator.geolocation) {
      if (!errorShown) {
        alert("Geolocation is not supported by your browser.");
        setErrorShown(true);
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        setCenter(location);
        if (crumbLocation) {
          const distance = getDistanceInMiles(location, crumbLocation);
          const isWithinRange = distance <= THRESHOLD;
          onDistanceCheck(isWithinRange, distance);
        }
      },
      (error) => {
        console.error("Geolocation error:", error.message);
        if (!errorShown) {
          alert("Error getting location: " + error.message);
          setErrorShown(true);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="mapItemAddNote">
      <Map
        style={{ width: "100%", height: "100%" }}
        defaultZoom={15}
        defaultCenter={center}
        mapId="DEMO_MAP_ID"
        options={{
          mapTypeControl: false,
          streetViewControl: false,
          zoomControl: false,
          fullscreenControl: false,
          keyboardShortcuts: false,
          gestureHandling: "greedy",
        }}
      >
        {userLocation && (
          <AdvancedMarker position={userLocation}>
            <div
              style={{ position: "relative", width: "14px", height: "14px" }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "14px",
                  height: "14px",
                  backgroundColor: "#4285F4",
                  border: "2px solid white",
                  borderRadius: "50%",
                  boxShadow: "0 0 6px rgba(0,0,0,0.3)",
                  zIndex: 2,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "-8px",
                  left: "-8px",
                  width: "30px",
                  height: "30px",
                  backgroundColor: "#4285F4",
                  opacity: 0.4,
                  borderRadius: "50%",
                  animation: "pulse 2s infinite",
                  zIndex: 1,
                }}
              />
              <style jsx>{`
                @keyframes pulse {
                  0% {
                    transform: scale(0.5);
                    opacity: 0.4;
                  }
                  50% {
                    transform: scale(1);
                    opacity: 0.1;
                  }
                  100% {
                    transform: scale(0.5);
                    opacity: 0.4;
                  }
                }
              `}</style>
            </div>
          </AdvancedMarker>
        )}

        {crumbLocation && (
          <AdvancedMarker position={crumbLocation}>
            <Pin
              background="#34D399"
              borderColor="#ffffff"
              glyphColor="#ffffff"
              scale={1.2}
            />
          </AdvancedMarker>
        )}

        <PanToButton requestLocation={safeGetCurrentPosition} />
      </Map>
    </div>
  );
};

export default ActiveHuntsMap;
