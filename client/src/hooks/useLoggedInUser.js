import { useState, useEffect } from "react";
import api from "../services/api";

export function useLoggedInUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
   // console.log("useLoggedInUser useEffecttoken:", token);
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await api.get("/users/me");
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const clearLoggedInUser = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return { user, loading, clearLoggedInUser };
}
