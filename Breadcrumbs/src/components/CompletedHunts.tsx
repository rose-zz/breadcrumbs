import React, { useState, useEffect } from "react";
import styles from "../styles/HuntContent.module.css";
import { supabase } from "../supabase";
import HuntList from "./HuntList";
import LocationCard from "../components/LocationCard";

interface CompletedHuntData {
  huntName: string;
  huntId: string;
  creator: string;
  creatorId: string;
  createdAt: string;
  completedAt: string;
  isCreatedByUser: boolean;
  notes?: HuntNoteData[];
}

// Matches the exact return type of get_hunts_notes
interface HuntNoteData {
  hunt_id: number;
  note_id: number;
  note_order: number;
  note_title: string;
  note_body: string;
  note_location: string;
  note_long: number;
  note_lat: number;
}

// Interface for formatted note display
interface NoteData {
  noteId: string;
  title: string;
  content: string;
  location: string;
  coordinates: string;
  orderNumber: number;
}

const CompletedHunts: React.FC = () => {
  const [completedHunts, setCompletedHunts] = useState<CompletedHuntData[]>([]);
  const [selectedHuntID, setSelectedHuntID] = useState<string>("");
  const [huntNotes, setHuntNotes] = useState<NoteData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
        return data.user.id;
      }
      return null;
    };

    const fetchCompletedHunts = async (currentUserId: string | null) => {
      if (!currentUserId) return;

      try {
        const { data, error } = await supabase.rpc("get_completed_hunts", {
          viewer_id: currentUserId,
        });

        if (error) {
          console.error("Error fetching completed hunts:", error);
          return;
        }

        if (data) {
          const formattedData: CompletedHuntData[] = await Promise.all(
            data.map(async (item: any) => {
              let creatorName = "Unknown User";

              if (
                !(
                  item.visibility === "private" &&
                  item.created_by === currentUserId
                )
              ) {
                const { data: nameData, error: nameError } = await supabase.rpc(
                  "get_user_display_name",
                  { user_id: item.created_by }
                );

                if (!nameError && nameData) {
                  creatorName = nameData;
                }
              } else {
                creatorName = "Unknown User";
              }

              return {
                huntName: item.title,
                huntId: String(item.hunt_id),
                creator: creatorName,
                creatorId: item.created_by,
                createdAt: new Date(item.accepted_at).toLocaleDateString(),
                completedAt: new Date(item.completed_at).toLocaleDateString(),
                isCreatedByUser: item.created_by === currentUserId,
              };
            })
          );

          setCompletedHunts(formattedData);

          if (formattedData.length > 0) {
            setSelectedHuntID(formattedData[0].huntId);
            fetchHuntNotes(formattedData[0].huntId);
            
            formattedData.forEach(hunt => {
              if (hunt.huntId !== formattedData[0].huntId) {
                fetchCreatorInfo(hunt.huntId);
              }
            });
          }
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const init = async () => {
      const currentUserId = await getCurrentUser();
      fetchCompletedHunts(currentUserId);
    };

    init();
  }, []);

  const fetchCreatorInfo = async (huntId: string) => {
    try {
      const { data: huntInfo, error: huntInfoError } = await supabase.rpc(
        "get_hunt_info",
        { hunt_id: parseInt(huntId) }
      );

      if (huntInfoError) {
        console.error("Error fetching hunt info:", huntInfoError);
        return;
      } 
      
      if (huntInfo && Array.isArray(huntInfo) && huntInfo.length > 0) {
        const creatorId = huntInfo[0].created_by;

        const { data: nameData, error: nameError } = await supabase.rpc(
          "get_user_display_name",
          { user_id: creatorId }
        );

        if (!nameError && nameData) {
          setCompletedHunts((prev) =>
            prev.map((hunt) => {
              if (hunt.huntId === huntId) {
                return {
                  ...hunt,
                  creator: nameData,
                  creatorId: creatorId,
                  isCreatedByUser: creatorId === userId,
                };
              }
              return hunt;
            })
          );
        }
      }
    } catch (error) {
      console.error("Error fetching creator info:", error);
    }
  };

  const fetchHuntNotes = async (huntId: string) => {
    try {
      await fetchCreatorInfo(huntId);

      const { data, error } = await supabase.rpc("get_hunts_notes", {
        id_hunt: huntId,
      });

      if (error) {
        console.error("Error fetching hunt notes:", error);
        return;
      }

      if (data) {
        const formattedNotes = data.map((note: any) => ({
          noteId: note.note_id.toString(),
          title: note.note_title || "No Title",
          content: note.note_body || "",
          location: note.note_location || "No Location",
          coordinates: `${note.note_lat}, ${note.note_long}`,
          orderNumber: note.note_order,
        }));

        setHuntNotes(formattedNotes);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleHuntClick = (hunt: CompletedHuntData) => {
    setSelectedHuntID(hunt.huntId);
    fetchHuntNotes(hunt.huntId);
  };

  const adaptedHunts = completedHunts.map((hunt) => ({
    huntName: hunt.huntName,
    huntId: hunt.huntId,
    creator: hunt.creator,
    timeLeft: 0,
  }));

  if (isLoading) {
    return <div className={styles.completedHunts}>Loading...</div>;
  }

  if (completedHunts.length === 0) {
    return (
      <div className={styles.completedHunts}>
        <h2>Your completed hunts</h2>
        <p>You haven't completed any hunts yet.</p>
      </div>
    );
  }

  const selectedHunt = completedHunts.find(
    (hunt) => hunt.huntId === selectedHuntID
  );

  return (
    <div className={styles.container}>
      <div className={styles.leftList}>
        <HuntList
          items={adaptedHunts}
          onItemClick={(item) => {
            const originalHunt = completedHunts.find(
              (h) => h.huntId === item.huntId
            );
            if (originalHunt) {
              handleHuntClick(originalHunt);
            }
          }}
          selectedHuntID={selectedHuntID}
        />
      </div>
      <div className={styles.form}>
        {selectedHuntID && (
          <div className={styles.completedHuntDetails}>
            {/* Hunt Info Header */}
            <div className={styles.huntHeader}>
              <div className={styles.huntCreator}>
                <div>
                  <b>creator: </b>
                  <span key="creator">{selectedHunt?.creator}</span>
                </div>
                <div>
                  <b>date: </b>
                  <span key="completedAt">
                    {selectedHunt?.completedAt !== "12/31/1969"
                      ? selectedHunt?.completedAt
                      : "Unknown date"}
                  </span>
                </div>
              </div>
            </div>

            {/* Grid of crumb notes */}
            <div className={styles.crumbContainer}>
              {huntNotes.map((note, index) => (
                <div key={note.noteId} className={styles.crumbCard}>
                  <h3>crumb #{index + 1}</h3>
                  <LocationCard name={note.location} altColor={false} />
                  <div className={styles.crumbTitle}>{note.title}</div>
                  <div className={styles.noteContent}>{note.content}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletedHunts;
