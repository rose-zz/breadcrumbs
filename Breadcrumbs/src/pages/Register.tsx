import React, { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/Login.module.css";
import { supabase } from "../supabase";
import Button from "../components/Button";
import TextEntry from "../components/TextEntry";

const Register = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
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
      if (!formData.username || !formData.email || !formData.password) {
        setError("Please fill in all fields");
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long");
        setLoading(false);
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            display_name: formData.username,
          },
        },
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          setError(
            "This email is already registered. Please use a different email or try logging in."
          );
        } else if (authError.message.includes("valid email")) {
          setError("Please enter a valid email address.");
        } else if (authError.message.includes("password")) {
          setError("Password is too weak. Please use a stronger password.");
        } else {
          setError(
            authError.message || "Failed to register. Please try again."
          );
        }
        setLoading(false);
        return;
      }

      if (authData && authData.user) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: { display_name: formData.username },
        });

        if (updateError) {
          console.error("Failed to update display name:", updateError);
        }
      }

      console.log("Registration successful:", authData);
      setError("");
      router.push("/login");
    } catch (err: any) {
      console.error("Registration failed:", err);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>breadcrumbs</h1>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <TextEntry
            onTextChange={(newText) => handleChange("username", newText)}
            height="7.5vh"
            width="18vw"
            placeholder="username"
            type="text"
            maximum={30}
          />
        </div>

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
          color="tertiary"
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Confirm"}
        </Button>
      </form>
    </div>
  );
};

export default Register;
