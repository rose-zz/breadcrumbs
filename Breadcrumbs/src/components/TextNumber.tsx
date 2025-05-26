import styles from "../styles/TextNumber.module.css";

interface Props {
  heading: string;
  value?: number;
  color?: string;
  padding?: string;
  string?: boolean;
  stringContent?: string;
}

const TextNumber = ({
  heading,
  value,
  color,
  padding = "0vw",
  stringBool = false,
  stringContent,
}: Props) => {
  return (
    <div className={styles.textNumber}>
      <h4>{heading}</h4>
      <div
        className={styles.box}
        style={{ borderColor: color, paddingInline: padding }}
      >
        {stringBool ? stringContent : value}
      </div>
    </div>
  );
};

export default TextNumber;
