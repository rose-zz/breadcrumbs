import { useEffect, useState } from "react";
import {
  Map,
  AdvancedMarker,
  useMap,
  Pin,
  MapCameraChangedEvent,
} from "@vis.gl/react-google-maps";

const PanToButton = () => {
  const map = useMap();

  const panToCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        if (map) {
          map.panTo(location);
        }
      },
      () => {
        alert(
          "Unable to retrieve your location. Please enable location access in your browser."
        );
      }
    );
  };

  return (
    <button
      onClick={panToCurrentLocation}
      style={{
        position: "absolute",
        bottom: "5%",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 20,
        padding: "6px 10px",
        fontSize: "12px",
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
};

const AddNoteGmap = ({
  tempLocation,
  onMapClick,
  style = "mapItemAddNote",
}: {
  tempLocation?: google.maps.LatLngLiteral | null;
  onMapClick?: (location: google.maps.LatLngLiteral) => void;
  style: string;
}) => {
  const [userCenter, setUserCenter] = useState<google.maps.LatLngLiteral>({
    lat: 41.3125903, lng: -72.9250062
  });

  const map = useMap();

  useEffect(() => {
    if (map && tempLocation) {
      map.panTo(tempLocation);
    }
  }, [tempLocation, map]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserCenter(location);
          console.log("bruh");
        },
        (error) => console.warn("Geolocation failed or was denied:", error)
      );
    }
  }, []);

  useEffect(() => {
    if (!map || !onMapClick) return;

    const listener = map.addListener(
      "click",
      (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          const location = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
          };
          onMapClick(location);
        }
      }
    );

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [map, onMapClick]);

  return (
    <div className={style}>
      <Map
        defaultZoom={15}
        defaultCenter={userCenter}
        mapId="DEMO_MAP_ID"
        style={{ width: "100%", height: "100%" }}
        onCameraChanged={(ev: MapCameraChangedEvent) =>
          console.log(
            "camera changed:",
            ev.detail.center,
            "zoom:",
            ev.detail.zoom
          )
        }
      >
        <PanToButton />
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

        {tempLocation && (
          <AdvancedMarker position={tempLocation}>
            <Pin background="#34a853" glyphColor="#fff" borderColor="#000" />
          </AdvancedMarker>
        )}
      </Map>
    </div>
  );
};

export default AddNoteGmap;
