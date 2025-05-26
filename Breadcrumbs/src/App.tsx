import type { AppProps } from "next/app";
import Navbar from "../components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Global.css";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const authenticated = !!data.session;
      
      // Define public and protected pages
      const publicPages = ['/login', '/Register', '/'];
      const requireAuth = !publicPages.includes(router.pathname);
      
      if (authenticated) {
        // If user is authenticated and trying to access login/register, redirect to Map
        if (router.pathname === '/login' || router.pathname === '/Register') {
          router.push('/Map');
        }
      } else {
        // If user is not authenticated and trying to access protected page, redirect to login
        if (requireAuth) {
          router.push('/login');
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
    
    // Listen for authentication state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const authenticated = !!session;
      
      // If user logs in and is on login/register page, redirect to Map
      if (authenticated && (router.pathname === '/login' || router.pathname === '/Register')) {
        router.push('/Map');
      }
      
      // If user logs out, redirect to login page
      if (!authenticated && router.pathname !== '/login' && router.pathname !== '/Register' && router.pathname !== '/') {
        router.push('/login');
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router.pathname, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Navbar />
      <Component {...pageProps} />
    </div>
  );
}