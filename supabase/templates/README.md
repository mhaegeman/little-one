# Supabase email templates

These templates are designed for the Lille Liv magic-link flow. Supabase does
not currently let us version templates from code, so they live here as a
canonical copy and must be pasted into the dashboard.

## Where to install

1. Open Supabase Dashboard → **Authentication** → **Email Templates**.
2. Pick **Magic Link**.
3. Replace the body with the contents of `magic-link.html` and set the subject
   to:

   ```
   Velkommen til {{ .Data.app_name }}, {{ .Data.display_name }}
   ```

4. Save.

## Variables used

The login form (`components/auth/LoginForm.tsx`) calls
`supabase.auth.signInWithOtp({ email, options: { data } })` and forwards the
following structured data to the template via `{{ .Data.* }}`:

| Field                | Source                                 |
| -------------------- | -------------------------------------- |
| `app_name`           | Constant — `"Lille Liv"`               |
| `app_tagline`        | Localized tagline (`da`/`en`)          |
| `display_name`       | Optional name typed by the user        |
| `preferred_role`     | parent / family / caregiver            |
| `preferred_locale`   | `da` (default) or `en`                 |
| `invited_by_name`    | Inviter's display name (invite flow)   |
| `family_name`        | Family being joined (invite flow)      |
| `invite_message`     | Personal note from the inviter         |

When any of the invite fields are present the template flips into an "invited
to a family" layout. Otherwise it shows the standard sign-in copy.

## Local testing

Without the dashboard template installed Supabase still sends a default magic
link, so the app works — only the visual branding is missing. The local
Supabase CLI mailbox is the easiest place to preview the new template.
