/* global window, React */
const { useTheme, Logo, Btn, Pill, Placeholder, Card, Icon, Blob, Display, Eyebrow, BODY_FONT, RADII, SHADOWS } = window;

// ──────────────────────────────────────────────────────────────────
// Landing v3 — Mobile-first card stack ("Conversation")
// Optimized for mobile feel — short scroll, big typography, single column.
// Then a desktop wide outer frame surrounding it.
// ──────────────────────────────────────────────────────────────────

function LandingConversational() {
  const { p, font } = useTheme();
  return (
    <div style={{ background: p.bg, color: p.ink, fontFamily: BODY_FONT, fontSize: 15, lineHeight: 1.5 }}>
      {/* Topbar */}
      <header style={{ padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Logo size={34} />
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="ghost" size="sm">Log ind</Btn>
          <Btn variant="primary" size="sm">Kom i gang</Btn>
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: "40px 32px 32px", maxWidth: 1100, margin: "0 auto", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <Blob tone="mint" size={280} opacity={0.55} style={{ top: -40, left: -40 }} />
        <Blob tone="peach" size={240} opacity={0.6} style={{ top: 100, right: -40 }} />
        <Blob tone="butter" size={200} opacity={0.5} style={{ bottom: -60, left: "30%" }} />
        <div style={{ position: "relative" }}>
          <Pill tone="peach" icon={<span style={{ width: 6, height: 6, borderRadius: 999, background: p.peach[300] }} />}>For småbørnsfamilier i København</Pill>
          <Display size={96} style={{ marginTop: 24 }}>
            Find steder.<br/>
            <span style={{ fontStyle: "italic", color: p.mint.ink }}>Gem øjeblikkene.</span><br/>
            Sammen.
          </Display>
          <p style={{ marginTop: 24, fontSize: 18, color: p.muted, maxWidth: 520, margin: "24px auto 0", lineHeight: 1.55 }}>
            En familieguide og privat journal for forældre, bedsteforældre og dagplejer.
          </p>
          <div style={{ display: "inline-flex", gap: 12, marginTop: 32 }}>
            <Btn variant="primary" size="lg" iconRight={<Icon name="arrow-right" size={16} />}>Opret familie — gratis</Btn>
            <Btn variant="ghost" size="lg">Hvordan virker det?</Btn>
          </div>
        </div>
      </section>

      {/* Card stack — like SMS conversation */}
      <section style={{ padding: "40px 32px", maxWidth: 720, margin: "0 auto", display: "grid", gap: 14 }}>
        {/* mom card */}
        <Card padding={20} radius={RADII["2xl"]} style={{ background: p.surface, alignSelf: "flex-start", maxWidth: "85%", borderTopLeftRadius: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: p.subtle, textTransform: "uppercase", letterSpacing: "0.16em" }}>Maja</div>
          <div style={{ fontFamily: font.family, fontSize: 22, marginTop: 6, letterSpacing: font.tracking }}>Hvor finder vi en cafe på Vesterbro med plads til klapvogn?</div>
        </Card>

        {/* app reply */}
        <Card padding={0} radius={RADII["2xl"]} style={{ background: p.mint[50], boxShadow: `inset 0 0 0 1px ${p.mint[100]}`, alignSelf: "flex-end", maxWidth: "85%", marginLeft: "auto", borderTopRightRadius: 8, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px 12px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 999, background: p.mint[200], display: "grid", placeItems: "center", color: p.mint.ink }}><Icon name="compass" size={14} /></div>
            <div style={{ fontSize: 12, fontWeight: 700, color: p.mint.ink, textTransform: "uppercase", letterSpacing: "0.16em" }}>Lille Liv · Opdag</div>
          </div>
          <div style={{ padding: "0 20px 16px", display: "grid", gridTemplateColumns: "auto 1fr", gap: 12 }}>
            <Placeholder tone="butter" radius={14} style={{ width: 64, height: 64 }} />
            <div>
              <div style={{ fontFamily: font.family, fontSize: 20, color: p.mint.ink, letterSpacing: font.tracking }}>Kaffe og Køkken</div>
              <div style={{ fontSize: 12.5, color: p.mint.ink, opacity: 0.75, marginTop: 2 }}>Cafe · Vesterbro · 0,4 km</div>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <Pill tone="mint" size="sm">Plads til klapvogn</Pill>
                <Pill tone="mint" size="sm">Højstol</Pill>
              </div>
            </div>
          </div>
        </Card>

        {/* mom card 2 */}
        <Card padding={20} radius={RADII["2xl"]} style={{ background: p.surface, alignSelf: "flex-start", maxWidth: "85%", borderTopLeftRadius: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: p.subtle, textTransform: "uppercase", letterSpacing: "0.16em" }}>Maja</div>
          <div style={{ fontFamily: font.family, fontSize: 22, marginTop: 6, letterSpacing: font.tracking }}>Asta sagde sin første hele sætning i dag 🌱</div>
        </Card>

        {/* journal reply */}
        <Card padding={0} radius={RADII["2xl"]} style={{ background: p.peach[50], boxShadow: `inset 0 0 0 1px ${p.peach[100]}`, alignSelf: "flex-end", maxWidth: "85%", marginLeft: "auto", borderTopRightRadius: 8, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px 12px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 999, background: p.peach[200], display: "grid", placeItems: "center", color: p.peach.ink }}><Icon name="note" size={14} /></div>
            <div style={{ fontSize: 12, fontWeight: 700, color: p.peach.ink, textTransform: "uppercase", letterSpacing: "0.16em" }}>Lille Liv · Journal</div>
          </div>
          <div style={{ padding: "0 20px 18px" }}>
            <div style={{ fontFamily: font.family, fontSize: 20, color: p.peach.ink, letterSpacing: font.tracking }}>Gemt som milepæl: Første hele sætning</div>
            <div style={{ fontSize: 12.5, color: p.peach.ink, opacity: 0.75, marginTop: 4 }}>Mormor og Far ser det også · 14:23</div>
          </div>
        </Card>

        {/* family card */}
        <Card padding={20} radius={RADII["2xl"]} style={{ background: p.butter[50], boxShadow: `inset 0 0 0 1px ${p.butter[100]}`, alignSelf: "flex-end", maxWidth: "85%", marginLeft: "auto", borderTopRightRadius: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 999, background: p.butter[200], display: "grid", placeItems: "center", color: p.butter.ink }}><Icon name="users" size={14} /></div>
            <div style={{ fontSize: 12, fontWeight: 700, color: p.butter.ink, textTransform: "uppercase", letterSpacing: "0.16em" }}>Mormor</div>
          </div>
          <div style={{ fontFamily: font.family, fontSize: 20, marginTop: 8, color: p.butter.ink, letterSpacing: font.tracking }}>"Åh, hvor er hun stor 🥹 Kom forbi i weekenden?"</div>
        </Card>
      </section>

      {/* Today band */}
      <section style={{ padding: "60px 32px", background: p.sunken, marginTop: 32 }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <Eyebrow>I dag i København</Eyebrow>
            <Display size={42} style={{ marginTop: 10 }}>Lille Liv læser vejret for dig</Display>
          </div>
          <Card padding={32} radius={RADII["2xl"]} style={{ background: p.sky[50], boxShadow: `inset 0 0 0 1px ${p.sky[100]}`, position: "relative", overflow: "hidden" }}>
            <Blob tone="sky" size={220} opacity={0.5} style={{ top: -60, right: -50 }} />
            <div style={{ position: "relative", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 32, alignItems: "center" }}>
              <div style={{ width: 96, height: 96, borderRadius: 28, background: p.sky[100], color: p.sky.ink, display: "grid", placeItems: "center" }}>
                <Icon name="sun" size={48} />
              </div>
              <div>
                <Eyebrow color={p.sky.ink}>Onsdag · 14:00</Eyebrow>
                <div style={{ fontFamily: font.family, fontSize: 38, color: p.sky.ink, letterSpacing: font.tracking, marginTop: 4 }}>14° · delvist sol</div>
                <div style={{ marginTop: 8, color: p.sky.ink, opacity: 0.85, fontSize: 14, maxWidth: 420 }}>Mild østvind. Perfekt til Fælledparken eller babysvømning på Frederiksberg.</div>
              </div>
              <Btn variant="primary" size="md" iconRight={<Icon name="arrow-right" size={14} />}>Se forslag</Btn>
            </div>
          </Card>
        </div>
      </section>

      {/* Pillars — compact */}
      <section style={{ padding: "80px 32px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", textAlign: "center", marginBottom: 40 }}>
          <Eyebrow>Hvad er Lille Liv?</Eyebrow>
          <Display size={48} style={{ marginTop: 10 }}>Tre rum. Én rolig hverdag.</Display>
        </div>
        <div style={{ maxWidth: 980, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { tone: "mint",   icon: "compass", t: "Opdag",   b: "38 udvalgte steder, filtrér på alder, bydel og vejr." },
            { tone: "peach",  icon: "note",    t: "Journal", b: "Privat tidslinje pr. barn — milepæle, ture, glimt." },
            { tone: "butter", icon: "users",   t: "Familie", b: "Bedsteforældre og dagplejer ind. Op til 6 medlemmer." },
          ].map((item) => (
            <Card key={item.t} padding={24} radius={RADII["2xl"]} style={{ background: p[item.tone][50], boxShadow: `inset 0 0 0 1px ${p[item.tone][100]}`, textAlign: "left" }}>
              <div style={{ width: 48, height: 48, borderRadius: 16, background: p[item.tone][200], color: p[item.tone].ink, display: "grid", placeItems: "center" }}><Icon name={item.icon} size={22} /></div>
              <div style={{ fontFamily: font.family, fontSize: 26, marginTop: 16, color: p[item.tone].ink, letterSpacing: font.tracking }}>{item.t}</div>
              <div style={{ marginTop: 8, fontSize: 14, color: p.ink, opacity: 0.8 }}>{item.b}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials — compact triple */}
      <section style={{ padding: "20px 32px 80px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { name: "Maja", n: "Nørrebro · 2 år",   q: "Mormor følger med, uden at spørge. Stor forskel.", tone: "peach" },
            { name: "Sofie", n: "Vesterbro · 9 mdr.", q: "Endelig én app der ved hvor man kan amme om vinteren.", tone: "mint" },
            { name: "Anders", n: "Østerbro · 4 år",  q: "Vi planlægger weekenden sammen. Hverdagen blev rolig.", tone: "butter" },
          ].map((t, i) => (
            <Card key={i} padding={24} radius={RADII["2xl"]} style={{ background: p.surface, display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 200 }}>
              <div style={{ fontFamily: font.family, fontSize: 19, letterSpacing: font.tracking, lineHeight: 1.35 }}>"{t.q}"</div>
              <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 999, background: p[t.tone][200] }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontSize: 11.5, color: p.subtle }}>{t.n}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing CTA */}
      <section style={{ padding: "0 32px 80px" }}>
        <Card padding={40} radius={RADII["2xl"]} style={{ background: p.ink, color: p.bg, maxWidth: 980, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: p.mint[200] }}>Gratis under MVP</div>
            <div style={{ fontFamily: font.family, fontSize: 40, marginTop: 8, letterSpacing: font.tracking }}>Kom med før vi når 1.000 familier — bliv gratis for evigt.</div>
          </div>
          <Btn variant="accent" size="lg" iconRight={<Icon name="arrow-right" size={16} />}>Opret familie</Btn>
        </Card>
      </section>

      <footer style={{ padding: "32px", borderTop: `1px solid ${p.hairline}`, textAlign: "center", color: p.subtle, fontSize: 12.5 }}>
        © 2026 Lille Liv ApS · København · DA · EN
      </footer>
    </div>
  );
}

Object.assign(window, { LandingConversational });
