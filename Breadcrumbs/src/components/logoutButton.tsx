import React from "react";
import { useRouter } from "next/router";
import { supabase } from "../supabase";
import Button from "../components/Button";

const LogoutButton = () => {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleLogout} disabled={loading} color="tertiary">
      {loading ? "Logging out..." : "Logout"}
    </Button>
  );
};

export default LogoutButton;
