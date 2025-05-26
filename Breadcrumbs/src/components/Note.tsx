import React from "react";
import styles from "../styles/Note.module.css";

type NoteProps = {
  author: string;
  body: string;
  timeLeft: string;
  onClose: () => void;
  onMarkRead: () => void;
  isRead: boolean;
  tooFar?: boolean;
  title: string;
};

const Note: React.FC<NoteProps> = ({
  author,
  body,
  timeLeft,
  onClose,
  onMarkRead,
  isRead,
  tooFar = false,
  title,
}) => {
  return (
    <div
      className={`${styles.container} ${tooFar ? styles.errorContainer : ""}`}
    >
      <div className={styles.header}>
        <div className={styles.title}>
          {title ? title : <em>Untitled Note</em>}
        </div>
        <button className={styles.closeButton} onClick={onClose}>
          x
        </button>
      </div>

      <input type="text" value={author} readOnly className={styles.author} />
      <textarea
        value={tooFar ? "Note is too far away!" : body}
        readOnly
        className={`${styles.body} ${tooFar ? styles.italicBody : ""}`}
      />
      {!tooFar && (
        <div className={styles.footer}>
          <p className={styles.collected}>
            <span>✓</span>
            <span>Collected</span>
          </p>
          <div className={styles.timeLeft}>
            {timeLeft + " hr"}
            <br />
            left
          </div>
        </div>
      )}
    </div>
  );
};

export default Note;
