import { useEffect, useState } from "react";

export default function useDebouncePending<T>(
  value: T,
  delay: number
): [T, boolean] {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const pending = value !== debouncedValue;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return [debouncedValue, pending];
}
