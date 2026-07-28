// Wraps bcrypt so the rest of the app never touches raw bcrypt calls
// directly — just hashPassword() and comparePassword().

import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const hashPassword = async (plainPassword) => {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
};

export const comparePassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};