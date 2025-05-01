import styles from './ServerStartupOverlay.module.css';

export default function ServerStartupOverlay() {
  return (
    <div className={styles.serverOverlay}>
      <div className={styles.serverOverlayContent}>
        <h1>Server is starting...</h1>
        <p>This may take about 5 minutes. Please be patient.</p>
      </div>
    </div>
  );
}
