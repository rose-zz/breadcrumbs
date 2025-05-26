import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "../styles/Login.module.css";
import { supabase } from "../supabase";
import Button from "../components/Button";
import TextEntry from "../components/TextEntry";

interface Styles {
  container: string;
  title: string;
  formGroup: string;
  label: string;
  input: string;
  clearButton: string;
  loginButton: string;
  registerButton: string;
  error: string;
}
const typedStyles = styles as Styles;

const Login = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (name: string, newText: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: newText,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!formData.email || !formData.password) {
        setError("Please fill in all fields");
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please try again.");
        } else if (error.message.includes("Email not confirmed")) {
          setError("Please verify your email address before logging in.");
        } else {
          setError(
            error.message || "An unexpected error occurred. Please try again."
          );
        }
        return;
      }

      console.log("Login successful:", data);
      router.push("/Map");
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(
        err.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>breadcrumbs</h1>

      {error && <div className={typedStyles.error}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <TextEntry
            onTextChange={(newText) => handleChange("email", newText)}
            height="7.5vh"
            width="18vw"
            placeholder="email"
            type="email"
            maximum={-1}
          />
        </div>

        <div className={styles.formGroup}>
          <TextEntry
            onTextChange={(newText) => handleChange("password", newText)}
            height="7.5vh"
            width="18vw"
            placeholder="password"
            type="password"
            maximum={-1}
          />
        </div>

        <Button
          type="submit"
          buttonType="outlined"
          disabled={loading}
          color="secondary"
        >
          Login
        </Button>
      </form>

      <Link href="/Register">
        <Button
          type="submit"
          buttonType="outlined"
          disabled={loading}
          color="secondary"
        >
          Register
        </Button>
      </Link>
    </div>
  );
};

export default Login;
