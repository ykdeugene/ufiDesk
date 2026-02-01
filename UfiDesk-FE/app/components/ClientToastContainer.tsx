// components/ClientToastContainer.tsx
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";

export function ClientToastContainer() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <ToastContainer
      position="bottom-right"
      autoClose={3000}
      aria-label={undefined}
    />
  );
}
