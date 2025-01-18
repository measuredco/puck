import { useRef, useEffect } from "react";

export function useOnValueChange<T>(
  value: T,
  onChange: (value: T, oldValue: T) => void,
  compare: (value: T, oldValue: T) => boolean = Object.is,
  deps: any[] = []
) {
  const tracked = useRef<T>(value);

  useEffect(() => {
    const oldValue = tracked.current;

    if (!compare(value, oldValue)) {
      tracked.current = value;
      onChange(value, oldValue);
    }
  }, [onChange, compare, value, ...deps]);
}
