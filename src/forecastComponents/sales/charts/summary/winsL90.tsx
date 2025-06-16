import { useState, useEffect } from "react";

export default function WinsL90() {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <div>Loading ARR data...</div>;
  }

  return (
    <div className="border border-primary-3 p-4 rounded-md bg-primary-5 w-7/12">
      <h3 className="text-primary-2 font-semibold mb-2">Wins L90</h3>
      <p className="text-primary-1 text-3xl font-bold">{`30`}</p>
    </div>
  );
}