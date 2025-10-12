/**
 * Admin utility functions for role-based access control
 */

/**
 * Check if a user email is in the admin list
 * @param email - User email to check
 * @returns boolean indicating if user is admin
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  return adminEmails.includes(email);
}

/**
 * Get list of admin emails from environment
 * @returns Array of admin email addresses
 */
export function getAdminEmails(): string[] {
  return process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
}