import React, { useRef, useEffect } from 'react';

/**
 * Formate une durée en secondes en format HH:MM:SS
 * @param {number} seconds - Durée en secondes
 * @returns {string} Durée formatée
 */
function formatDuration(seconds) {
  if (!seconds || seconds < 1) return '00:00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}

/**
 * Composant d'affichage du chronomètre optimisé pour éviter les re-rendus inutiles
 * 
 * @param {Object} props
 * @param {number} props.duration - Durée accumulée en secondes
 * @param {boolean} props.isRunning - Si le chronomètre est en train de tourner
 * @param {boolean} props.isPaused - Si le chronomètre est en pause
 * @param {Function} props.getElapsedSeconds - Fonction pour obtenir le temps écoulé depuis le démarrage
 * @param {Object} props.style - Styles supplémentaires à appliquer
 */
const TimerDisplay = React.memo(function TimerDisplay({ 
  duration = 0, 
  isRunning = false, 
  isPaused = false, 
  getElapsedSeconds
}) {
  const timerRef = useRef(null);
  const intervalRef = useRef(null);
  
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const updateDisplay = () => {
      if (timerRef.current) {
        let total = duration;
        if (isRunning && !isPaused && typeof getElapsedSeconds === 'function') {
          total = duration + getElapsedSeconds();
        }
        timerRef.current.textContent = formatDuration(total);
      }
    };

    updateDisplay();

    if (isRunning && !isPaused && typeof getElapsedSeconds === 'function') {
      intervalRef.current = setInterval(updateDisplay, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [duration, isRunning, isPaused, getElapsedSeconds]);
  
  return (
    <span className="timer-display-text" ref={timerRef}>
      {formatDuration(duration)}
    </span>
  );
});

export default TimerDisplay;
