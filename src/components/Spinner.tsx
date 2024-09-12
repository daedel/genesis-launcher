// Spinner.js
import { useEffect, useState } from 'react';
import { useLoading } from '../contexts/Loading';
import './Spinner.css';

const Spinner = () => {
  const { isLoading } = useLoading();
  const [isVisible, setIsVisible] = useState(false);  // Kontroluje obecność w DOM
  const [isFadingOut, setIsFadingOut] = useState(false);  // Kontroluje efekt fade-out

  useEffect(() => {
    if (isLoading) {
      setIsVisible(true);  // Pokazuje spinner i uruchamia fade-in
      setIsFadingOut(false);  // Resetujemy stan fade-out
    } else if (isVisible) {
      setIsFadingOut(true);  // Uruchamiamy fade-out
    }
  }, [isLoading, isVisible]);

  if (!isLoading) {
    return null;
  }

  return (
    <div className={`spinner ${isFadingOut ? 'fade-out' : 'fade-in'}`}>
      <i className="fas fa-cog fa-spin"></i>
      {/* Można tu dodać tekst np. 'Ładowanie...' */}
    </div>
  );
};

export default Spinner;
