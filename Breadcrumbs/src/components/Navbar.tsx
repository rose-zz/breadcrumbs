import Link from "next/link";
import styles from "../styles/Navbar.module.css";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import LogoutButton from "./LogoutButton";

const Navbar = () => {
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
    <div className={styles.navbarContainer}>
      {/* Navigation */}
      <nav className={styles.navbar}>
        <div>
          <Link href="/" className={styles.navItem}>
            Home
          </Link>
          {isAuthenticated && (
            <>
              <Link href="/Profile" className={styles.navItem}>
                Profile
              </Link>
              <Link href="/Note" className={styles.navItem}>
                Note
              </Link>
              <Link href="/Map" className={styles.navItem}>
                Map
              </Link>
              <Link href="/ScavengerHunt" className={styles.navItem}>
                Scavenger Hunt
              </Link>
            </>
          )}
        </div>
        {isAuthenticated && <LogoutButton />}
      </nav>

    </div>
  );
};

export default Navbar;
