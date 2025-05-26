import SegmentedButton from "../components/SegmentedButton";
import Link from "next/link";
import GMap from "../components/GMap.tsx";
import { APIProvider } from "@vis.gl/react-google-maps";
import TextNumber from "../components/TextNumber.tsx";
import Logo from "../components/Logo";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../supabase";
import FAB from "../components/FAB";

export default function Map() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [noteCount, setNoteCount] = useState(0);
  const [filterStatus, setFilterStatus] = useState("FRIENDS_ONLY");
  const [pois, setPois] = useState([]);
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);

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
    const fetchFilteredNotes = async () => {
      if (!userId) return;

      const { data, error } = await supabase.rpc("get_filtered_visible_notes", {
        viewer_id: userId,
        filter_status: filterStatus,
      });

      if (error) {
        console.error("Error fetching filtered notes:", error);
        return;
      }

      const mappedPois = await Promise.all(
        data.map(async (note) => {
          const { data: user_display_name } = await supabase.rpc(
            "get_user_display_name",
            {
              user_id: note.user_id,
            }
          );

          const author = user_display_name || "Unknown";

          const createdDate = new Date(note.created_at);
          const expiryDate = new Date(
            createdDate.getTime() + 24 * 60 * 60 * 1000
          );
          const now = new Date();
          const hoursLeft = Math.max(
            0,
            Math.floor(
              (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60)
            )
          );

          return {
            key: note.id,
            location: {
              lat: note.latitude,
              lng: note.longitude,
            },
            author,
            body: note.body,
            title: note.title,
            timeLeft: hoursLeft || "N/A",
            isRead: false,
          };
        })
      );

      setPois(mappedPois);
      setNoteCount(mappedPois.length);
    };

    fetchFilteredNotes();
  }, [userId, filterStatus]);

  if (loading) {
    return <div>Loading map...</div>;
  }

  const handleFilteredNotes = (key: string) => {
    console.log(key);
    setFilterStatus(key.toUpperCase());

    let newValue = pois.length;
    handleNewCount(newValue);

    setSelectedPoi(null);
  };

  const handleNewCount = (newValue: number) => {
    setNoteCount(newValue);
  };

  const handleMarkPoiAsRead = (poiKey: string) => {
    setPois((prev) =>
      prev.map((p) => (p.key === poiKey ? { ...p, isRead: true } : p))
    );
  };

  return (
    <div className="body">
      <div className="logoWrapper">
        <Logo />
      </div>
      <div className="mapScreen">
        <div className="section-third">
          <TextNumber heading="nearby notes" value={noteCount} />
          <SegmentedButton
            options={["friends", "private", "public"]}
            passedValues={["FRIENDS_ONLY", "USER_ONLY", "PUBLIC"]}
            onClickButton={handleFilteredNotes}
          />
        </div>

        <APIProvider
          apiKey={"AIzaSyAfGV2pCknByUu_z7J4sNWFWCtmgAEKNvo"}
          onLoad={() => console.log("Maps API has loaded.")}
        >
          <GMap
            viewerId={userId}
            pois={pois}
            onMarkPoiAsRead={handleMarkPoiAsRead}
            selectedPoi={selectedPoi}
            setSelectedPoi={setSelectedPoi}
          />
        </APIProvider>
        <div className="section-third">
          <h3>leave a crumb</h3>
          <Link href="/Note">
            <FAB iconURL="M5 19H6.425L16.2 9.225L14.775 7.8L5 17.575V19ZM3 21V16.75L16.2 3.575C16.4 3.39167 16.6208 3.25 16.8625 3.15C17.1042 3.05 17.3583 3 17.625 3C17.8917 3 18.15 3.05 18.4 3.15C18.65 3.25 18.8667 3.4 19.05 3.6L20.425 5C20.625 5.18333 20.7708 5.4 20.8625 5.65C20.9542 5.9 21 6.15 21 6.4C21 6.66667 20.9542 6.92083 20.8625 7.1625C20.7708 7.40417 20.625 7.625 20.425 7.825L7.25 21H3ZM15.475 8.525L14.775 7.8L16.2 9.225L15.475 8.525Z" />
          </Link>
        </div>
      </div>
    </div>
  );
}
