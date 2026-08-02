// Generates a 4-digit numeric code as a string (e.g. "0842").
// Used for both registration verification and password reset.

export const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};