// src/utils/geolocation.ts
/**
 * Helper to get the user's current GPS coordinates using the browser Geolocation API.
 * Returns a Promise that resolves with an object containing latitude and longitude.
 */
export function getCurrentPosition(): Promise<{ latitude: number; longitude: number }>
{
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
}
