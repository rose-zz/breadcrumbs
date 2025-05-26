import { useState, useEffect } from "react";
import SearchModal from "../components/SearchModal";
import List from "../components/List";
import Logo from "../components/Logo";
import { supabase } from "../supabase";
import Tabs from "../components/Tabs";
import Button from "../components/Button";
import TextEntry from "../components/TextEntry";
import TextNumber from "../components/TextNumber";
import "material/divider/divider";

interface User {
  id: string;
  display_name: string;
  email: string;
  avatar?: string;
  crumb_count?: number;
  hunts_completed?: number;
  rank?: string;
}

interface Friend {
  id: string;
  display_name: string;
  avatar?: string;
  crumb_count?: number;
  hunts_completed?: number;
  rank?: string;
}

interface SearchResult {
  id: string;
  display_name: string;
  email: string;
}

interface FriendRequest {
  id: string;
  display_name: string;
}

interface RequestStatus {
  userId: string;
  message: string;
  type: "success" | "error";
}

export default function Profile() {
  /* TAB LIST */

  type NavOption = "friends" | "add" | "requests";

  const [activeOption, setActiveOption] = useState<NavOption>("friends");
  const [showRank, setShowRank] = useState<Boolean>();

  const handleSelectFriend = async (friend: Friend) => {
    const stats = await fetchFriendStats(friend.id);
    if (stats) {
      setSelectedFriend({
        ...friend,
        crumb_count: stats.crumb_count,
        hunts_completed: stats.hunts_completed,
        rank: stats.rank,
      });
    } else {
      setSelectedFriend(friend);
    }
  };

  const handleSelectRequest = async (request: FriendRequest) => {
    const stats = await fetchFriendStats(request.id);
    if (stats) {
      setSelectedFriend({
        ...request,
        crumb_count: stats.crumb_count,
        hunts_completed: stats.hunts_completed,
        rank: stats.rank,
      });
    } else {
      setSelectedFriend(request);
    }
  };

  /* USER */
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);

      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !authData.user) {
        console.error("Auth error:", authError);
        return;
      }

      const { id, email } = authData.user;
      const display_name =
        authData.user.app_metadata?.display_name ||
        authData.user.user_metadata?.display_name ||
        authData.user.user_metadata?.username ||
        "User";

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("crumb_count, hunts_completed, ranks")
        .eq("id", id)
        .single();

      if (profileError || !profileData) {
        console.error("Error fetching profile data:", profileError);
        return;
      }

      const { data: huntsCompletedData, error: huntsError } =
        await supabase.rpc("count_completed_hunts", { p_user_id: id });

      if (huntsError) {
        console.error("Error fetching hunts completed:", huntsError);
      } else {
        profileData.hunts_completed = huntsCompletedData;
      }

      const avatarUrl = authData.user.user_metadata?.avatar_url || "/bread.png";
      const timestamp =
        authData.user.user_metadata?.avatar_updated_at || Date.now();
      const avatarWithTimestamp = `${avatarUrl}?t=${timestamp}`;

      console.log("AVATAR DEBUG - From metadata:", {
        rawUrl: authData.user.user_metadata?.avatar_url,
        timestamp: authData.user.user_metadata?.avatar_updated_at,
        formattedUrl: avatarWithTimestamp,
      });

      let displayRank = "BAKER";
      if (profileData.hunts_completed > 5 && profileData.hunts_completed < 15) {
        displayRank = "CHEF"
      }
      else if (profileData.hunts_completed > 15) {
        displayRank = "MASTER"
      }

      setUser({
        id,
        display_name,
        email,
        avatar: avatarWithTimestamp,
        crumb_count: profileData.crumb_count,
        hunts_completed: profileData.hunts_completed,
        rank: displayRank,
      });

      fetchFriendsList(id);
      fetchFriendRequests(id);
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsEditing(false);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          display_name: user.display_name,
        },
      });

      if (error) {
        console.error("Error updating profile:", error);
      }
    } catch (error) {
      console.error("Error in handleSaveProfile:", error);
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files || event.target.files.length === 0 || !user) {
      return;
    }

    const file = event.target.files[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}.${fileExt}`;
    const filePath = `users/${fileName}`;

    try {
      setUploadingAvatar(true);

      try {
        const { data: listData } = await supabase.storage
          .from("avatars")
          .list("users");

        const existingFiles = listData?.filter((item) =>
          item.name.startsWith(user.id)
        );

        if (existingFiles && existingFiles.length > 0) {
          for (const file of existingFiles) {
            const pathToRemove = `users/${file.name}`;

            const { data: removeData, error: removeError } =
              await supabase.storage.from("avatars").remove([pathToRemove]);

            if (removeError) {
              console.error("Error removing file:", removeError);
            } else {
            }
          }
        } else {
        }
      } catch (error) {
        console.error("Error checking/removing existing files:", error);
      }

      const getMimeType = (ext) => {
        const types = {
          png: "image/png",
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          gif: "image/gif",
          webp: "image/webp",
        };
        return types[ext.toLowerCase()] || "image/png";
      };

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
          contentType: getMimeType(fileExt),
          cacheControl: "0",
        });

      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(`${filePath}?v=${Date.now()}`);

      if (!urlData) {
        throw new Error("Failed to get public URL for uploaded file");
      }

      const avatarUrl = urlData.publicUrl;

      await supabase.auth.updateUser({
        data: {
          avatar_url: avatarUrl,
          avatar_updated_at: Date.now(),
        },
      });

      setTimeout(() => {
        const updatedUser = { ...user, avatar: avatarUrl };
        setUser(updatedUser);
      }, 500);

      alert("Avatar updated successfully!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Error uploading avatar. Please try again.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  /* FRIEND LIST */
  const [friends, setFriends] = useState<Friend[]>([]);
  const [deletingFriend, setDeletingFriend] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  /* SELECTED FREIND */

  const fetchFriendStats = async (friendId: string) => {
    try {
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("crumb_count, hunts_completed, ranks")
        .eq("id", friendId)
        .single();

      if (error) {
        console.error("Error fetching friend's profile:", error);
        return null;
      }

      let displayRank = "BAKER";
      if (profileData.hunts_completed > 5 && profileData.hunts_completed < 15) {
        displayRank = "CHEF"
      }
      else if (profileData.hunts_completed > 15) {
        displayRank = "MASTER"
      }

      const avatarPath = `users/${friendId}.png`;
      const avatarUrl = supabase.storage
        .from("avatars")
        .getPublicUrl(avatarPath).data.publicUrl;

      return {
        crumb_count: profileData.crumb_count,
        hunts_completed: profileData.hunts_completed,
        rank: displayRank,
      };
    } catch (err) {
      console.error("fetchFriendStats error:", err);
      return null;
    }
  };

  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [selectedFriendID, setSelectedFriendID] = useState<string | null>(null);

  const fetchFriendsList = async (userId: string) => {
    try {
      const { data: friendsA, error: errorA } = await supabase
        .from("friends")
        .select("user_b")
        .eq("user_a", userId);

      if (errorA) {
        console.error("Error fetching friends where user is user_a:", errorA);
        return;
      }

      const { data: friendsB, error: errorB } = await supabase
        .from("friends")
        .select("user_a")
        .eq("user_b", userId);

      if (errorB) {
        console.error("Error fetching friends where user is user_b:", errorB);
        return;
      }

      const friendIds = [
        ...friendsA.map((f) => f.user_b),
        ...friendsB.map((f) => f.user_a),
      ];

      if (friendIds.length === 0) {
        setFriends([]);
        return;
      }

      const friendDetails = await Promise.all(
        friendIds.map(async (friendId) => {
          const { data } = await supabase.rpc("get_user_display_name", {
            user_id: friendId,
          });

          return {
            id: friendId,
            display_name: data || "Unknown User",
          };
        })
      );

      setFriends(
        friendDetails.filter((friend) => friend.display_name !== "Unknown User")
      );
    } catch (error) {
      console.error("Error in fetchFriendsList:", error);
    }
  };

  const handleDeleteFriend = async (friendId: string) => {
    if (!user) return;

    try {
      setDeletingFriend(friendId);
      setDeleteError(null);

      setSelectedFriend(null);

      const friendToDelete = friends.find((friend) => friend.id === friendId);
      const friendName = friendToDelete?.display_name || "this friend";

      if (
        !window.confirm(
          `Are you sure you want to remove ${friendName} from your friends list?`
        )
      ) {
        return;
      }

      const { data: success, error } = await supabase.rpc("delete_friendship", {
        user_id_1: user.id,
        user_id_2: friendId,
      });

      if (error) {
        console.error("Error deleting friend:", error);
        setDeleteError(`Failed to remove ${friendName}. Please try again.`);
        return;
      }

      if (!success) {
        console.error("Failed to delete friendship");
        setDeleteError(`Failed to remove ${friendName}. Please try again.`);
        return;
      }

      setFriends((prev) => prev.filter((friend) => friend.id !== friendId));
    } catch (error) {
      console.error("Error in handleDeleteFriend:", error);
      setDeleteError(
        "An error occurred while removing friend. Please try again."
      );
    } finally {
      setDeletingFriend(null);
    }
  };

  /* ADD FRIEND */
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);
  const [requestStatus, setRequestStatus] = useState<RequestStatus | null>(
    null
  );

  const handleSearchUsers = async (
    searchQuery: string
  ): Promise<SearchResult[]> => {
    try {
      if (!searchQuery.trim()) {
        return [];
      }

      const { data, error } = await supabase.rpc("search_users_by_email", {
        search_email: searchQuery,
      });

      if (error) {
        console.error("Error searching users:", error);
        throw new Error(error.message);
      }

      if (!data || data.length === 0) {
        return [];
      }

      let filteredResults = data;
      if (user) {
        filteredResults = data.filter((result) => result.id !== user.id);
      }

      const friendIds = friends.map((friend) => friend.id);
      const resultsWithoutFriends = filteredResults.filter(
        (result) => !friendIds.includes(result.id)
      );

      const formattedResults = resultsWithoutFriends.map((result) => ({
        id: result.id,
        display_name: result.display_name || "Unknown User",
        email: result.email,
      }));

      return formattedResults;
    } catch (error) {
      console.error("Error in handleSearchUsers:", error);
      throw error;
    }
  };

  const handleSendFriendRequest = async () => {
    if (!user) return;
    try {
      setSendingRequest(selectedFriendID);
      setRequestStatus(null);
      setSelectedFriend(null);

      const { data: result, error } = await supabase.rpc(
        "send_friend_request",
        {
          requesting_user_id: user.id,
          requested_user_id: selectedFriendID,
        }
      );

      if (error) {
        console.error("Error sending friend request:", error);
        setRequestStatus({
          userId: selectedFriendID,
          message: "Failed to send request. Please try again.",
          type: "error",
        });
        return;
      }

      const { data: displayName } = await supabase.rpc(
        "get_user_display_name",
        {
          user_id: selectedFriendID,
        }
      );

      const friendName = displayName || "this user";

      switch (result) {
        case 0:
          setRequestStatus({
            userId: selectedFriendID,
            message: `Friend request sent to ${friendName}`,
            type: "success",
          });
          break;
        case 1:
          setRequestStatus({
            userId: selectedFriendID,
            message: `A friend request with ${friendName} already exists`,
            type: "error",
          });
          break;
        case 2:
          setRequestStatus({
            userId: selectedFriendID,
            message: `You are already friends with ${friendName}`,
            type: "error",
          });
          break;
        default:
          setRequestStatus({
            userId: selectedFriendID,
            message: "An unexpected error occurred. Please try again.",
            type: "error",
          });
      }
      setSelectedFriendID("");
    } catch (error) {
      console.error("Error in handleSendFriendRequest:", error);
      setRequestStatus({
        userId: selectedFriendID,
        message: "An error occurred. Please try again.",
        type: "error",
      });
    } finally {
      setSendingRequest(null);
    }
  };

  const isRequestPending = (userId: string) => {
    return sendingRequest === userId;
  };

  /* FRIEND REQUEST DATA */
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [acceptingRequest, setAcceptingRequest] = useState<string | null>(null);
  const [deletingRequest, setDeletingRequest] = useState<string | null>(null);
  const [requestDeleteError, setRequestDeleteError] = useState<string | null>(
    null
  );

  const fetchFriendRequests = async (userId: string) => {
    try {
      setRequestsLoading(true);

      const { data, error } = await supabase.rpc(
        "get_pending_friend_requests",
        {
          user_id: userId,
        }
      );

      if (error) {
        console.error("Error fetching friend requests:", error);
        return;
      }

      if (!data || data.length === 0) {
        setRequests([]);
        return;
      }

      const formattedRequests = data.map((request) => ({
        id: request.requesting_user_id,
        display_name: request.requesting_user_display_name || "Unknown User",
      }));

      setRequests(formattedRequests);
    } catch (error) {
      console.error("Error in fetchFriendRequests:", error);
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleAcceptRequest = async (requestingUserId: string) => {
    if (!user) return;

    try {
      setAcceptingRequest(requestingUserId);
      setSelectedFriend(null);

      const { data: success, error } = await supabase.rpc(
        "accept_friend_request",
        {
          current_user_id: user.id,
          requesting_user_id: requestingUserId,
        }
      );

      if (error) {
        console.error("Error accepting friend request:", error);
        return;
      }

      if (!success) {
        console.error("Failed to accept friend request");
        return;
      }

      const { data: displayName } = await supabase.rpc(
        "get_user_display_name",
        {
          user_id: requestingUserId,
        }
      );

      const newFriend = {
        id: requestingUserId,
        display_name: displayName || "Unknown User",
      };

      setFriends((prev) => [...prev, newFriend]);

      setRequests((prev) => prev.filter((req) => req.id !== requestingUserId));
    } catch (error) {
      console.error("Error in handleAcceptRequest:", error);
    } finally {
      setAcceptingRequest(null);
    }
  };

  const handleOptionChange = (option: NavOption) => {
    setActiveOption(option);
    setSelectedFriend(null);
    setSelectedFriendID(null);
    setRequestStatus(null);
  };

  const handleDeleteRequest = async (requestingUserId: string) => {
    if (!user) return;

    try {
      setDeletingRequest(requestingUserId);
      setRequestDeleteError(null);
      setSelectedFriend(null);

      const requestToDelete = requests.find(
        (req) => req.id === requestingUserId
      );
      const requesterName = requestToDelete?.display_name || "this user";

      if (
        !window.confirm(
          `Are you sure you want to delete the friend request from ${requesterName}?`
        )
      ) {
        return;
      }

      const { data: success, error } = await supabase.rpc(
        "delete_friend_request",
        {
          current_user_id: user.id,
          requesting_user_id: requestingUserId,
        }
      );

      if (error) {
        console.error("Error deleting friend request:", error);
        setRequestDeleteError(`Failed to delete request. Please try again.`);
        return;
      }

      if (!success) {
        console.error("Failed to delete friend request");
        setRequestDeleteError(`Failed to delete request. Please try again.`);
        return;
      }

      setRequests((prev) => prev.filter((req) => req.id !== requestingUserId));
    } catch (error) {
      console.error("Error in handleDeleteRequest:", error);
      setRequestDeleteError(
        "An error occurred while deleting request. Please try again."
      );
    } finally {
      setDeletingRequest(null);
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (!user) {
    return <div>User not found. Please log in again.</div>;
  }

  return (
    <div className="body">
      <div className="logoWrapper">
        <Logo />
      </div>
      <div className="equal-columns">
        <div className="profile-column">
          <div className="avatar-container">
            <img
              src={`${user.avatar}?t=${Date.now()}`}
              alt={user.display_name}
              className="profile-avatar"
              style={{
                objectFit: "cover",
                objectPosition: "center",
              }}
              onError={(e) => {
                console.error("Failed to load avatar:", user.avatar);
                e.currentTarget.src = "/bread.png";
              }}
            />
            <div className="avatar-upload">
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
                style={{ display: "none" }}
              />
              <label htmlFor="avatar-upload" className="avatar-upload-button">
                {uploadingAvatar ? "Uploading..." : "Change avatar"}
              </label>
            </div>
          </div>
          <h2>{user.display_name}</h2>
        </div>

        <div className="profile-column">
          {isEditing ? (
            <div>
              <TextEntry
                placeholder="name"
                type="text"
                value={user.display_name}
                onTextChange={(newText) =>
                  setUser({ ...user, display_name: newText })
                }
              ></TextEntry>
              <TextEntry
                placeholder="email"
                type="text"
                value={user.email}
                onTextChange={(newText) => setUser({ ...user, email: newText })}
              ></TextEntry>
              <Button onClick={handleSaveProfile}>Save</Button>
            </div>
          ) : (
            <>
            <h4>username</h4>
              <TextEntry
                type="text"
                disabled={true}
                value={user.display_name}
                maximum={-1}
              ></TextEntry>
              <h4>email</h4>
              <TextEntry
                type="text"
                disabled={true}
                value={user.email}
                maximum={-1}
              ></TextEntry>
            </>
          )}
        </div>

        <div className="profile-column">
          <TextNumber
            heading="crumbs collected"
            value={user.crumb_count || 0}
            color="var(--md-sys-color-secondary)"
            padding="3vw"
          />

          <TextNumber
            heading="hunts completed"
            value={user.hunts_completed || 0}
            color="var(--md-sys-color-secondary)"
            padding="3vw"
          />

          <TextNumber
            heading="rank"
            stringContent={user.rank || "Unknown"}
            color="var(--md-sys-color-tertiary)"
            padding="3vw"
            stringBool={true}
          />

          <Button color="custom" onClick={() => setShowRank(true)}>
            rank info
          </Button>
          {showRank && (
            <div className="rankInfo">
              <h4>Ranks</h4>{" "}
              <p>
                There are three ranks you can get based on the number of hunts
                completed
              </p>
              <p>Baker: 0-5 hunts</p>
              <p>Chef: 5-15 hunts</p>
              <p>Master: 15+ hunts</p>
              <md-divider></md-divider>
              <Button color="custom" onClick={() => setShowRank(false)}>
                close info
              </Button>
            </div>
          )}
        </div>

        <div className="two-columns">
          <div className="tabGroup">
            <Tabs
              activeOption={activeOption}
              onOptionChange={handleOptionChange}
            ></Tabs>
            {activeOption === "friends" && (
              <div className="tabContent">
                <div className="leftList">
                  <div className="friends-section">
                    {deleteError && (
                      <div
                        className="error-message"
                        style={{ color: "red", marginBottom: "10px" }}
                      >
                        {deleteError}
                      </div>
                    )}
                    {friends.length > 0 ? (
                      <List
                        items={friends.map((friend) => ({
                          text: friend.display_name,
                          onClickButton: () => handleSelectFriend(friend),
                          buttonText:
                            deletingFriend === friend.id
                              ? "Removing..."
                              : "Delete Friend",
                          buttonDisabled: deletingFriend !== null,
                        }))}
                      />
                    ) : (
                      <p className="profileMessage">
                        You don't have any friends yet.
                      </p>
                    )}
                  </div>
                </div>
                <div className="rightInfo">
                  {selectedFriend && (
                    <div>
                      <h4>{selectedFriend && selectedFriend.display_name}</h4>
                      <md-divider></md-divider>
                      <p>Info</p>
                      <TextNumber
                        heading="crumbs collected"
                        value={selectedFriend?.crumb_count || 0}
                        color="var(--md-sys-color-secondary)"
                        padding="2vw"
                      />

                      <TextNumber
                        heading="hunts completed"
                        value={selectedFriend?.hunts_completed || 0}
                        color="var(--md-sys-color-secondary)"
                        padding="2vw"
                        stringBool={false}
                      />

                      <TextNumber
                        heading="rank"
                        stringContent={selectedFriend?.rank || "Unknown"}
                        color="var(--md-sys-color-tertiary)"
                        padding="2vw"
                        stringBool={true}
                      />

                      <Button
                        onClick={() =>
                          selectedFriend &&
                          handleDeleteFriend(selectedFriend.id)
                        }
                        color="error"
                      >
                        delete friend
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeOption === "add" && (
              <div className="tabContent">
                <div className="addFriend">
                  <SearchModal
                    onSearch={handleSearchUsers}
                    onClickResult={setSelectedFriendID}
                    placeholderText="Search by email"
                    buttonText="Search"
                    clickText="Send friend request"
                    isRequestPending={isRequestPending}
                    requestStatus={requestStatus}
                  />
                  {selectedFriendID && (
                    <Button
                      onClick={() => {
                        handleSendFriendRequest();
                      }}
                    >
                      send request
                    </Button>
                  )}
                </div>
              </div>
            )}
            {activeOption === "requests" && (
              <div className="tabContent">
                <div className="leftList">
                  <div>
                    {requestDeleteError && (
                      <div
                        className="error-message"
                        style={{ color: "red", marginBottom: "10px" }}
                      >
                        {requestDeleteError}
                      </div>
                    )}
                    {requestsLoading ? (
                      <p>Loading requests...</p>
                    ) : requests.length > 0 ? (
                      <List
                        items={requests.map((request) => ({
                          text: request.display_name,
                          onClickButton: () => handleSelectRequest(request),
                          buttonText:
                            acceptingRequest === request.id
                              ? "Accepting..."
                              : "Accept Request",
                          buttonDisabled:
                            acceptingRequest !== null ||
                            deletingRequest !== null,
                          hasSecondButton: false,
                          secondButtonText:
                            deletingRequest === request.id
                              ? "Deleting..."
                              : "Delete Request",
                          onSecondClick: () => handleDeleteRequest(request.id),
                          secondButtonDisabled:
                            acceptingRequest !== null ||
                            deletingRequest !== null,
                        }))}
                      />
                    ) : (
                      <p className="profileMessage">
                        You don't have any pending friend requests.
                      </p>
                    )}
                  </div>
                </div>
                <div className="rightInfo">
                  {selectedFriend && (
                    <div>
                      <h4>{selectedFriend && selectedFriend.display_name}</h4>
                      <md-divider></md-divider>
                      <p>Info</p>
                      <TextNumber
                        heading="crumbs collected"
                        value={selectedFriend?.crumb_count || 0}
                        color="var(--md-sys-color-secondary)"
                        padding="2vw"
                      />

                      <TextNumber
                        heading="hunts completed"
                        value={selectedFriend?.hunts_completed || 0}
                        color="var(--md-sys-color-secondary)"
                        padding="2vw"
                        stringBool={false}
                      />

                      <TextNumber
                        heading="rank"
                        stringContent={selectedFriend?.rank || "Unknown"}
                        color="var(--md-sys-color-tertiary)"
                        padding="2vw"
                        stringBool={true}
                      />
                      <div style={{ marginBlock: "1vh" }}>
                        <Button
                          onClick={() =>
                            selectedFriend &&
                            handleAcceptRequest(selectedFriend.id)
                          }
                          color="tertiary"
                        >
                          accept request
                        </Button>
                      </div>
                      <Button
                        onClick={() =>
                          selectedFriend &&
                          handleDeleteRequest(selectedFriend.id)
                        }
                        color="error"
                      >
                        delete request
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
