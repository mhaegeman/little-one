"use client";

import { Crown, PencilSimple, Plus, Users } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { InviteForm } from "@/components/profile/InviteForm";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { Family, FamilyInvite, FamilyMember, FamilyRole } from "@/lib/types";

type Props = {
  family: Family;
  members: FamilyMember[];
  invites: FamilyInvite[];
  isOwner: boolean;
  onUpdateFamily: (patch: Partial<Pick<Family, "name" | "description" | "coverUrl">>) => Promise<void>;
  onCreateInvite: (input: {
    invitedEmail?: string;
    invitedName?: string;
    role: FamilyRole;
    message?: string;
  }) => Promise<FamilyInvite>;
  onRevokeInvite: (inviteId: string) => Promise<void>;
};

export function FamilyCard({
  family,
  members,
  invites,
  isOwner,
  onUpdateFamily,
  onCreateInvite,
  onRevokeInvite
}: Props) {
  const t = useTranslations("familyCard");
  const tRoles = useTranslations("roles");
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(family.name);
  const [description, setDescription] = useState(family.description ?? "");
  const [coverUrl, setCoverUrl] = useState(family.coverUrl ?? "");
  const [showInvite, setShowInvite] = useState(false);

  async function saveDetails() {
    await onUpdateFamily({
      name: name.trim() || family.name,
      description: description.trim() || null,
      coverUrl: coverUrl.trim() || null
    });
    setEditing(false);
  }

  return (
    <section className="overflow-hidden rounded-card bg-surface ring-1 ring-hairline">
      <div className="relative h-24 sm:h-28">
        {family.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={family.coverUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-sage-400 via-sage-600 to-sage-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0" />
        <div className="absolute bottom-2.5 left-4 right-4 flex items-end justify-between text-white">
          <div>
            <p className="text-2xs font-bold uppercase tracking-[0.16em] text-white/85">{t("eyebrow")}</p>
            <h2 className="font-display text-2xl font-semibold leading-tight drop-shadow-sm">
              {family.name}
            </h2>
          </div>
          {isOwner && !editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="focus-ring flex h-8 items-center gap-1 rounded-pill bg-white/95 px-2.5 text-2xs font-semibold text-ink"
            >
              <PencilSimple size={12} weight="bold" aria-hidden="true" />
              {t("editButton")}
            </button>
          ) : null}
        </div>
      </div>

      <div className="px-5 py-4">
        {editing ? (
          <div className="space-y-2.5">
            <label className="block">
              <span className="mb-1 block text-2xs font-bold uppercase tracking-[0.12em] text-muted">
                {t("familyNameLabel")}
              </span>
              <Input value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1 block text-2xs font-bold uppercase tracking-[0.12em] text-muted">
                {t("descriptionLabel")}
              </span>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                placeholder={t("descriptionPlaceholder")}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-2xs font-bold uppercase tracking-[0.12em] text-muted">
                {t("coverLabel")}
              </span>
              <Input
                value={coverUrl}
                onChange={(event) => setCoverUrl(event.target.value)}
                placeholder="https://res.cloudinary.com/…"
              />
            </label>
            <div className="flex gap-2">
              <Button type="button" onClick={saveDetails}>
                {t("saveFamily")}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
                {t("cancel")}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-6 text-muted">
            {family.description ?? t("defaultDescription")}
          </p>
        )}

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 font-display text-base font-semibold text-ink">
              <Users size={14} weight="fill" className="text-sage-700" aria-hidden="true" />
              {t("membersTitle")}
              <span className="text-xs font-semibold text-subtle">({members.length})</span>
            </h3>
            {isOwner ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setShowInvite((value) => !value)}
              >
                <Plus size={12} weight="bold" aria-hidden="true" />
                {t("inviteButton")}
              </Button>
            ) : null}
          </div>

          <ul className="mt-2.5 space-y-1.5">
            {members.map((member) => {
              const name = member.profile?.displayName ?? member.displayName ?? t("fallbackMember");
              const initials = name
                .split(/\s+/)
                .map((part) => part[0]?.toUpperCase() ?? "")
                .join("")
                .slice(0, 2);
              return (
                <li
                  key={member.id}
                  className="flex items-center gap-2.5 rounded-lg bg-sunken p-2.5 ring-1 ring-hairline"
                >
                  {member.profile?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.profile.avatarUrl}
                      alt=""
                      className="h-10 w-10 rounded-lg object-cover ring-2 ring-surface"
                    />
                  ) : (
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-surface font-display text-sm font-semibold text-sage-700 ring-2 ring-surface">
                      {initials || "?"}
                    </span>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink">{name}</p>
                    {member.profile?.bio ? (
                      <p className="text-xs leading-5 text-muted line-clamp-2">{member.profile.bio}</p>
                    ) : null}
                  </div>
                  <span
                    className={`flex items-center gap-1 rounded-pill px-2 py-0.5 text-2xs font-semibold uppercase tracking-[0.1em] ${
                      member.role === "owner"
                        ? "bg-[#FBF1D9] text-warning ring-1 ring-[#F0DFB1]"
                        : "bg-surface text-muted ring-1 ring-hairline"
                    }`}
                  >
                    {member.role === "owner" ? (
                      <Crown size={10} weight="fill" aria-hidden="true" />
                    ) : null}
                    {tRoles(member.role)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {showInvite && isOwner ? (
          <div className="mt-3">
            <InviteForm
              familyName={family.name}
              onSubmit={async (input) => {
                const invite = await onCreateInvite(input);
                setShowInvite(false);
                return invite;
              }}
            />
          </div>
        ) : null}

        {invites.filter((invite) => invite.status === "pending").length > 0 ? (
          <div className="mt-4">
            <h3 className="font-display text-sm font-semibold text-ink">{t("pendingTitle")}</h3>
            <ul className="mt-1.5 space-y-1.5">
              {invites
                .filter((invite) => invite.status === "pending")
                .map((invite) => (
                  <li
                    key={invite.id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-sunken p-2.5 ring-1 ring-hairline"
                  >
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        {invite.invitedName ?? invite.invitedEmail ?? t("fallbackMember")}
                      </p>
                      <p className="text-xs text-muted">
                        {tRoles(invite.role)}
                        {invite.invitedEmail ? ` · ${invite.invitedEmail}` : ""}
                      </p>
                    </div>
                    {isOwner ? (
                      <button
                        type="button"
                        onClick={() => onRevokeInvite(invite.id)}
                        className="focus-ring text-xs font-semibold text-warm-600 underline-offset-4 hover:underline"
                      >
                        {t("revoke")}
                      </button>
                    ) : null}
                  </li>
                ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
