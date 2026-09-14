'use client';
import puter from '@heyputer/puter.js';
export { puter };

export async function ensureSignedIn() {
  if (typeof window === 'undefined') return false;
  return puter.auth.isSignedIn();
}
export async function signIn() { return puter.auth.signIn(); }
export async function signOut() { return puter.auth.signOut(); }
export async function getUser() { return puter.auth.getUser(); }