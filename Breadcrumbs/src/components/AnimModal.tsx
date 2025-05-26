import { motion } from "framer-motion";
import Backdrop from "../components/Backdrop";
import styles from "../styles/Animation.module.css";
import Button from "../components/Button";

const dropIn = {
  hidden: { y: "-100vh" },
  visible: { y: "0vh" },
  exit: { y: "100vh" },
};

const AnimModal = ({ handleClose, text }) => {
  return (
    <Backdrop onClick={handleClose}>
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className={styles.modal}
        variants={dropIn}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {text}
        <Button onClick={handleClose}>Close</Button>
      </motion.div>
    </Backdrop>
  );
};

export default AnimModal;
