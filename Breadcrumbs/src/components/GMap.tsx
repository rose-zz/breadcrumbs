import { useCallback, useEffect, useState } from "react";
import {
  Map,
  AdvancedMarker,
  useMap,
  Pin,
  MapCameraChangedEvent,
} from "@vis.gl/react-google-maps";
import Note from "./Note";
import { supabase } from "../supabase";

const THRESHOLD = 0.2

const getDistanceInMiles = (
  loc1: google.maps.LatLngLiteral,
  loc2: google.maps.LatLngLiteral
): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;

  const R = 3958.8; // Earth radius in miles
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

type Poi = {
  key: string;
  location: google.maps.LatLngLiteral;
  author: string;
  body: string;
  timeLeft: string;
  isRead: boolean;
  noteId: number;
};

const PoiMarkers = ({
  pois,
  onMarkerClick,
  userLocation,
}: {
  pois: Poi[];
  onMarkerClick: (poi: Poi) => void;
  userLocation: google.maps.LatLngLiteral;
}) => {
  const map = useMap();

  const handleClick = useCallback(
    (poi: Poi) => (ev: google.maps.MapMouseEvent) => {
      // const distance = getDistanceInMiles(poi.location, userLocation);
      // if (distance > THRESHOLD || !map || !ev.latLng) return;
      if (map && ev.latLng) {
        map.panTo(ev.latLng);
        onMarkerClick(poi);
      }
    },
    [map, onMarkerClick, userLocation]
  );

  return (
    <>
      {pois.map((poi) => {
        const distance = getDistanceInMiles(poi.location, userLocation);
        const isNearby = distance <= THRESHOLD;

        return (
          <AdvancedMarker
            key={poi.key}
            position={poi.location}
            // clickable={isNearby}
            onClick={handleClick(poi)}
          >
            <Pin
              background={isNearby ? "#FBBC04" : "#FF4C4C"}
              glyphColor="#000"
              borderColor="#000"
            />
          </AdvancedMarker>
        );
      })}
    </>
  );
};


const PanToButton = ({
  setUserCenter,
}: {
  setUserCenter: React.Dispatch<React.SetStateAction<google.maps.LatLngLiteral>>;
}) => {
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
        setUserCenter(location);
      },
      () => {
        alert("Unable to retrieve your location. Please enable location access in your browser.");
      }
    );
  };

  return (
    <button
      onClick={panToCurrentLocation}
      style={{
        position: "absolute",
        top: "2.2%",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 20,
        padding: "6px 10px",
        fontSize: "18px",
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


const GMap = ({ viewerId,
                pois,
                onMarkPoiAsRead,
                selectedPoi,
                setSelectedPoi,
              }: { 
                viewerId: string | null;
                pois: Poi[];
                onMarkPoiAsRead: (poiKey: string) => void;
                selectedPoi: Poi | null;
                setSelectedPoi: (poi: Poi | null) => void;
              }) => {

  const [userCenter, setUserCenter] = useState<google.maps.LatLngLiteral>({
    lat: 41.3125903, lng: -72.9250062
  });

  const map = useMap();
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserCenter(location);
          if (map) {
            map.panTo(location);
          }
          console.log("bruh")
        },
        (error) => console.warn("Geolocation failed or was denied:", error)
      );
    }
  }, []);

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
  

  const handleMarkerClick = async (poi: Poi) => {
    const distance = getDistanceInMiles(poi.location, userCenter);
    const isNearby = distance <= THRESHOLD;

    const modifiedPoi = isNearby
      ? poi
      : { ...poi, body: '', timeLeft: '', isRead: true, tooFar: true };

    if (isNearby) {
      console.log(viewerId)
      console.log(poi.key)
      await supabase.rpc(
        "mark_note_as_read",
        {
          p_user_id: viewerId,
          p_note_id: poi.key
        }
      )
    }

    setSelectedPoi(modifiedPoi);
  };

  const handleMarkRead = () => {
    if (!selectedPoi) return;
    onMarkPoiAsRead(selectedPoi.key);
    setSelectedPoi({ ...selectedPoi, isRead: true });
  };

  return (
    <div className="mapContainer">
      <div className="mapItem">
        <Map
          defaultZoom={15}
          defaultCenter={userCenter}
          mapId="DEMO_MAP_ID"
          onCameraChanged={(ev: MapCameraChangedEvent) =>
            console.log(
              "camera changed:",
              ev.detail.center,
              "zoom:",
              ev.detail.zoom
            )
          }
        >
          <PanToButton setUserCenter={setUserCenter}/>
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
        <PoiMarkers 
          pois={pois}
          onMarkerClick={handleMarkerClick}
          userLocation={userCenter} 
        />
        </Map>

        {selectedPoi && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 30,
            }}
          >
            <Note
              author={selectedPoi.author}
              body={selectedPoi.body}
              title={selectedPoi.title}
              timeLeft={selectedPoi.timeLeft}
              isRead={selectedPoi.isRead}
              onClose={() => setSelectedPoi(null)}
              onMarkRead={handleMarkRead}
              tooFar={(selectedPoi as any).tooFar}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GMap;
