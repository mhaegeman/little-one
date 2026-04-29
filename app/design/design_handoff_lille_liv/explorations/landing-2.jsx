/* global window, React */
const { useTheme, Logo, Btn, Pill, Placeholder, Card, Icon, Blob, Display, Eyebrow, BODY_FONT, RADII, SHADOWS, PhoneMock } = window;

// ──────────────────────────────────────────────────────────────────
// Landing v2 — Editorial split-frame ("Story-led")
// Hero is split: copy left, large editorial photo right. Sections
// reuse Today/Pillars/Pricing but with denser, magazine-ish layout.
// ──────────────────────────────────────────────────────────────────

function LandingEditorial() {
  const { p } = useTheme();
  return (
    <div style={{ background: p.bg, color: p.ink, fontFamily: BODY_FONT, fontSize: 15, lineHeight: 1.5 }}>
      <TopbarE />
      <HeroEditorial />
      <PillarsEditorial />
      <TodayEditorial />
      <TestimonialEditorial />
      <PricingEditorial />
      <FooterE />
    </div>
  );
}

function TopbarE() {
  const { p } = useTheme();
  return (
    <header style={{
      padding: "20px 48px", display: "flex", alignItems: "center", justifyContent: "space-between",
      borderBottom: `1px solid ${p.hairline}`,
    }}>
      <Logo size={34} />
      <nav style={{ display: "flex", gap: 28, fontWeight: 500, fontSize: 14, color: p.muted }}>
        <a>Opdag</a><a>Journal</a><a>Familier</a><a>Priser</a><a>Om</a>
      </nav>
      <div style={{ display: "flex", gap: 10 }}>
        <Btn variant="ghost" size="sm">Log ind</Btn>
        <Btn variant="primary" size="sm">Opret familie</Btn>
      </div>
    </header>
  );
}

function HeroEditorial() {
  const { p, font } = useTheme();
  return (
    <section style={{ position: "relative", padding: "0", borderBottom: `1px solid ${p.hairline}` }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 640 }}>
        {/* Copy side */}
        <div style={{ padding: "80px 64px", display: "flex", flexDirection: "column", justifyContent: "center", borderRight: `1px solid ${p.hairline}` }}>
          <Eyebrow>Bind 01 · København 0–6</Eyebrow>
          <Display size={92} style={{ marginTop: 18 }}>
            En blød måde<br/>at holde<br/><span style={{ fontStyle: "italic", color: p.peach.ink }}>øje med</span><br/>de små år.
          </Display>
          <p style={{ marginTop: 24, fontSize: 17, color: p.muted, maxWidth: 460, lineHeight: 1.6 }}>
            Find steder. Gem øjeblikkene. Sammen. Lille Liv er en familieguide og privat journal
            for forældre, bedsteforældre og dagplejer.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
            <Btn variant="primary" size="lg">Opret familie — gratis</Btn>
            <Btn variant="secondary" size="lg" iconRight={<Icon name="arrow-up-right" size={14} />}>Læs historien</Btn>
          </div>
        </div>
        {/* Image side */}
        <div style={{ position: "relative", background: p.peach[50], padding: 28, display: "grid", placeItems: "center" }}>
          <Blob tone="butter" size={320} opacity={0.6} style={{ top: 40, right: 40 }} />
          <Blob tone="mint" size={220} opacity={0.55} style={{ bottom: 40, left: 30 }} />
          <Placeholder tone="peach" radius={RADII["2xl"]} label="Editorial photo — small hand in big hand, soft light" style={{ width: "100%", height: 460, position: "relative", zIndex: 1 }} />
          <div style={{ position: "absolute", bottom: 32, right: 32, zIndex: 2 }}>
            <Card padding={18} radius={RADII.xl} style={{ width: 220, boxShadow: SHADOWS.lift }}>
              <Eyebrow>Asta · 2 år</Eyebrow>
              <div style={{ fontFamily: font.family, fontSize: 18, marginTop: 6, letterSpacing: font.tracking }}>"Mere vand, tak"</div>
              <div style={{ fontSize: 12, color: p.subtle, marginTop: 4 }}>Første hele sætning · 14. mar.</div>
            </Card>
          </div>
        </div>
      </div>

      {/* Stat strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderTop: `1px solid ${p.hairline}` }}>
        {[
          ["38", "udvalgte steder"],
          ["1.200+", "familier i byen"],
          ["0 kr.", "for de første 1.000"],
          ["EU", "hosted & RLS-sikret"],
        ].map(([n, l], i) => (
          <div key={i} style={{ padding: "28px 32px", borderRight: i < 3 ? `1px solid ${p.hairline}` : "none" }}>
            <div style={{ fontFamily: font.family, fontSize: 40, letterSpacing: font.tracking, color: p.ink }}>{n}</div>
            <div style={{ fontSize: 13, color: p.muted, marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PillarsEditorial() {
  const { p, font } = useTheme();
  const items = [
    { tone: "mint",   icon: "compass", label: "Opdag",    body: "38 udvalgte steder. Filtrér på alder, bydel, vejr. Tilføj favoritter med ét tryk." },
    { tone: "peach",  icon: "note",    label: "Journal",  body: "Privat tidslinje pr. barn. Milepæle, ture, hverdagsglimt — kun jeres familie ser det." },
    { tone: "butter", icon: "users",   label: "Familie",  body: "Mormor, dagplejer, medforælder. Alle ind, alle ser det samme. Op til 6 medlemmer." },
  ];
  return (
    <section style={{ padding: "80px 48px", borderBottom: `1px solid ${p.hairline}` }}>
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 60, alignItems: "flex-start" }}>
          <div>
            <Eyebrow>03 — Funktioner</Eyebrow>
            <Display size={48} style={{ marginTop: 10 }}>Tre rum,<br/><span style={{ fontStyle: "italic" }}>én rolig hverdag</span>.</Display>
          </div>
          <div style={{ display: "grid", gap: 0 }}>
            {items.map((item, i) => (
              <div key={item.label} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 24, alignItems: "center", padding: "28px 0", borderTop: `1px solid ${p.hairline}`, borderBottom: i === items.length - 1 ? `1px solid ${p.hairline}` : "none" }}>
                <div style={{ width: 64, height: 64, borderRadius: 22, background: p[item.tone][100], color: p[item.tone].ink, display: "grid", placeItems: "center" }}>
                  <Icon name={item.icon} size={26} />
                </div>
                <div>
                  <div style={{ fontFamily: font.family, fontSize: 30, letterSpacing: font.tracking }}>{item.label}</div>
                  <div style={{ marginTop: 6, color: p.muted, fontSize: 14.5, maxWidth: 480 }}>{item.body}</div>
                </div>
                <Btn variant="ghost" size="sm" iconRight={<Icon name="arrow-right" size={14} />}>Se mere</Btn>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TodayEditorial() {
  const { p, font } = useTheme();
  return (
    <section style={{ padding: "80px 48px", background: p.sunken, borderBottom: `1px solid ${p.hairline}` }}>
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "stretch" }}>
          <Card padding={36} radius={RADII["2xl"]} style={{ background: p.sky[50], boxShadow: `inset 0 0 0 1px ${p.sky[100]}`, position: "relative", overflow: "hidden" }}>
            <Blob tone="sky" size={240} opacity={0.5} style={{ top: -60, right: -60 }} />
            <div style={{ position: "relative" }}>
              <Eyebrow color={p.sky.ink}>I dag i København · 14:00</Eyebrow>
              <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginTop: 16 }}>
                <div style={{ fontFamily: font.family, fontSize: 96, color: p.sky.ink, letterSpacing: "-0.04em", lineHeight: 1 }}>14°</div>
                <div style={{ fontFamily: font.family, fontSize: 26, color: p.sky.ink }}>delvist sol</div>
              </div>
              <p style={{ marginTop: 20, color: p.sky.ink, opacity: 0.85, fontSize: 15, maxWidth: 380 }}>
                Vinden er mild fra øst. Lille Liv foreslår en tur til Fælledparken efter middagsluren.
              </p>
              <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
                <Pill tone="sky" icon={<Icon name="leaf" size={12} />}>Park</Pill>
                <Pill tone="sky" icon={<Icon name="stroller" size={12} />}>Legeplads</Pill>
                <Pill tone="sky" icon={<Icon name="drop" size={12} />}>Svømning</Pill>
              </div>
            </div>
          </Card>
          <div style={{ display: "grid", gap: 16 }}>
            {[
              { tone: "mint",   title: "Fælledparken",     meta: "Park · 1.2 km · Læ om eftermiddagen",    photo: "Park photo — soft light through trees" },
              { tone: "butter", title: "Kaffe og Køkken",  meta: "Cafe · Vesterbro · Plads til klapvogn",  photo: "Cafe interior — warm wood, light textiles" },
              { tone: "peach",  title: "Hovedbiblioteket", meta: "Bibliotek · Indre by · Højtlæsning kl. 10:30", photo: "Library nook — child reading" },
            ].map((item) => (
              <Card key={item.title} padding={0} radius={RADII.xl} style={{ display: "grid", gridTemplateColumns: "140px 1fr", overflow: "hidden" }}>
                <Placeholder tone={item.tone} radius={0} label={item.photo} style={{ height: "100%" }} />
                <div style={{ padding: 20, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <Pill tone={item.tone} size="sm">{item.meta.split(" · ")[0]}</Pill>
                  <div style={{ fontFamily: font.family, fontSize: 24, marginTop: 10, letterSpacing: font.tracking }}>{item.title}</div>
                  <div style={{ marginTop: 6, fontSize: 13, color: p.muted }}>{item.meta}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialEditorial() {
  const { p, font } = useTheme();
  return (
    <section style={{ padding: "100px 48px", borderBottom: `1px solid ${p.hairline}` }}>
      <div style={{ maxWidth: 880, margin: "0 auto", textAlign: "center" }}>
        <Eyebrow>Forældre om Lille Liv</Eyebrow>
        <Display size={42} style={{ marginTop: 24, lineHeight: 1.2 }}>
          "Mormor følger nu med på Astas dage uden at spørge.<br/>
          <span style={{ fontStyle: "italic", color: p.peach.ink }}>Det har gjort en stor forskel for hende — og for os.</span>"
        </Display>
        <div style={{ marginTop: 32, display: "inline-flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 999, background: p.peach[200] }} />
          <div style={{ textAlign: "left" }}>
            <div style={{ fontWeight: 600 }}>Maja & Kasper</div>
            <div style={{ fontSize: 12.5, color: p.subtle }}>Nørrebro · Asta 2 år</div>
          </div>
        </div>
        <div style={{ marginTop: 36, display: "flex", justifyContent: "center", gap: 6 }}>
          {[0,1,2].map((i) => (
            <span key={i} style={{ width: i === 0 ? 22 : 6, height: 6, borderRadius: 999, background: i === 0 ? p.ink : p.border }} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingEditorial() {
  const { p, font } = useTheme();
  return (
    <section style={{ padding: "80px 48px" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <div style={{ padding: "20px 0" }}>
          <Eyebrow>Priser</Eyebrow>
          <Display size={56} style={{ marginTop: 12 }}>Gratis under MVP.</Display>
          <p style={{ marginTop: 18, color: p.muted, fontSize: 16, maxWidth: 420 }}>
            De første 1.000 familier beholder gratis. Senere lancerer vi en familieplan til ~29 kr./md.
          </p>
        </div>
        <Card padding={36} radius={RADII["2xl"]} style={{ background: p.peach[50], boxShadow: `inset 0 0 0 1px ${p.peach[100]}` }}>
          <Pill tone="peach" size="sm">Familie</Pill>
          <div style={{ fontFamily: font.family, fontSize: 80, color: p.peach.ink, marginTop: 18, letterSpacing: "-0.03em", lineHeight: 1 }}>
            0 <span style={{ fontSize: 18, color: p.peach.ink, opacity: 0.7, fontFamily: BODY_FONT }}>kr/md</span>
          </div>
          <div style={{ marginTop: 24, display: "grid", gap: 10 }}>
            {["Alle 38 København-steder", "Privat journal pr. barn", "Op til 6 familiemedlemmer", "Aula-sync (kommer snart)"].map((item) => (
              <div key={item} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14, color: p.peach.ink }}>
                <Icon name="check" size={14} /> {item}
              </div>
            ))}
          </div>
          <Btn variant="accent" size="lg" full style={{ marginTop: 28 }} iconRight={<Icon name="arrow-right" size={16} />}>Opret familie</Btn>
        </Card>
      </div>
    </section>
  );
}

function FooterE() {
  const { p } = useTheme();
  return (
    <footer style={{ padding: "48px", borderTop: `1px solid ${p.hairline}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Logo size={32} />
      <div style={{ display: "flex", gap: 28, fontSize: 13, color: p.muted }}>
        <a>Privatliv</a><a>Vilkår</a><a>Kontakt</a><a>DA · EN</a>
      </div>
      <div style={{ fontSize: 12.5, color: p.subtle }}>© 2026 Lille Liv ApS</div>
    </footer>
  );
}

Object.assign(window, { LandingEditorial });
