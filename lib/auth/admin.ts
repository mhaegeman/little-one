// Admin allowlist driven by the ADMIN_EMAILS env var (comma-separated).
// There is no admin role in the database yet — this lets us gate /admin/*
// and any admin-only server action without a schema change.

type MaybeUser = { email?: string | null } | null | undefined;

function getAdminEmails(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isAdminUser(user: MaybeUser): boolean {
  const email = user?.email?.toLowerCase();
  if (!email) return false;
  const allowed = getAdminEmails();
  if (allowed.size === 0) return false;
  return allowed.has(email);
}
