// components/AddCrumb.tsx
import React, { useEffect, useState } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import { supabase } from "../supabase";
import AddNoteGmap from "./AddNoteGmap";
import LocationCard from "./LocationCard";
import LocationSearchModal from "./LocationSearchModal";
import TextEntry from "./TextEntry";
import Button from "./Button";
import styles from "../styles/AddCrumb.module.css";

interface AddCrumbProps {
  onConfirm: (crumbData: any) => void;
  step: number;
  onBack: () => void;
  initialData?: any;
}

const AddCrumb: React.FC<AddCrumbProps> = ({
  onConfirm,
  step,
  onBack,
  initialData,
}) => {
  console.log(initialData);
  const [userId, setUserId] = useState<string | null>(null);
  const [geocodeError, setGeocodeError] = useState(false);
  const [title, setTitle] = useState("");
  const [userInput, setUserInput] = useState("");
  const [selectedCoordinates, setSelectedCoordinates] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [selectedLocation, setSelectedLocation] = useState({
    id: "",
    name: "",
    address: "No address selected",
  });

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.in_title || "");
      setUserInput(initialData.in_body || "");
      setSelectedCoordinates({
        lat: initialData.in_latitude,
        lng: initialData.in_longitude,
      });
      setSelectedLocation({
        id: "0",
        name: initialData.in_location,
        address: initialData.in_location,
      });
    }
  }, [initialData]);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
      else console.warn("No user found or error:", error);
    };
    fetchUser();
  }, []);

  const handleClickLocation = (result: any) => {
    setSelectedLocation(result);
    setSelectedCoordinates(result.coordinates);
  };

  const handleMapClick = (location: google.maps.LatLngLiteral) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const result = results[0];
        setSelectedLocation({
          id: "0",
          name: result.formatted_address,
          address: result.formatted_address,
          coordinates: location,
        });
        setSelectedCoordinates(location);
      } else {
        setGeocodeError(true);
      }
    });
  };

  const handleSearchLocation = (query: string) => {
    return new Promise((resolve) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: query }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const topResult = results[0];
          const location = {
            id: "0",
            name: topResult.formatted_address,
            address: topResult.formatted_address,
            coordinates: {
              lat: topResult.geometry.location.lat(),
              lng: topResult.geometry.location.lng(),
            },
          };
          resolve([location]);
        } else {
          setGeocodeError(true);
          resolve([]);
        }
      });
    });
  };

  const handleConfirm = () => {
    if (
      !userId ||
      !title ||
      !userInput ||
      !selectedCoordinates ||
      !selectedLocation.name
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    const noteData = {
      in_title: title,
      in_body: userInput,
      in_latitude: selectedCoordinates.lat,
      in_longitude: selectedCoordinates.lng,
      in_location: selectedLocation.address,
      in_public_status: "PUBLIC",
      in_user_id: userId,
      in_is_hunt_note: true,
    };

    onConfirm(noteData);
  };

  const handleBack = () => {
    onBack();
  };

  return (
    <div className={styles.crumbBody}>
      <div className={styles.crumbRow}>
        <div className={styles.crumbSection}>
          <APIProvider apiKey="AIzaSyAfGV2pCknByUu_z7J4sNWFWCtmgAEKNvo">
            <AddNoteGmap
              tempLocation={selectedCoordinates}
              onMapClick={handleMapClick}
              style="mapItemAddNoteSmall"
            />
          </APIProvider>
        </div>
        <div className={styles.crumbSection}>
          <h3>pick a location</h3>
          <LocationCard
            name={selectedLocation.name}
            address={selectedLocation.address}
            altColor={true}
          />
          <LocationSearchModal
            onSearch={handleSearchLocation}
            onClickResult={handleClickLocation}
            placeholderText="Search for locations..."
            buttonText="Select"
            clickText="Select"
          />
          {geocodeError && (
            <div className={styles.errorBox}>
              Location not found. Try again.
            </div>
          )}
        </div>
      </div>

      <div className={styles.crumbRow}>
        <div className={styles.crumbSection}>
          <h3>leave a crumb</h3>
          <TextEntry
            value={title}
            onTextChange={setTitle}
            height="8vh"
            body="Enter title (max 200 characters)"
            placeholder="title"
            maximum={50}
          />
          <TextEntry
            value={userInput}
            onTextChange={setUserInput}
            height="20vh"
            placeholder="content"
            type="textarea"
          />
        </div>
        <div className={styles.crumbSection}>
          <h3>confirm your crumb</h3>
          <LocationCard
            name={selectedLocation.name}
            address={selectedLocation.address}
            altColor={true}
          />
          <Button onClick={handleConfirm}>Next</Button>
          {step > 2 && <Button onClick={handleBack}>Back</Button>}
        </div>
      </div>
    </div>
  );
};

export default AddCrumb;
