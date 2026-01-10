import { useEffect, useRef, useState } from "react";

export function useSquareCard(payments) {
  const cardRef = useRef(null);
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!payments) {
      console.log("useSquareCard: No payments instance yet");
      return;
    }

    let mounted = true;
    let cardInstance = null;

    async function initCard() {
      try {
        console.log("useSquareCard: Initializing card...");
        cardInstance = await payments.card();
        console.log("useSquareCard: Card instance created, attaching to ref...");
        
        if (!cardRef.current) {
          console.log("useSquareCard: Ref not ready, waiting for DOM...");
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        if (!cardRef.current) {
          throw new Error("Card container element not found in DOM");
        }

        await cardInstance.attach(cardRef.current);

        if (mounted) {
          console.log("useSquareCard: Card attached successfully");
          setCard(cardInstance);
          setLoading(false);
        }
      } catch (err) {
        console.error("useSquareCard: Error initializing card:", err);
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    initCard();

    return () => {
      mounted = false;
      if (cardInstance) {
        console.log("useSquareCard: Cleaning up card");
        cardInstance.destroy?.();
      }
    };
  }, [payments]);

  const tokenize = async () => {
    if (!card) throw new Error("Card not ready");

    const result = await card.tokenize();

    if (result.status !== "OK") {
      throw new Error(result.errors?.[0]?.message || "Tokenization failed");
    }

    return result.token;
  };

  return {
    cardRef,
    tokenize,
    loading,
    error
  };
}
