/* global window, React */
const { useTheme, Logo, Btn, Pill, Placeholder, Card, Icon, Blob, Display, Eyebrow, BODY_FONT, RADII, SHADOWS } = window;

// ──────────────────────────────────────────────────────────────────
// In-app screens — Discover, Journal, Families
// All sit inside an AppShell with the new Scandinavian round chrome.
// ──────────────────────────────────────────────────────────────────

function AppShell({ active = "discover", children }) {
  const { p, font } = useTheme();
  const nav = [
    { key: "discover", icon: "compass", label: "Opdag" },
    { key: "journal",  icon: "note",    label: "Journal" },
    { key: "families", icon: "users",   label: "Familier" },
    { key: "profile",  icon: "user",    label: "Profil" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", minHeight: "100%", background: p.bg, color: p.ink, fontFamily: BODY_FONT, fontSize: 14 }}>
      {/* Sidebar */}
      <aside style={{ padding: "20px 18px", borderRight: `1px solid ${p.hairline}`, background: p.bg, display: "flex", flexDirection: "column", gap: 18 }}>
        <Logo size={36} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: p.surface, borderRadius: RADII.pill, boxShadow: `inset 0 0 0 1px ${p.hairline}`, fontSize: 12.5, color: p.subtle }}>
          <Icon name="search" size={14} /> <span style={{ flex: 1 }}>Søg</span>
          <span style={{ padding: "2px 6px", borderRadius: 6, background: p.sunken, fontSize: 10, fontWeight: 700, color: p.muted }}>⌘K</span>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {nav.map((n) => {
            const a = n.key === active;
            return (
              <div key={n.key} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px", borderRadius: RADII.pill,
                background: a ? p.mint[100] : "transparent",
                color: a ? p.mint.ink : p.muted,
                fontWeight: 600, fontSize: 13.5,
              }}>
                <Icon name={n.icon} size={17} /> {n.label}
              </div>
            );
          })}
        </nav>
        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 10, padding: 12, background: p.surface, borderRadius: RADII.lg, boxShadow: `inset 0 0 0 1px ${p.hairline}` }}>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: p.peach[200] }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Maja S.</div>
            <div style={{ fontSize: 11.5, color: p.subtle }}>Familieejer</div>
          </div>
          <Icon name="chevron-down" size={14} color={p.subtle} />
        </div>
      </aside>
      <main style={{ minWidth: 0, padding: "28px 32px" }}>{children}</main>
    </div>
  );
}

// ── Discover screen ──────────────────────────────────────────────
function DiscoverScreen() {
  const { p, font } = useTheme();
  const venues = [
    { tone: "mint",   t: "Plantebørnehaven",   c: "Indendørs leg · Nørrebro · 0.6 km", chips: ["0–3 år", "Inde"], badge: "Åbent" },
    { tone: "butter", t: "Kaffe og Køkken",    c: "Cafe · Vesterbro · 0.4 km",          chips: ["0–6 år", "Højstol"], badge: "Åbent" },
    { tone: "peach",  t: "Hovedbiblioteket",   c: "Bibliotek · Indre by · 1.1 km",      chips: ["1–6 år", "Højtlæsning"], badge: "10:30" },
    { tone: "sky",    t: "Bellahøj Svømmehal", c: "Svømning · Brønshøj · 3.4 km",       chips: ["0–3 år", "Babysvøm"], badge: "Lukket" },
  ];
  return (
    <AppShell active="discover">
      {/* Today card */}
      <Card padding={24} radius={RADII["2xl"]} style={{ background: p.sky[50], boxShadow: `inset 0 0 0 1px ${p.sky[100]}`, position: "relative", overflow: "hidden", marginBottom: 18 }}>
        <Blob tone="sky" size={180} opacity={0.5} style={{ top: -60, right: -30 }} />
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 24, alignItems: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: 22, background: p.sky[100], color: p.sky.ink, display: "grid", placeItems: "center" }}><Icon name="sun" size={30} /></div>
          <div>
            <Eyebrow color={p.sky.ink}>God formiddag, Maja · Onsdag 10:42</Eyebrow>
            <div style={{ fontFamily: font.family, fontSize: 26, color: p.sky.ink, marginTop: 4, letterSpacing: font.tracking }}>14° · god dag til park med læ</div>
          </div>
          <Btn variant="ghost" size="sm" iconRight={<Icon name="arrow-right" size={14} />}>Se forslag</Btn>
        </div>
      </Card>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <Eyebrow>København</Eyebrow>
          <Display size={36} style={{ marginTop: 4 }}>Opdag</Display>
          <div style={{ marginTop: 4, fontSize: 13.5, color: p.muted }}>Find steder, pauser og små udflugter for børn 0–6 år.</div>
        </div>
        <Pill tone="mint">38 steder</Pill>
      </div>

      {/* Toolbar */}
      <Card padding={8} radius={RADII.pill} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, padding: "8px 14px", color: p.subtle, fontSize: 13 }}>
          <Icon name="search" size={14} /> Cafe, legeplads, Østerbro…
        </div>
        <Btn variant="soft" size="sm" icon={<Icon name="heart" size={13} />}>Gemte <span style={{ background: p.peach[200], color: p.peach.ink, padding: "1px 7px", borderRadius: 999, marginLeft: 4, fontSize: 11 }}>4</span></Btn>
        <Btn variant="soft" size="sm" icon={<Icon name="filter" size={13} />}>Filtre <span style={{ background: p.mint[300], color: p.mint.ink, padding: "1px 7px", borderRadius: 999, marginLeft: 4, fontSize: 11 }}>2</span></Btn>
        <div style={{ display: "flex", background: p.sunken, borderRadius: RADII.pill, padding: 3 }}>
          {[["Begge","split"], ["Liste","list"], ["Kort","map"]].map(([l, v], i) => (
            <div key={v} style={{ padding: "6px 12px", borderRadius: RADII.pill, background: i === 0 ? p.surface : "transparent", fontSize: 12.5, fontWeight: 600, color: i === 0 ? p.ink : p.muted, boxShadow: i === 0 ? `0 1px 2px rgba(0,0,0,0.04)` : "none" }}>{l}</div>
          ))}
        </div>
      </Card>

      {/* Active chips */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        <Pill tone="mint" size="sm">Cafe</Pill>
        <Pill tone="mint" size="sm">Nørrebro</Pill>
        <span style={{ alignSelf: "center", fontSize: 11, fontWeight: 700, color: p.peach.ink, marginLeft: 4, textTransform: "uppercase", letterSpacing: "0.14em" }}>Nulstil</span>
      </div>

      {/* Split */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 16 }}>
        {/* List */}
        <div style={{ display: "grid", gap: 10 }}>
          {venues.map((v) => (
            <Card key={v.t} padding={12} radius={RADII.xl} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 14, alignItems: "center" }}>
              <Placeholder tone={v.tone} radius={RADII.lg} style={{ width: 76, height: 76 }} />
              <div>
                <div style={{ fontFamily: font.family, fontSize: 19, letterSpacing: font.tracking }}>{v.t}</div>
                <div style={{ fontSize: 12.5, color: p.subtle, marginTop: 2 }}>{v.c}</div>
                <div style={{ display: "flex", gap: 5, marginTop: 8 }}>
                  {v.chips.map((c) => <Pill key={c} tone="sunken" size="sm">{c}</Pill>)}
                  <Pill tone={v.badge === "Lukket" ? "peach" : "mint"} size="sm">{v.badge}</Pill>
                </div>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 999, background: p.sunken, display: "grid", placeItems: "center", color: p.muted }}>
                <Icon name="heart" size={15} />
              </div>
            </Card>
          ))}
        </div>
        {/* Map */}
        <Card padding={0} radius={RADII["2xl"]} style={{ overflow: "hidden", height: 540, position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, background: `
            radial-gradient(circle at 20% 30%, ${p.mint[50]} 0%, transparent 40%),
            radial-gradient(circle at 70% 60%, ${p.peach[50]} 0%, transparent 45%),
            radial-gradient(circle at 50% 80%, ${p.butter[50]} 0%, transparent 40%),
            ${p.sunken}` }} />
          {/* fake roads */}
          <svg viewBox="0 0 400 540" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} preserveAspectRatio="none">
            <path d="M-20 120 Q 100 80, 220 140 T 420 100" stroke={p.hairline} strokeWidth="3" fill="none" />
            <path d="M50 -20 Q 80 200, 180 280 T 280 540" stroke={p.hairline} strokeWidth="3" fill="none" />
            <path d="M-20 380 Q 150 360, 280 420 T 420 380" stroke={p.hairline} strokeWidth="3" fill="none" />
          </svg>
          {/* markers */}
          {[
            { x: 28, y: 22, tone: "mint" },
            { x: 60, y: 38, tone: "butter", active: true },
            { x: 42, y: 60, tone: "peach" },
            { x: 78, y: 72, tone: "sky" },
          ].map((m, i) => (
            <div key={i} style={{ position: "absolute", left: `${m.x}%`, top: `${m.y}%`, transform: "translate(-50%,-100%)" }}>
              <div style={{
                background: p[m.tone][300], color: p.surface,
                padding: m.active ? "8px 12px" : "6px 9px",
                borderRadius: RADII.pill,
                fontSize: m.active ? 13 : 11, fontWeight: 700,
                boxShadow: SHADOWS.lift,
                border: `2px solid ${p.surface}`,
                whiteSpace: "nowrap",
              }}>{m.active ? "Kaffe og Køkken" : "•"}</div>
            </div>
          ))}
          {/* mini control */}
          <div style={{ position: "absolute", top: 14, right: 14, display: "grid", gap: 6 }}>
            {["plus", "search", "pin"].map((i) => (
              <div key={i} style={{ width: 36, height: 36, background: p.surface, borderRadius: 12, display: "grid", placeItems: "center", boxShadow: SHADOWS.soft, color: p.muted }}>
                <Icon name={i} size={15} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

// ── Journal screen ───────────────────────────────────────────────
function JournalScreen() {
  const { p, font } = useTheme();
  const entries = [
    { kind: "milestone", tone: "peach", date: "I dag · 14:23", t: "Første hele sætning", body: "\"Mere vand, tak.\" Meget bestemt og meget sødt.", who: "Asta · 2 år", icon: "sparkle" },
    { kind: "outing",    tone: "mint",  date: "I går · 11:00", t: "Formiddag i Fælledparken", body: "Vi øvede stop og start ved den røde plads og spiste boller på vejen hjem.", who: "Asta · Maja & Far", icon: "leaf", photo: true },
    { kind: "aula",      tone: "butter",date: "Tirsdag · 13:40", t: "En blød formiddag i puderummet", body: "Børnehaven delte et lille glimt fra dagens motorikleg.", who: "Fra børnehaven", icon: "users" },
    { kind: "milestone", tone: "sky",   date: "Mandag · 09:12", t: "Sad selv i 30 sekunder", body: "Med et lille smil — og så røg hun forover i puden igen.", who: "Asta · 2 år", icon: "star" },
  ];
  return (
    <AppShell active="journal">
      {/* Child header */}
      <Card padding={20} radius={RADII["2xl"]} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 18, alignItems: "center", marginBottom: 18, background: p.surface }}>
        <div style={{ width: 64, height: 64, borderRadius: 999, background: p.peach[200], display: "grid", placeItems: "center", color: p.peach.ink, fontFamily: font.family, fontSize: 28, letterSpacing: font.tracking }}>A</div>
        <div>
          <Eyebrow>Privat journal</Eyebrow>
          <Display size={32} style={{ marginTop: 2 }}>Asta</Display>
          <div style={{ fontSize: 13, color: p.muted, marginTop: 2 }}>2 år 4 mdr · 23 milepæle · 47 ture</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="soft" size="sm" icon={<Icon name="sparkle" size={13} />}>Milepæl</Btn>
          <Btn variant="primary" size="sm" icon={<Icon name="plus" size={13} />}>Tilføj tur</Btn>
        </div>
      </Card>

      {/* Filter row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {[["Alle", true], ["Milepæle"], ["Ture"], ["Aula"]].map(([l, a], i) => (
            <Pill key={i} tone={a ? "inkChip" : "sunken"} size="md" style={a ? { background: p.ink, color: p.bg, boxShadow: "none" } : undefined}>{l}</Pill>
          ))}
        </div>
        <div style={{ fontSize: 12, color: p.subtle }}>23 indslag i marts</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24 }}>
        {/* Timeline */}
        <div style={{ display: "grid", gap: 14, position: "relative" }}>
          <div style={{ position: "absolute", left: 22, top: 18, bottom: 18, width: 2, background: p.hairline, borderRadius: 2 }} />
          {entries.map((e, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 18, position: "relative" }}>
              <div style={{ width: 46, height: 46, borderRadius: 999, background: p[e.tone][100], color: p[e.tone].ink, display: "grid", placeItems: "center", boxShadow: `0 0 0 4px ${p.bg}`, position: "relative", zIndex: 1 }}>
                <Icon name={e.icon} size={20} />
              </div>
              <Card padding={18} radius={RADII.xl}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Pill tone={e.tone} size="sm">{e.kind === "milestone" ? "Milepæl" : e.kind === "aula" ? "Fra børnehaven" : "Tur"}</Pill>
                  <div style={{ fontSize: 11.5, color: p.subtle }}>{e.date}</div>
                </div>
                <div style={{ fontFamily: font.family, fontSize: 22, marginTop: 10, letterSpacing: font.tracking }}>{e.t}</div>
                <div style={{ marginTop: 6, color: p.muted, fontSize: 14 }}>{e.body}</div>
                {e.photo ? (
                  <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                    <Placeholder tone="mint" label="park photo" radius={14} style={{ height: 100 }} />
                    <Placeholder tone="butter" label="boller" radius={14} style={{ height: 100 }} />
                    <Placeholder tone="peach" label="løbecykel" radius={14} style={{ height: 100 }} />
                  </div>
                ) : null}
                <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 12, color: p.subtle }}>{e.who}</div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 999, background: p.peach[200], boxShadow: `0 0 0 2px ${p.surface}` }} />
                    <div style={{ width: 22, height: 22, borderRadius: 999, background: p.mint[200], boxShadow: `0 0 0 2px ${p.surface}`, marginLeft: -6 }} />
                    <div style={{ width: 22, height: 22, borderRadius: 999, background: p.butter[200], boxShadow: `0 0 0 2px ${p.surface}`, marginLeft: -6 }} />
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Right column */}
        <div style={{ display: "grid", gap: 14 }}>
          <Card padding={18} radius={RADII.xl}>
            <Eyebrow>Året i journalen</Eyebrow>
            <div style={{ fontFamily: font.family, fontSize: 22, marginTop: 4, letterSpacing: font.tracking }}>2026</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginTop: 12 }}>
              {Array.from({ length: 35 }).map((_, i) => {
                const lvl = [0,0,1,0,2,0,0,1,3,0,0,2,0,1,0,0,0,2,1,0,3,0,0,1,0,2,0,0,1,0,3,0,0,1,2][i] || 0;
                const tones = ["transparent", p.peach[100], p.peach[200], p.peach[300]];
                return <div key={i} style={{ aspectRatio: 1, background: tones[lvl], borderRadius: 6, boxShadow: lvl ? "none" : `inset 0 0 0 1px ${p.hairline}` }} />;
              })}
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: p.subtle, display: "flex", justifyContent: "space-between" }}>
              <span>Mar</span>
              <span>23 indslag</span>
            </div>
          </Card>
          <Card padding={18} radius={RADII.xl} style={{ background: p.butter[50], boxShadow: `inset 0 0 0 1px ${p.butter[100]}` }}>
            <Eyebrow color={p.butter.ink}>Planlagte ture</Eyebrow>
            <div style={{ fontFamily: font.family, fontSize: 18, marginTop: 6, color: p.butter.ink, letterSpacing: font.tracking }}>Bellahøj Svømmehal</div>
            <div style={{ fontSize: 12, color: p.butter.ink, opacity: 0.75, marginTop: 4 }}>I morgen · 10:30 · med Mormor</div>
            <Btn variant="soft" size="sm" style={{ marginTop: 12 }} icon={<Icon name="check" size={12} />}>Markér besøgt</Btn>
          </Card>
          <Card padding={16} radius={RADII.xl} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 999, background: p.sky[100], color: p.sky.ink, display: "grid", placeItems: "center" }}><Icon name="lock" size={16} /></div>
            <div style={{ fontSize: 12, color: p.muted, lineHeight: 1.4 }}>Privat journal · kun jeres familie ser dette</div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

// ── Families screen ──────────────────────────────────────────────
function FamiliesScreen() {
  const { p, font } = useTheme();
  return (
    <AppShell active="families">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
        <div>
          <Eyebrow>Nørrebro · Forbindelser</Eyebrow>
          <Display size={36} style={{ marginTop: 4 }}>Familier i nabolaget</Display>
          <div style={{ marginTop: 4, fontSize: 13.5, color: p.muted, maxWidth: 460 }}>Find familier på samme alder og bydel — send en hilsen og planlæg en legeaftale.</div>
        </div>
        <Btn variant="primary" size="md" icon={<Icon name="plus" size={14} />}>Inviter</Btn>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, padding: 4, background: p.sunken, borderRadius: RADII.pill, marginBottom: 16, width: "fit-content" }}>
        {["Opdag", "Forbindelser (3)", "Beskeder (2)"].map((l, i) => (
          <div key={l} style={{ padding: "8px 16px", borderRadius: RADII.pill, background: i === 0 ? p.surface : "transparent", fontSize: 13, fontWeight: 600, color: i === 0 ? p.ink : p.muted, boxShadow: i === 0 ? "0 1px 2px rgba(0,0,0,0.04)" : "none" }}>{l}</div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 22 }}>
        {/* Family cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[
            { name: "Familien Holm",     n: "Nørrebro", ages: "0–6 mdr · 3 år",   tone: "mint",   tag: "Caféer · Bibliotek" },
            { name: "Familien Lund",     n: "Nørrebro", ages: "1 år · 4 år",       tone: "peach",  tag: "Legepladser · Park", connected: true },
            { name: "Familien Berg",     n: "Østerbro", ages: "2 år",              tone: "butter", tag: "Svømning · Cafe" },
            { name: "Familien Nielsen",  n: "Nørrebro", ages: "6 mdr · 5 år",      tone: "sky",    tag: "Bibliotek · Teater" },
          ].map((f) => (
            <Card key={f.name} padding={20} radius={RADII["2xl"]}>
              <div style={{ position: "relative" }}>
                <Placeholder tone={f.tone} radius={RADII.lg} label="family cover" style={{ height: 120 }} />
                <div style={{ position: "absolute", bottom: -20, left: 12, display: "flex" }}>
                  {[0,1].map((i) => (
                    <div key={i} style={{ width: 40, height: 40, borderRadius: 999, background: p[f.tone][200], boxShadow: `0 0 0 3px ${p.surface}`, marginLeft: i ? -10 : 0 }} />
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontFamily: font.family, fontSize: 20, letterSpacing: font.tracking }}>{f.name}</div>
                {f.connected ? <Pill tone="mint" size="sm" icon={<Icon name="check" size={11} />}>Forbundet</Pill> : null}
              </div>
              <div style={{ fontSize: 12.5, color: p.subtle, marginTop: 4 }}>{f.n} · {f.ages}</div>
              <div style={{ marginTop: 10, fontSize: 12, color: p.muted }}>{f.tag}</div>
              <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                {f.connected ? (
                  <>
                    <Btn variant="soft" size="sm" full icon={<Icon name="chat" size={13} />}>Skriv</Btn>
                    <Btn variant="ghost" size="sm" icon={<Icon name="user" size={13} />}>Profil</Btn>
                  </>
                ) : (
                  <>
                    <Btn variant="primary" size="sm" full>Send anmodning</Btn>
                    <Btn variant="ghost" size="sm">Profil</Btn>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Right rail */}
        <div style={{ display: "grid", gap: 14 }}>
          <Card padding={20} radius={RADII["2xl"]} style={{ background: p.peach[50], boxShadow: `inset 0 0 0 1px ${p.peach[100]}` }}>
            <Eyebrow color={p.peach.ink}>Jeres familie</Eyebrow>
            <div style={{ fontFamily: font.family, fontSize: 22, marginTop: 6, color: p.peach.ink, letterSpacing: font.tracking }}>Familien Sørensen</div>
            <div style={{ marginTop: 12, display: "flex", gap: -6 }}>
              {[p.peach[200], p.mint[200], p.butter[200], p.sky[200]].map((c, i) => (
                <div key={i} style={{ width: 34, height: 34, borderRadius: 999, background: c, boxShadow: `0 0 0 2px ${p.peach[50]}`, marginLeft: i ? -8 : 0 }} />
              ))}
              <div style={{ width: 34, height: 34, borderRadius: 999, background: p.surface, color: p.muted, display: "grid", placeItems: "center", marginLeft: -8, boxShadow: `0 0 0 2px ${p.peach[50]}`, fontSize: 12, fontWeight: 700 }}>+1</div>
            </div>
            <Btn variant="accent" size="sm" full style={{ marginTop: 14 }} icon={<Icon name="plus" size={13} />}>Inviter mormor</Btn>
          </Card>
          <Card padding={18} radius={RADII.xl}>
            <Eyebrow>Beskeder</Eyebrow>
            <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
              {[
                { name: "Familien Lund", body: "Skal vi mødes på Nørrebroparken?", time: "14:02", tone: "peach", unread: 2 },
                { name: "Familien Berg", body: "Tak for legetiden i går!", time: "I går", tone: "butter" },
              ].map((m, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 999, background: p[m.tone][200] }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: p.subtle }}>{m.time}</div>
                    </div>
                    <div style={{ fontSize: 12, color: p.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.body}</div>
                  </div>
                  {m.unread ? <span style={{ background: p.mint[300], color: p.mint.ink, borderRadius: 999, padding: "2px 7px", fontSize: 11, fontWeight: 700 }}>{m.unread}</span> : null}
                </div>
              ))}
            </div>
          </Card>
          <Card padding={16} radius={RADII.xl} style={{ background: p.sunken }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Icon name="lock" size={16} color={p.subtle} />
              <div style={{ fontSize: 11.5, color: p.muted, lineHeight: 1.4 }}>Børnenes navne og fotos er aldrig offentlige. I bestemmer altid niveau.</div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

// ── Mobile Discover screen ──────────────────────────────────────
function MobileDiscover() {
  const { p, font } = useTheme();
  return (
    <div style={{ background: p.bg, minHeight: 660, padding: "44px 16px 80px", color: p.ink, fontFamily: BODY_FONT, fontSize: 13, overflow: "hidden", position: "relative" }}>
      {/* status bar */}
      <div style={{ position: "absolute", top: 12, left: 0, right: 0, padding: "0 28px", display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: p.ink }}>
        <span>9:41</span>
        <span>● ● ●</span>
      </div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <Logo size={32} showWord={false} />
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: p.surface, boxShadow: `inset 0 0 0 1px ${p.hairline}`, display: "grid", placeItems: "center", color: p.muted }}><Icon name="bell" size={15} /></div>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: p.peach[200] }} />
        </div>
      </div>
      <Eyebrow>Onsdag</Eyebrow>
      <div style={{ fontFamily: font.family, fontSize: 30, marginTop: 4, letterSpacing: font.tracking, lineHeight: 1.1 }}>God formiddag,<br/>Maja</div>

      {/* Today */}
      <Card padding={16} radius={RADII.xl} style={{ marginTop: 16, background: p.sky[50], boxShadow: `inset 0 0 0 1px ${p.sky[100]}`, display: "grid", gridTemplateColumns: "auto 1fr", gap: 14, alignItems: "center" }}>
        <div style={{ width: 50, height: 50, borderRadius: 18, background: p.sky[100], color: p.sky.ink, display: "grid", placeItems: "center" }}><Icon name="sun" size={24} /></div>
        <div>
          <div style={{ fontSize: 11, color: p.sky.ink, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" }}>I dag · 14°</div>
          <div style={{ fontSize: 13, color: p.sky.ink, marginTop: 4 }}>God dag til park med læ</div>
        </div>
      </Card>

      {/* Search */}
      <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: p.surface, borderRadius: RADII.pill, boxShadow: `inset 0 0 0 1px ${p.hairline}`, color: p.subtle, fontSize: 12.5 }}>
        <Icon name="search" size={14} /> Cafe, legeplads, Østerbro…
      </div>

      {/* Chips */}
      <div style={{ marginTop: 12, display: "flex", gap: 6, overflow: "hidden" }}>
        <Pill tone="mint" size="sm">Legeplads</Pill>
        <Pill tone="sunken" size="sm">Cafe</Pill>
        <Pill tone="sunken" size="sm">Bibliotek</Pill>
        <Pill tone="sunken" size="sm">Inde</Pill>
      </div>

      {/* Cards */}
      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        {[
          { tone: "mint", t: "Plantebørnehaven", c: "Nørrebro · 0.6 km" },
          { tone: "butter", t: "Kaffe og Køkken", c: "Vesterbro · 0.4 km" },
          { tone: "peach", t: "Hovedbiblioteket", c: "Indre by · 1.1 km" },
        ].map((v) => (
          <Card key={v.t} padding={10} radius={RADII.lg} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "center" }}>
            <Placeholder tone={v.tone} radius={12} style={{ width: 56, height: 56 }} />
            <div>
              <div style={{ fontFamily: font.family, fontSize: 16, letterSpacing: font.tracking }}>{v.t}</div>
              <div style={{ fontSize: 11, color: p.subtle, marginTop: 2 }}>{v.c}</div>
            </div>
            <div style={{ width: 32, height: 32, borderRadius: 999, background: p.sunken, color: p.muted, display: "grid", placeItems: "center" }}><Icon name="heart" size={13} /></div>
          </Card>
        ))}
      </div>

      {/* Bottom nav */}
      <div style={{ position: "absolute", bottom: 16, left: 16, right: 16, padding: 6, background: p.surface, borderRadius: RADII.pill, boxShadow: SHADOWS.lift, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
        {[
          { i: "compass", l: "Opdag", a: true },
          { i: "note",    l: "Journal" },
          { i: "users",   l: "Familier" },
          { i: "user",    l: "Profil" },
        ].map((n) => (
          <div key={n.l} style={{ padding: "8px 4px", borderRadius: RADII.pill, background: n.a ? p.mint[100] : "transparent", color: n.a ? p.mint.ink : p.subtle, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, fontSize: 10, fontWeight: 600 }}>
            <Icon name={n.i} size={17} />
            {n.l}
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { AppShell, DiscoverScreen, JournalScreen, FamiliesScreen, MobileDiscover });
