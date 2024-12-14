"use client";

// Save a value to session storage
export const setSessionItem = (key: string, value: string | object | number ) => {
  const serializedValue = value === null || value === undefined ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);

  sessionStorage.setItem(key, serializedValue);
  console.log("Value set successfully in sessionStorage");
};

// Get a value from session storage
export const getSessionItem = (key: string): string | object | null => {
  const value = sessionStorage.getItem(key);
  if (value) {
    try {
      return JSON.parse(value); 
    } catch {
      return value; 
    }
  }
  return null;
};

// Remove a value from session storage
export const removeSessionItem = (key: string) => {
  sessionStorage.removeItem(key);
  console.log("Value removed from sessionStorage");
};
