import React, { useEffect, useState } from "react";
import styles from "../styles/HuntContent.module.css";
import HuntList from "./HuntList";
import { APIProvider } from "@vis.gl/react-google-maps";
import DisplayGMap from "./DisplayGMap";
import { useRouter } from "next/router";
import { supabase } from "../supabase";
import LocationCard from "../components/LocationCard";
import Button from "../components/Button";

interface HuntData {
  huntName: string;
  huntId: string;
  creator: string;
  timeLeft: number;
  isCreator: boolean;
}

interface NoteData {
  title: string;
  body: string;
  location: string;
  latitude: number;
  longitude: number;
  hunt_title: string;
}

interface AvailableHuntsProps {
  onAcceptHunt: (huntId: string) => void;
}

const AvailableHunts: React.FC<AvailableHuntsProps> = ({ onAcceptHunt }) => {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hunts, setHunts] = useState<HuntData[]>([]);
  const [selectedHuntID, setSelectedHuntID] = useState<string>("");
  const [noteData, setNoteData] = useState<NoteData | null>(null);
  const [isCreator, setIsCreator] = useState<boolean>(false);
  const [selectedCoordinates, setSelectedCoordinates] =
    useState<google.maps.LatLngLiteral | null>(null);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/login");
      } else {
        setUserId(data.session.user.id);
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    const fetchAvailableHunts = async () => {
      if (!userId) return;
      const getCreatorName = async (creatorId: string) => {
        try {
          const { data, error } = await supabase.rpc(
            "get_creator_display_name",
            {
              creator_id: creatorId,
            }
          );

          if (error || !data) {
            console.error("Error getting creator name:", error);
            return "Unknown";
          }

          return data;
        } catch (err) {
          console.error("Error in getCreatorName:", err);
          return "Unknown";
        }
      };
      const { data, error } = await supabase.rpc("get_active_hunts", {
        viewer_id: userId,
      });

      if (error) {
        console.error("Error fetching active hunts:", error);
        return;
      }

      if (data && data.length > 0) {
        const huntsWithDetails = await Promise.all(
          data.map(async (hunt: any) => {
            const creatorName = await getCreatorName(hunt.created_by);
            const isUserCreator = hunt.created_by === userId;

            // Calculate hours left until expiry (24h from created_at)
            const createdDate = new Date(hunt.created_at);
            const expiryDate = new Date(
              createdDate.getTime() + 48 * 60 * 60 * 1000
            );
            const now = new Date();
            const hoursLeft = Math.max(
              0,
              Math.floor(
                (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60)
              )
            );

            return {
              huntId: hunt.id.toString(),
              huntName: hunt.title,
              creator: creatorName,
              timeLeft: hoursLeft,
              isCreator: isUserCreator,
            };
          })
        );

        setHunts(huntsWithDetails);
      } else {
        setHunts([]); // no active hunts
      }
    };

    fetchAvailableHunts();
  }, [userId]);

  useEffect(() => {
    const fetchFirstCrumb = async () => {
      if (!selectedHuntID) {
        setNoteData(null);
        setSelectedCoordinates(null);
        return;
      }

      const selectedHunt = hunts.find((hunt) => hunt.huntId === selectedHuntID);
      setIsCreator(selectedHunt?.isCreator || false);

      const { data, error } = await supabase.rpc("get_first_crumb", {
        hunt_id_param: parseInt(selectedHuntID),
      });

      if (error) {
        console.error("Error fetching first crumb:", error);
        return;
      }

      if (data && data.length > 0) {
        const note = data[0];
        setNoteData({
          title: note.title || "No Title",
          body: note.body,
          location: note.location,
          latitude: note.latitude,
          longitude: note.longitude,
          hunt_title: note.hunt_title,
        });

        setSelectedCoordinates({
          lat: note.latitude,
          lng: note.longitude,
        });
      }
    };

    fetchFirstCrumb();
  }, [selectedHuntID]);

  if (loading) {
    return <div>Loading available hunts...</div>;
  }

  const handleClickAvailable = (item: HuntData) => {
    console.log("Hunt clicked:", item);
    setSelectedHuntID(item.huntId);
  };

  const acceptHunt = async () => {
    if (selectedHuntID === "" || !userId) {
      console.log("No hunt selected or user not authenticated");
      return;
    }

    if (isCreator) {
      alert("You cannot start a hunt you created.");
      return;
    }

    try {
      const { data, error } = await supabase.rpc("start_hunt", {
        p_user_id: userId,
        p_hunt_id: parseInt(selectedHuntID),
      });

      if (error) {
        console.error("Error accepting hunt:", error);
        return;
      }

      if (data) {
        console.log("Hunt accepted successfully");
        onAcceptHunt(selectedHuntID);
      } else {
        console.log("Hunt already in progress");
        onAcceptHunt(selectedHuntID);
      }
    } catch (err) {
      console.error("Error in acceptHunt:", err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftList}>
        <HuntList
          items={hunts.length > 0 ? hunts : []}
          onItemClick={handleClickAvailable}
          selectedHuntID={selectedHuntID}
          emptyMessage="No available hunts found."
        />
      </div>
      <div className={styles.mapForm}>
        <div className={styles.mapSection}>
          <h3 className={styles.mapTitle}>first crumb location</h3>
          <APIProvider
            apiKey={"AIzaSyAfGV2pCknByUu_z7J4sNWFWCtmgAEKNvo"}
            onLoad={() => console.log("Maps API has loaded.")}
          >
            <DisplayGMap crumbLocation={selectedCoordinates} />
          </APIProvider>
        </div>
        <div className={styles.detailsSection}>
          {noteData ? (
            <>
              <div className={styles.locationWrapper}>
                <LocationCard
                  name={
                    noteData.location ? noteData.location : "Unknown location"
                  }
                  altColor={true}
                />
              </div>
              <div className={styles.crumbTitle}>{noteData.title}</div>
              <div className={styles.noteContent}>{noteData.body}</div>
              <Button onClick={acceptHunt}>Start Hunt</Button>
            </>
          ) : (
            <div className={styles.emptyState}>
              Select a hunt to see details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailableHunts;
