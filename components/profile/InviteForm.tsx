"use client";

import { Copy, Loader2, Mail, Send } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ROLE_LABELS_DA, inviteShareUrl } from "@/lib/family";
import type { FamilyInvite, FamilyRole } from "@/lib/types";

type Props = {
  familyName: string;
  onSubmit: (input: {
    invitedEmail?: string;
    invitedName?: string;
    role: FamilyRole;
    message?: string;
  }) => Promise<FamilyInvite>;
};

export function InviteForm({ familyName, onSubmit }: Props) {
  const [invitedName, setInvitedName] = useState("");
  const [invitedEmail, setInvitedEmail] = useState("");
  const [role, setRole] = useState<FamilyRole>("family");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setError("");
    try {
      const invite = await onSubmit({
        invitedName: invitedName || undefined,
        invitedEmail: invitedEmail || undefined,
        role,
        message: message || undefined
      });
      const origin = typeof window === "undefined" ? "" : window.location.origin;
      const url = inviteShareUrl(origin, invite.token);
      setShareUrl(url);
      setStatus("done");
    } catch (caught) {
      setStatus("error");
      setError(caught instanceof Error ? caught.message : "Kunne ikke oprette invitationen.");
    }
  }

  if (status === "done" && shareUrl) {
    return (
      <div className="rounded-card bg-linen p-5 ring-1 ring-oat">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-rust">Invitation klar</p>
        <h3 className="mt-1 font-display text-xl font-semibold text-ink">
          Del linket med {invitedName || invitedEmail || "din familie"}
        </h3>
        <p className="mt-2 text-sm leading-6 text-ink/70">
          Vi har sendt en e-mail (hvis adressen blev udfyldt). Du kan også dele linket selv —
          det virker i 14 dage.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            readOnly
            value={shareUrl}
            className="focus-ring h-11 w-full rounded-xl bg-white px-3 text-sm font-semibold ring-1 ring-oat"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
              } catch {
                /* clipboard not available */
              }
            }}
          >
            <Copy size={15} aria-hidden="true" />
            {copied ? "Kopieret!" : "Kopiér"}
          </Button>
        </div>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setShareUrl(null);
            setInvitedName("");
            setInvitedEmail("");
            setMessage("");
          }}
          className="focus-ring mt-3 text-sm font-bold text-rust underline-offset-4 hover:underline"
        >
          Inviter en til
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-card bg-linen p-5 ring-1 ring-oat">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-rust">Inviter til {familyName}</p>
      <h3 className="mt-1 font-display text-xl font-semibold text-ink">
        Tilføj bedsteforældre, dagplejer eller resten af familien
      </h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-ink/60">
            Navn
          </span>
          <input
            value={invitedName}
            onChange={(event) => setInvitedName(event.target.value)}
            placeholder="Mormor"
            className="focus-ring h-11 w-full rounded-xl bg-white px-3 text-sm font-semibold ring-1 ring-oat"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-ink/60">
            E-mail
          </span>
          <span className="flex h-11 items-center gap-2 rounded-xl bg-white px-3 ring-1 ring-oat">
            <Mail size={15} className="text-ink/45" aria-hidden="true" />
            <input
              type="email"
              value={invitedEmail}
              onChange={(event) => setInvitedEmail(event.target.value)}
              placeholder="mormor@example.dk"
              className="w-full bg-transparent text-sm font-semibold outline-none"
            />
          </span>
        </label>
      </div>

      <fieldset className="mt-3">
        <legend className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-ink/60">
          Rolle
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(ROLE_LABELS_DA) as FamilyRole[])
            .filter((roleKey) => roleKey !== "owner")
            .map((roleKey) => (
              <button
                key={roleKey}
                type="button"
                onClick={() => setRole(roleKey)}
                className={`focus-ring rounded-xl px-2 py-2 text-xs font-bold ring-1 transition ${
                  role === roleKey
                    ? "bg-moss text-white ring-moss"
                    : "bg-white text-ink/70 ring-oat hover:bg-linen"
                }`}
              >
                {ROLE_LABELS_DA[roleKey]}
              </button>
            ))}
        </div>
      </fieldset>

      <label className="mt-3 block">
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-ink/60">
          Personlig hilsen (valgfri)
        </span>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={3}
          placeholder="Velkommen ind, mormor — så kan du følge med på Astas hverdag."
          className="focus-ring w-full rounded-xl bg-white p-3 text-sm font-semibold ring-1 ring-oat"
        />
      </label>

      <Button type="submit" className="mt-4" disabled={status === "saving"}>
        {status === "saving" ? (
          <>
            <Loader2 size={15} className="animate-spin" aria-hidden="true" />
            Sender invitation...
          </>
        ) : (
          <>
            <Send size={15} aria-hidden="true" />
            Send invitation
          </>
        )}
      </Button>

      {status === "error" ? (
        <p className="mt-3 rounded-xl bg-rust/10 p-3 text-sm font-semibold text-rust">{error}</p>
      ) : null}
    </form>
  );
}
