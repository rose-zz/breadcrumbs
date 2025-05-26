import React from 'react';
import styles from '../styles/HuntNavBar.module.css';

type NavOption = 'available' | 'create' | 'active' | 'completed';

interface HuntNavBarProps {
  activeOption: NavOption;
  onOptionChange: (option: NavOption) => void;
}

const HuntNavBar: React.FC<HuntNavBarProps> = ({
  activeOption,
  onOptionChange
}) => {
  return (
    <div className={styles.huntNavBar}>
      <div 
        className={`${styles.navOption} ${activeOption === 'available' ? styles.active : ''}`}
        onClick={() => onOptionChange('available')}
      >
        {/* to-do checkbox */}
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
        </svg>
        <span>available hunts</span>
      </div>
      
      <div 
        className={`${styles.navOption} ${activeOption === 'create' ? styles.active : ''}`}
        onClick={() => onOptionChange('create')}
      >
        {/* create hunts pin */}
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21C12 21 20 15.25 20 9.5C20 5.91 16.41 3 12 3C7.59 3 4 5.91 4 9.5C4 15.25 12 21 12 21Z" stroke="currentColor" strokeWidth="2"/>
          <circle cx="12" cy="9.5" r="2.5" fill="currentColor"/>
        </svg>
        <span>create hunt</span>
      </div>
      
      <div 
        className={`${styles.navOption} ${activeOption === 'active' ? styles.active : ''}`}
        onClick={() => onOptionChange('active')}
      >
        {/* trail of crumbs */}
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 17H5V7H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M14 14V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M18 15V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M9 11V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span>active hunts</span>
      </div>
      
      <div 
        className={`${styles.navOption} ${activeOption === 'completed' ? styles.active : ''}`}
        onClick={() => onOptionChange('completed')}
      >
        {/* check mark */}
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>completed hunts</span>
      </div>
    </div>
  );
};

export default HuntNavBar; 