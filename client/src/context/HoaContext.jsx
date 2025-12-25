import React, { createContext, useState, useContext, useCallback } from "react";
import axios from "../services/api";

const HoaContext = createContext();

export function HoaProvider({ children }) {
  const [hoa, setHoa] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHoaById = useCallback(async (hoaId) => {
    setLoading(true);
    setError(null);
   //console.log("fetchHoaById hoacontext Fetching HOA with ID:", hoaId);
   // const url = "/hoas/";
     const url = `/hoas/${hoaId}`;
  // console.log("URL:", url);
    try {
        const response = await axios.get(url);
      setHoa(response.data);
      return response.data;
    } catch (err) {
      console.error("Error fetching HOA data:", err);
      // console.log(`/hoas/${hoaId}`);
      
      setError(err.message);
      setHoa(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <HoaContext.Provider value={{ hoa, loading, error, fetchHoaById }}>
      {children}
    </HoaContext.Provider>
  );
}

export function useHoa() {
  const context = useContext(HoaContext);
  if (!context) {
    throw new Error("useHoa must be used within HoaProvider");
  }
  return context;
}
