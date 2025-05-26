import { useEffect, useState } from "react";
import { Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

const DisplayGMap = ({
  crumbLocation,
}: {
  crumbLocation: google.maps.LatLngLiteral | null;
}) => {
  const [center, setCenter] = useState<google.maps.LatLngLiteral>({
    lat: 37.7749,
    lng: -122.4194,
  });
  const [userCenter, setUserCenter] = useState<google.maps.LatLngLiteral>({
    lat: 41.316307,
    lng: -72.922585,
  });

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
        setUserCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
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
  }, []);

  return (
    <div className="mapItemAddNote">
      <Map
        style={{ width: "100%", height: "100%" }}
        defaultZoom={15}
        center={center}
        mapId="DEMO_MAP_ID"
        options={{
          mapTypeControl: false,
          streetViewControl: false,
          zoomControl: true,
          fullscreenControl: false,
          keyboardShortcuts: false,
          gestureHandling: "greedy",
        }}
      >
        {crumbLocation && (
          <AdvancedMarker position={crumbLocation}>
            <Pin
              background="#34D399"
              borderColor="#ffffff"
              glyphColor="#ffffff"
            />
          </AdvancedMarker>
        )}

        <AdvancedMarker position={userCenter}>
          <div
            style={{
              position: "relative",
              width: "14px",
              height: "14px",
            }}
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
      </Map>
    </div>
  );
};

export default DisplayGMap;
