import Link from "next/link";
import Logo from "../components/Logo";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsAuthenticated(!!session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f9faef",
      }}
    >
      <div className="body">
        <div className="indexWrapper">
          <div className="indexSection">
            <Logo />
            <Link href="/login">
              {!isAuthenticated && (
                <button
                  className="btn btn-lg px-5 py-4"
                  style={{
                    backgroundColor: "#6B5B95",
                    color: "white",
                    borderRadius: "50px",
                    fontWeight: "bolder",
                    border: "none",
                  }}
                >
                  <Image
                    src="/profile.png"
                    alt="Profile icon"
                    width={40}
                    height={40}
                    style={{ marginRight: "8px" }}
                  />
                  Login
                </button>
              )}
            </Link>
          </div>
          <div className="indexSection">
            <h3>guide</h3>
            <ol>
              <li>make an account and log in</li>
              <li>check out the map for notes people left</li>
              <li>you can only read the notes close enough to you</li>
              <li>leave a note - pick location, text, and visibility</li>
              <li>add friends in profile!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
