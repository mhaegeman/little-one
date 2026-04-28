"use client";

import { Crown, Pencil, Plus, Users } from "lucide-react";
import { useState } from "react";
import { InviteForm } from "@/components/profile/InviteForm";
import { Button } from "@/components/ui/Button";
import { ROLE_LABELS_DA } from "@/lib/family";
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
    <section className="overflow-hidden rounded-card bg-white shadow-soft ring-1 ring-oat">
      <div className="relative h-32 sm:h-40">
        {family.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={family.coverUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-moss via-mossDark to-rust" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0" />
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/85">Familie</p>
            <h2 className="font-display text-3xl font-semibold leading-tight drop-shadow-sm">
              {family.name}
            </h2>
          </div>
          {isOwner && !editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="focus-ring flex h-9 items-center gap-1.5 rounded-full bg-white/95 px-3 text-xs font-bold text-ink"
            >
              <Pencil size={14} aria-hidden="true" />
              Rediger
            </button>
          ) : null}
        </div>
      </div>

      <div className="px-5 py-5 sm:px-6">
        {editing ? (
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-ink/60">
                Familienavn
              </span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="focus-ring h-11 w-full rounded-xl bg-linen px-3 text-sm font-semibold ring-1 ring-oat"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-ink/60">
                Beskrivelse
              </span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                placeholder="Vi er fire i alt — Asta, Theo og deres forældre."
                className="focus-ring w-full rounded-xl bg-linen p-3 text-sm font-semibold ring-1 ring-oat"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-ink/60">
                Forsidebillede (URL)
              </span>
              <input
                value={coverUrl}
                onChange={(event) => setCoverUrl(event.target.value)}
                placeholder="https://res.cloudinary.com/..."
                className="focus-ring h-11 w-full rounded-xl bg-linen px-3 text-sm font-semibold ring-1 ring-oat"
              />
            </label>
            <div className="flex gap-2">
              <Button type="button" onClick={saveDetails}>
                Gem familie
              </Button>
              <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
                Annullér
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-6 text-ink/70">
            {family.description ??
              "Tilføj en beskrivelse, så bedsteforældre og familie ved hvad I bruger Lille Liv til."}
          </p>
        )}

        <div className="mt-5">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
              <Users size={18} className="text-rust" aria-hidden="true" />
              Medlemmer
              <span className="text-sm font-bold text-ink/50">({members.length})</span>
            </h3>
            {isOwner ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowInvite((value) => !value)}
              >
                <Plus size={15} aria-hidden="true" />
                Inviter
              </Button>
            ) : null}
          </div>

          <ul className="mt-3 space-y-2">
            {members.map((member) => {
              const name = member.profile?.displayName ?? member.displayName ?? "Familie";
              const initials = name
                .split(/\s+/)
                .map((part) => part[0]?.toUpperCase() ?? "")
                .join("")
                .slice(0, 2);
              return (
                <li
                  key={member.id}
                  className="flex items-center gap-3 rounded-2xl bg-linen p-3 ring-1 ring-oat"
                >
                  {member.profile?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.profile.avatarUrl}
                      alt=""
                      className="h-12 w-12 rounded-2xl object-cover ring-2 ring-white"
                    />
                  ) : (
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white font-display text-base font-semibold text-mossDark ring-2 ring-white">
                      {initials || "?"}
                    </span>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-bold text-ink">{name}</p>
                    {member.profile?.bio ? (
                      <p className="text-xs leading-5 text-ink/60 line-clamp-2">{member.profile.bio}</p>
                    ) : null}
                  </div>
                  <span
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${
                      member.role === "owner"
                        ? "bg-butter text-ink"
                        : "bg-white text-mossDark ring-1 ring-oat"
                    }`}
                  >
                    {member.role === "owner" ? <Crown size={11} aria-hidden="true" /> : null}
                    {ROLE_LABELS_DA[member.role]}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {showInvite && isOwner ? (
          <div className="mt-4">
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
          <div className="mt-5">
            <h3 className="font-display text-lg font-semibold text-ink">Afventer svar</h3>
            <ul className="mt-2 space-y-2">
              {invites
                .filter((invite) => invite.status === "pending")
                .map((invite) => (
                  <li
                    key={invite.id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-linen p-3 ring-1 ring-oat"
                  >
                    <div>
                      <p className="text-sm font-bold text-ink">
                        {invite.invitedName ?? invite.invitedEmail ?? "Familiemedlem"}
                      </p>
                      <p className="text-xs text-ink/60">
                        {ROLE_LABELS_DA[invite.role]}
                        {invite.invitedEmail ? ` · ${invite.invitedEmail}` : ""}
                      </p>
                    </div>
                    {isOwner ? (
                      <button
                        type="button"
                        onClick={() => onRevokeInvite(invite.id)}
                        className="focus-ring text-xs font-bold text-rust underline-offset-4 hover:underline"
                      >
                        Træk tilbage
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
