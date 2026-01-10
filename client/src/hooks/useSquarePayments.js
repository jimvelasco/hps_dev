import { useEffect, useState } from "react";

export function useSquarePayments() {
  const [payments, setPayments] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("useSquarePayments: Checking for Square SDK...");
    console.log("window.Square:", typeof window.Square);
    console.log("VITE_SQUARE_APP_ID:", import.meta.env.VITE_SQUARE_APP_ID);
    console.log("VITE_SQUARE_LOCATION_ID:", import.meta.env.VITE_SQUARE_LOCATION_ID);
    
    if (!window.Square) {
      setError("Square SDK not loaded");
      console.error("Square SDK not found on window");
      return;
    }

    try {
      const instance = window.Square.payments(
        import.meta.env.VITE_SQUARE_APP_ID,
        import.meta.env.VITE_SQUARE_LOCATION_ID
      );

      console.log("Square payments instance created:", instance);
      setPayments(instance);
    } catch (err) {
      console.error("Error creating Square payments instance:", err);
      setError(err.message);
    }
  }, []);

  return { payments, error };
}
