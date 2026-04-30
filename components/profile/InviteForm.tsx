"use client";

import { CircleNotch, Copy, EnvelopeSimple, PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr";
import type { FormEvent } from "react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ROLE_LABELS_EN, inviteShareUrl } from "@/lib/family";
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
  const t = useTranslations("inviteForm");
  const tRoles = useTranslations("roles");
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
      setError(caught instanceof Error ? caught.message : t("error"));
    }
  }

  if (status === "done" && shareUrl) {
    return (
      <div className="rounded-card bg-sunken p-4 ring-1 ring-hairline">
        <p className="text-2xs font-bold uppercase tracking-[0.14em] text-peach-300">
          {t("doneEyebrow")}
        </p>
        <h3 className="mt-0.5 font-display text-base font-semibold text-ink">
          {t("doneTitle", { recipient: invitedName || invitedEmail || familyName })}
        </h3>
        <p className="mt-1.5 text-sm leading-6 text-muted">
          {t("doneBody")}
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Input readOnly value={shareUrl} />
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
            <Copy size={13} weight="bold" aria-hidden="true" />
            {copied ? t("copied") : t("copy")}
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
          className="focus-ring mt-3 text-sm font-semibold text-peach-ink underline-offset-4 hover:underline"
        >
          {t("inviteAnother")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-card bg-sunken p-4 ring-1 ring-hairline">
      <p className="text-2xs font-bold uppercase tracking-[0.14em] text-peach-300">
        {t("eyebrow", { name: familyName })}
      </p>
      <h3 className="mt-0.5 font-display text-base font-semibold text-ink">
        {t("title")}
      </h3>
      <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-2xs font-bold uppercase tracking-[0.12em] text-muted">
            {t("nameLabel")}
          </span>
          <Input
            value={invitedName}
            onChange={(event) => setInvitedName(event.target.value)}
            placeholder={t("namePlaceholder")}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-2xs font-bold uppercase tracking-[0.12em] text-muted">
            {t("emailLabel")}
          </span>
          <Input
            type="email"
            value={invitedEmail}
            onChange={(event) => setInvitedEmail(event.target.value)}
            placeholder="grandma@example.com"
            leadingIcon={<EnvelopeSimple size={13} weight="fill" aria-hidden="true" />}
          />
        </label>
      </div>

      <fieldset className="mt-3">
        <legend className="mb-1 block text-2xs font-bold uppercase tracking-[0.12em] text-muted">
          {t("roleLegend")}
        </legend>
        <div className="grid grid-cols-3 gap-1.5">
          {(Object.keys(ROLE_LABELS_EN) as FamilyRole[])
            .filter((roleKey) => roleKey !== "owner")
            .map((roleKey) => (
              <button
                key={roleKey}
                type="button"
                onClick={() => setRole(roleKey)}
                className={`focus-ring rounded-lg px-2 py-2 text-xs font-semibold ring-1 transition-colors ${
                  role === roleKey
                    ? "bg-mint-300 text-white ring-mint-300"
                    : "bg-surface text-muted ring-hairline hover:bg-sunken hover:text-ink"
                }`}
              >
                {tRoles(roleKey)}
              </button>
            ))}
        </div>
      </fieldset>

      <label className="mt-3 block">
        <span className="mb-1 block text-2xs font-bold uppercase tracking-[0.12em] text-muted">
          {t("personalMessage")}
        </span>
        <Textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={3}
          placeholder={t("messagePlaceholder")}
        />
      </label>

      <Button type="submit" className="mt-3" disabled={status === "saving"}>
        {status === "saving" ? (
          <>
            <CircleNotch size={13} weight="bold" className="animate-spin" aria-hidden="true" />
            {t("submitting")}
          </>
        ) : (
          <>
            <PaperPlaneTilt size={13} weight="fill" aria-hidden="true" />
            {t("submit")}
          </>
        )}
      </Button>

      {status === "error" ? (
        <p className="mt-3 rounded-lg bg-peach-50 p-2.5 text-sm font-semibold text-danger ring-1 ring-peach-100">
          {error}
        </p>
      ) : null}
    </form>
  );
}
