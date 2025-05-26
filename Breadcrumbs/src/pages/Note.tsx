import LocationSearchModal from "../components/LocationSearchModal";
import LocationCard from "../components/LocationCard";
import SegmentedButton from "../components/SegmentedButton";
import TextEntry from "../components/TextEntry";
import AddNoteGmap from "../components/AddNoteGmap.tsx";
import React, { useEffect, useState } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import { useRouter } from "next/navigation";
import { supabase } from "../supabase";
import FAB from "../components/FAB";

import Logo from "../components/Logo";

export default function Note() {
  const router = useRouter();

  enum NoteVisibility {
    FRIENDS = "FRIENDS_ONLY",
    PRIVATE = "USER_ONLY",
    PUBLIC = "PUBLIC",
  }

  const [userId, setUserId] = useState<string | null>(null);

  const [selectedCoordinates, setSelectedCoordinates] =
    useState<google.maps.LatLngLiteral | null>(null);

  const [selectedLocation, setSelectedLocation] = useState({
    id: "",
    name: "",
    address: "No address selected",
  });

  const [geocodeError, setGeocodeError] = useState(false);

  const [userInput, setUserInput] = useState("");

  const [title, setTitle] = useState("");

  const [userCenter, setUserCenter] = useState<google.maps.LatLngLiteral>({
    lat: 40.7128,
    lng: -74.006,
  });

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

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        console.warn("No user found or error:", error);
      }
    };

    fetchUser();
  }, []);

  const handleClickLocation = (result: {
    id: string;
    name: string;
    address: string;
    coordinates: google.maps.LatLngLiteral;
  }) => {
    console.log("Selected location: " + result.name);
    setSelectedLocation(result);
    setSelectedCoordinates(result.coordinates);
  };

  const handleMapClick = (location: google.maps.LatLngLiteral) => {
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ location }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const result = results[0];
        const locationData = {
          id: "0",
          name: result.formatted_address,
          address: result.formatted_address,
          coordinates: location,
        };
        setSelectedLocation(locationData);
        setSelectedCoordinates(location);
      } else {
        setGeocodeError(true);
      }
    });
  };

  const handleSearchLocation = async (searchQuery: string) => {
    if (!searchQuery || typeof window === "undefined") return [];

    return new Promise((resolve) => {
      const service = new google.maps.places.PlacesService(
        document.createElement("div")
      );

      const request = {
        query: searchQuery,
        location: userCenter || { lat: 40.7128, lng: -74.006 },
        radius: 5000,
      };

      service.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const locations = results.slice(0, 10).map((place, index) => ({
            id: place.place_id || index.toString(),
            name: place.name,
            address: place.formatted_address || "No address available",
            coordinates: {
              lat: place.geometry?.location.lat(),
              lng: place.geometry?.location.lng(),
            },
          }));
          resolve(locations);
        } else {
          setGeocodeError(true);
          resolve([]);
        }
      });
    });
  };

  const handleTextChange = (newText: string) => {
    setUserInput(newText);
  };

  const [noteVisibility, setNoteVisibility] = useState<NoteVisibility>(
    NoteVisibility.FRIENDS
  );

  const handleFilteredNotes = (key: string) => {
    switch (key) {
      case NoteVisibility.FRIENDS:
        setNoteVisibility(NoteVisibility.FRIENDS);
        console.log("case: friends");
        break;
      case NoteVisibility.PRIVATE:
        setNoteVisibility(NoteVisibility.PRIVATE);
        console.log("case: private");
        break;
      case NoteVisibility.PUBLIC:
        setNoteVisibility(NoteVisibility.PUBLIC);
        console.log("case: public");
        break;
      default:
        console.warn("Unknown visibility option selected:", key);
    }
  };

  const handleTitle = (titleText: string) => {
    setTitle(titleText);
  };

  const handleConfirm = async () => {
    if (
      userInput === "" ||
      selectedLocation.name === "" ||
      !selectedCoordinates ||
      noteVisibility === null ||
      !userId ||
      title == ""
    ) {
      alert(
        "One or more fields (text, title, location, visibility, or user) not selected"
      );
      alert(
        "One or more fields (text, title, location, visibility, or user) not selected"
      );
      return;
    }

    const noteData = {
      in_body: userInput,
      in_user_id: userId,
      in_public_status: noteVisibility,
      in_created_at: null,
      in_latitude: selectedCoordinates.lat,
      in_longitude: selectedCoordinates.lng,
      in_location: selectedLocation.address,
      in_title: title,
    };

    console.log("Note created:", noteData);

    const { noteId } = await supabase.rpc("add_note", {
      in_title: noteData.in_title,
      in_body: noteData.in_body,
      in_user_id: noteData.in_user_id,
      in_public_status: noteData.in_public_status,
      in_latitude: noteData.in_latitude,
      in_longitude: noteData.in_longitude,
      in_location: noteData.in_location,
      is_hunt_note: false,
    });

    router.push("/Map");

    return noteData;
  };

  return (
    <div className="body">
      <div className="logoWrapper">
        <Logo />
      </div>
      <div className="row">
        <div className="section">
          <APIProvider
            apiKey={"AIzaSyAfGV2pCknByUu_z7J4sNWFWCtmgAEKNvo"}
            libraries={["places"]}
            onLoad={() => console.log("Maps API has loaded.")}
          >
            <h3>pick a location</h3>
            <AddNoteGmap
              tempLocation={selectedCoordinates}
              onMapClick={handleMapClick}
            />
          </APIProvider>
        </div>
        <div className="section">
          <LocationCard
            name={selectedLocation.name}
            address={selectedLocation.address}
          />
          <LocationSearchModal
            onSearch={handleSearchLocation}
            onClickResult={handleClickLocation}
            placeholderText="Search for locations..."
            buttonText="Select"
            clickText="Select"
          />
          {geocodeError && (
            <div
              style={{
                marginTop: "8px",
                padding: "8px 12px",
                backgroundColor: "#FDECEA",
                color: "#B00020",
                border: "1px solid #B00020",
                borderRadius: "4px",
                fontSize: "14px",
                maxWidth: "300px",
              }}
            >
              No location found. Please make your search more specific, or try a
              different search.
            </div>
          )}
        </div>
      </div>
      <div className="row">
        <div className="section">
          <h3>leave a crumb</h3>

          <TextEntry
            onTextChange={handleTextChange}
            height="30vh"
            width="25vw"
            placeholder="crumb message"
            type="textarea"
          />
          <SegmentedButton
            options={["friends", "private", "public"]}
            passedValues={["FRIENDS_ONLY", "USER_ONLY", "PUBLIC"]}
            onClickButton={handleFilteredNotes}
          />
        </div>
        <div className="section">
          <h3>confirm your crumb</h3>
          <TextEntry
            onTextChange={handleTitle}
            height="7.5vh"
            width="15vw"
            placeholder="crumb title"
            type="text"
            maximum={50}
          />

          <div style={{ display: "flex", alignItems: "center" }}>
            <LocationCard
              name={selectedLocation.name}
              address={selectedLocation.address}
            />
            <FAB
              onClick={handleConfirm}
              iconURL="M9.5501 18.0001L3.8501 12.3001L5.2751 10.8751L9.5501 15.1501L18.7251 5.9751L20.1501 7.4001L9.5501 18.0001Z"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
