import React, { useEffect, useState } from "react";
import styles from "../styles/HuntContent.module.css";
import Button from "../components/Button";
import SegmentedButton from "../components/SegmentedButton";
import TextEntry from "./TextEntry";
import AddCrumb from "./AddCrumb";
import { supabase } from "../supabase";

interface CreateHuntsProps {
  onCreateHunt: () => void;
}

const CreateHunt: React.FC<CreateHuntsProps> = ({ onCreateHunt }) => {
  const [step, setStep] = useState<number>(1);
  const [huntTitle, setHuntTitle] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [numCrumbs, setNumCrumbs] = useState<number>(3); // user chooses 3–5
  const [crumbInputs, setCrumbInputs] = useState<any[]>(Array(5).fill(null));
  const [crumbKey, setCrumbKey] = useState<number>(0);

  const filledIn: boolean[] = crumbInputs.map((crumb) => crumb !== null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        console.warn("No user found or error:", error);
      }
    };

    fetchUser();
  }, []);

  const handleCrumbNumber = (key: string) => {
    console.log(key);
    const count = parseInt(key, 10);
    setNumCrumbs(parseInt(key, 10));
    setNumCrumbs(count);
  };

  const handleSubmitHunt = async () => {
    console.log(crumbInputs);

    for (let i = 0; i < numCrumbs; i++) {
      if (crumbInputs[i] == null) {
        alert("Please fill in all crumb fields before submitting.");
        return;
      }
    }

    const noteIDs: number[] = new Array(numCrumbs);
    for (let i = 0; i < numCrumbs; i++) {
      const noteData = await supabase.rpc("add_note", {
        in_title: crumbInputs[i].in_title,
        in_body: crumbInputs[i].in_body,
        in_user_id: crumbInputs[i].in_user_id,
        in_public_status: crumbInputs[i].in_public_status,
        in_latitude: crumbInputs[i].in_latitude,
        in_longitude: crumbInputs[i].in_longitude,
        in_location: crumbInputs[i].in_location,
        is_hunt_note: crumbInputs[i].in_is_hunt_note,
      });
      noteIDs[i] = noteData.data;
    }

    console.log(huntTitle);
    console.log(userId);
    console.log(crumbInputs[0].in_public_status);
    console.log(noteIDs);
    const huntID = await supabase.rpc("create_hunt", {
      hunt_title: huntTitle,
      note_ids: noteIDs,
      in_created_by: userId,
    });

    onCreateHunt();

    return;
  };

  const renderStep = () => {
    {
    }
    if (step === 1) {
      return (
        <div className={styles.form}>
          <div className={styles.section}>
            <h3>title of hunt</h3>
            <TextEntry
              onTextChange={setHuntTitle}
              height="57px"
              body="Enter title (max 200 characters)"
              maximum={50}
            />
          </div>
          <div className={styles.section}>
            <h3>how many crumbs?</h3>
            <SegmentedButton
              options={["3", "4", "5"]}
              passedValues={["3", "4", "5"]}
              onClickButton={handleCrumbNumber}
              altColor={true}
            />
            <Button
              onClick={() => {
                if (huntTitle.trim() === "") {
                  alert("Please enter a title for your hunt.");
                  return;
                }
                setStep(2);
              }}
            >
              confirm
            </Button>
          </div>
        </div>
      );
    } else if (step >= 2 && step < 2 + numCrumbs) {
      {
      }
      const crumbIndex = step - 2;
      return (
        <div className={styles.form}>
          <AddCrumb
            key={crumbKey}
            onConfirm={(crumbData) => {
              const updatedCrumbs = [...crumbInputs];
              updatedCrumbs[crumbIndex] = crumbData;
              setCrumbInputs(updatedCrumbs);

              setStep(step + 1);
              setCrumbKey((prev) => prev + 1);
            }}
            step={step}
            onBack={() => setStep(step - 1)}
            initialData={crumbInputs[crumbIndex]}
          />
        </div>
      );
    } else if (step === 2 + numCrumbs) {
      {
      }
      return (
        <div className={styles.form}>
          <h2>confirm your hunt</h2>
          <ul>
            {crumbInputs.slice(0, numCrumbs).map((crumb, index) => (
              <li className={styles.listItem} key={index}>
                {" "}
                <strong>Crumb {index + 1}:</strong>{" "}
                {crumb ? crumb.title : "(empty crumb)"}
                <Button onClick={() => setStep(index + 2)}>Edit</Button>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: "1rem", marginInline: "3vw" }}>
            <Button onClick={handleSubmitHunt}>Submit</Button>
          </div>
        </div>
      );
    }
  };

  const renderList = () => {
    {
      return Array.from({ length: numCrumbs }, (_, index) => (
        <div
          key={index}
          className={`${styles.huntCard} ${
            step === index + 2 ? styles.huntCardSelected : ""
          }`}
          onClick={() =>
            step === 1 ? console.log("have not selected") : setStep(index + 2)
          }
        >
          Crumb {index + 1}
          {filledIn[index] && "✅"}
        </div>
      ));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftList}>{renderList()}</div>
      {renderStep()}
    </div>
  );
};

export default CreateHunt;
