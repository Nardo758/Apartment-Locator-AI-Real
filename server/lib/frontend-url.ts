export function getFrontendUrl(): string {
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL;
  }
  const domain = process.env.REPLIT_DOMAINS?.split(',')[0];
  if (domain) {
    return `https://${domain}`;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("FRONTEND_URL must be set in production");
  }
  return "http://localhost:5000";
}
