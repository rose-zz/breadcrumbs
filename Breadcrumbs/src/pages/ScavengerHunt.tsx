import React, { useState } from "react";
import Logo from "../components/Logo";
import HuntNavBar from "../components/HuntNavBar";
import HuntContent from "../components/HuntContent";
import styles from "../styles/ScavengerHunt.module.css";

type NavOption = "available" | "create" | "active" | "completed";

const ScavengerHunt: React.FC = () => {
  const [activeOption, setActiveOption] = useState<NavOption>("available");

  const handleOptionChange = (option: NavOption) => {
    setActiveOption(option);
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {/* Logo below navbar */}
        <div className={styles.logoContainer}>
          <Logo />
        </div>

        <HuntNavBar
          activeOption={activeOption}
          onOptionChange={handleOptionChange}
        />

        <HuntContent
          activeOption={activeOption}
          onOptionChange={handleOptionChange}
        />
      </main>
    </div>
  );
};

export default ScavengerHunt;
