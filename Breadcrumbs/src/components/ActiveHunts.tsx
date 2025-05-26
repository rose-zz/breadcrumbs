import React, { useEffect, useState, useCallback, useRef } from "react";
import styles from "../styles/HuntContent.module.css";
import HuntList from "./HuntList";
import { APIProvider } from "@vis.gl/react-google-maps";
import ActiveHuntsMap from "./ActiveHuntsMap";
import { useRouter } from "next/router";
import { supabase } from "../supabase";
import LocationCard from "../components/LocationCard";
import Button from "../components/Button";
import AnimModal from "../components/AnimModal";
import { AnimatePresence } from "framer-motion";

interface HuntData {
  huntId: string;
  huntName: string;
  creator: string;
  timeLeft: number;
  currentNote: number;
  totalNotes: number;
}

interface NoteData {
  id: number;
  title: string;
  body: string;
  location: string;
  latitude: number;
  longitude: number;
  hunt_id: number;
  note_order: number;
  total_notes: number;
  hunt_title: string;
}

type ActiveHuntsProps = {
  onHuntCompleted: () => void;
};

const ActiveHunts: React.FC<ActiveHuntsProps> = ({ onHuntCompleted }) => {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeHunts, setActiveHunts] = useState<HuntData[]>([]);
  const [selectedHuntID, setSelectedHuntID] = useState<string>("");
  const [currentNoteData, setCurrentNoteData] = useState<NoteData | null>(null);
  const [selectedCoordinates, setSelectedCoordinates] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [isWithinRange, setIsWithinRange] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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

  const fetchCurrentNoteData = useCallback(async () => {
    if (!selectedHuntID || !userId) {
      setCurrentNoteData(null);
      setSelectedCoordinates(null);
      return;
    }

    try {
      const { data: progressData, error: progressError } = await supabase
        .from("user_hunt_progress")
        .select("current_note")
        .eq("hunt_id", parseInt(selectedHuntID))
        .eq("user_id", userId)
        .single();

      if (progressError) {
        console.error("Error fetching hunt progress:", progressError);
        return;
      }

      if (progressData) {
        const currentNoteOrder = progressData.current_note;

        const { data: noteData, error: noteError } = await supabase.rpc(
          "get_current_hunt_note",
          {
            hunt_id_param: parseInt(selectedHuntID),
            note_order_param: currentNoteOrder,
          }
        );

        if (noteError) {
          console.error("Error fetching current hunt note:", noteError);
          return;
        }

        if (noteData && noteData.length > 0) {
          const note = noteData[0];
          setCurrentNoteData({
            id: note.note_id,
            title: note.title || "Untitled Note",
            body: note.body,
            location: note.location,
            latitude: note.latitude,
            longitude: note.longitude,
            hunt_id: parseInt(selectedHuntID),
            note_order: currentNoteOrder,
            total_notes: note.total_notes,
            hunt_title: note.hunt_title,
          });
          setSelectedCoordinates({ lat: note.latitude, lng: note.longitude });
        }
      }
    } catch (err) {
      console.error("Error in fetchCurrentNoteData:", err);
    }
  }, [selectedHuntID, userId]);

  useEffect(() => {
    const fetchActiveHunts = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase.rpc("get_user_active_hunts", {
          p_user_id: userId,
        });

        if (error) {
          console.error("Error fetching active hunts:", error);
          return;
        }

        if (data && data.length > 0) {
          // Process hunt data
          const huntsWithDetails = await Promise.all(
            data.map(async (hunt) => {
              // Get creator name
              const { data: creatorName } = await supabase.rpc(
                "get_creator_display_name",
                {
                  creator_id: hunt.creator_id,
                }
              );

              // Calculate time left (48 hours from accepted_at)
              const acceptedDate = new Date(hunt.accepted_at);
              const expiryDate = new Date(
                acceptedDate.getTime() + 48 * 60 * 60 * 1000
              );
              const now = new Date();
              const hoursLeft = Math.max(
                0,
                Math.floor(
                  (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60)
                )
              );

              return {
                huntId: hunt.hunt_id.toString(),
                huntName: hunt.hunt_title,
                creator: creatorName || "Unknown",
                timeLeft: hoursLeft,
                currentNote: hunt.current_note,
                totalNotes: hunt.total_notes || 0,
              };
            })
          );

          setActiveHunts(huntsWithDetails);

          if (huntsWithDetails.length > 0 && selectedHuntID === "") {
            setSelectedHuntID(huntsWithDetails[0].huntId);
          }
        }
      } catch (err) {
        console.error("Error in fetchActiveHunts:", err);
      }
    };

    fetchActiveHunts();
  }, [userId, selectedHuntID]);

  useEffect(() => {
    const fetchCurrentNoteData = async () => {
      if (!selectedHuntID || !userId) {
        setCurrentNoteData(null);
        setSelectedCoordinates(null);
        return;
      }

      try {
        const { data: progressData, error: progressError } = await supabase
          .from("user_hunt_progress")
          .select("current_note")
          .eq("hunt_id", parseInt(selectedHuntID))
          .eq("user_id", userId)
          .single();

        if (progressError) {
          console.error("Error fetching hunt progress:", progressError);
          return;
        }

        if (progressData) {
          const currentNoteOrder = progressData.current_note;

          const { data: noteData, error: noteError } = await supabase.rpc(
            "get_current_hunt_note",
            {
              hunt_id_param: parseInt(selectedHuntID),
              note_order_param: currentNoteOrder,
            }
          );

          if (noteError) {
            console.error("Error fetching current hunt note:", noteError);
            return;
          }

          if (noteData && noteData.length > 0) {
            const note = noteData[0];
            setCurrentNoteData({
              id: note.note_id,
              title: note.title || "Untitled Note",
              body: note.body,
              location: note.location,
              latitude: note.latitude,
              longitude: note.longitude,
              hunt_id: parseInt(selectedHuntID),
              note_order: currentNoteOrder,
              total_notes: note.total_notes,
              hunt_title: note.hunt_title,
            });

            setSelectedCoordinates({
              lat: note.latitude,
              lng: note.longitude,
            });
          }
        }
      } catch (err) {
        console.error("Error in fetchCurrentNoteData:", err);
      }
    };

    fetchCurrentNoteData();
  }, [fetchCurrentNoteData]);

  if (loading) {
    return <div>Loading active hunts...</div>;
  }

  const handleClickActiveHunt = (hunt: HuntData) => {
    setSelectedHuntID(hunt.huntId);
  };

  const handleDistanceCheck = (inRange: boolean, dist: number) => {
    setIsWithinRange(inRange);
    setDistance(dist);
  };

  const handlePickupCrumb = async () => {
    if (!currentNoteData || !userId || !isWithinRange) return;

    try {
      const huntId = currentNoteData.hunt_id;

      const { data, error } = await supabase.rpc("pick_up_crumb", {
        p_user_id: userId,
        p_hunt_id: huntId,
      });

      if (error) {
        console.error("Error picking up crumb:", error);
        return;
      }

      const huntCompleted = data;

      const close = () => {
        setModalOpen(false);
       
      };
      const open = () => {
        setModalOpen(true);
         
      };

      if (huntCompleted) {
        console.log("completed hunt!");
        open();
        setSelectedHuntID("");
      } else {
        await fetchCurrentNoteData();
      }
    } catch (err) {
      console.error("Error in handlePickupCrumb:", err);
    }
  };

  return (
    <div className={styles.container}>
      <AnimatePresence initial={false} mode="wait" onExitComplete={onHuntCompleted}>
        {modalOpen && (
          <AnimModal
            handleClose={() => setModalOpen(false)}
            text="You Completed the Hunt!!"
          />
        )}
      </AnimatePresence>
      <div className={styles.leftList}>
        <HuntList
          items={activeHunts}
          onItemClick={handleClickActiveHunt}
          selectedHuntID={selectedHuntID}
          emptyMessage="You don't have any active hunts yet."
        />
      </div>
      <div className={styles.mapForm}>
        <div className={styles.mapSection}>
          {currentNoteData && (
            <h3 className={styles.mapTitle}>
              crumb #{currentNoteData.note_order} of{" "}
              {currentNoteData.total_notes}
            </h3>
          )}
          <APIProvider
            apiKey={"AIzaSyAfGV2pCknByUu_z7J4sNWFWCtmgAEKNvo"}
            onLoad={() => console.log("Maps API has loaded.")}
          >
            <ActiveHuntsMap
              crumbLocation={selectedCoordinates}
              onDistanceCheck={handleDistanceCheck}
            />
          </APIProvider>
        </div>
        <div className={styles.detailsSection}>
          {currentNoteData ? (
            <>
              <div className={styles.locationWrapper}>
                <LocationCard
                  name={
                    currentNoteData.location
                      ? currentNoteData.location
                      : "Unknown location"
                  }
                  altColor={true}
                />
              </div>
              <div className={styles.crumbTitle}>{currentNoteData.title}</div>
              <div className={styles.noteContent}>{currentNoteData.body}</div>
              {distance !== null && (
                <div className={styles.distanceInfo}>
                  Distance: {distance.toFixed(2)} miles
                  {isWithinRange ? (
                    <span className={styles.inRange}> (In Range)</span>
                  ) : (
                    <span className={styles.outOfRange}> (Out of Range)</span>
                  )}
                </div>
              )}
              <Button
                onClick={handlePickupCrumb}
                disabled={!isWithinRange}
                color="tertiary"
              >
                {isWithinRange ? "Pick Up Crumb" : "Get Closer to Pick Up"}
              </Button>
            </>
          ) : (
            <div className={styles.emptyState}>
              {activeHunts.length > 0
                ? "Select a hunt to see details"
                : "You don't have any active hunts yet"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveHunts;
