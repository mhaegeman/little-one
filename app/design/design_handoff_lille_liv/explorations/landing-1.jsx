/* global window, React */
const { useTheme, Logo, Btn, Pill, Placeholder, Card, Icon, Blob, Display, Eyebrow, BODY_FONT, RADII, SHADOWS } = window;

// ──────────────────────────────────────────────────────────────────
// Landing v1 — Hero-led, generous & airy ("Mint primary")
// Sections: Topbar · Hero · Today in CPH · Pillars · Testimonials · Pricing · Footer
// ──────────────────────────────────────────────────────────────────

function LandingHeroLed() {
  const { p, font } = useTheme();
  return (
    <div style={{ background: p.bg, color: p.ink, fontFamily: BODY_FONT, fontSize: 15, lineHeight: 1.5 }}>
      <Topbar />
      <Hero />
      <TodayBand />
      <Pillars />
      <Testimonials />
      <PricingBlock />
      <Footer />
    </div>
  );
}

// ── Topbar ────────────────────────────────────────────────────────
function Topbar() {
  const { p } = useTheme();
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 5,
      padding: "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between",
      background: `${p.bg}d9`, backdropFilter: "blur(10px)",
      borderBottom: `1px solid ${p.hairline}`,
    }}>
      <Logo size={36} />
      <nav style={{ display: "flex", alignItems: "center", gap: 28, fontWeight: 500, fontSize: 14, color: p.muted }}>
        <a style={{ color: "inherit" }}>Opdag</a>
        <a style={{ color: "inherit" }}>Journal</a>
        <a style={{ color: "inherit" }}>Familier</a>
        <a style={{ color: "inherit" }}>Priser</a>
      </nav>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Pill tone="sunken" size="sm" icon={<Icon name="globe" size={12} />}>DA</Pill>
        <Btn variant="ghost" size="sm">Log ind</Btn>
        <Btn variant="primary" size="sm" iconRight={<Icon name="arrow-right" size={14} />}>Kom i gang</Btn>
      </div>
    </header>
  );
}

// ── Hero ──────────────────────────────────────────────────────────
function Hero() {
  const { p, font } = useTheme();
  return (
    <section style={{ position: "relative", padding: "72px 40px 96px", overflow: "hidden" }}>
      <Blob tone="peach"  size={340} opacity={0.7} style={{ top: -80, right: -60 }} />
      <Blob tone="butter" size={260} opacity={0.55} style={{ bottom: -100, left: 80 }} />
      <Blob tone="mint"   size={180} opacity={0.55} style={{ top: 220, left: -40 }} />

      <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 48, alignItems: "center", maxWidth: 1240, margin: "0 auto" }}>
        <div>
          <Pill tone="mint" icon={<span style={{ width: 6, height: 6, borderRadius: 999, background: p.mint[300] }} />}>
            Familieguide for København · 0–6 år
          </Pill>
          <Display size={84} style={{ marginTop: 22 }}>
            Find steder.<br/>
            <span style={{ fontStyle: "italic", color: p.peach.ink }}>Gem øjeblikkene.</span><br/>
            Sammen.
          </Display>
          <p style={{ marginTop: 22, fontSize: 18, color: p.muted, maxWidth: 480, lineHeight: 1.55 }}>
            Lille Liv samler caféer, legepladser og biblioteker i hele byen — og en privat journal,
            hvor I og bedsteforældre kan dele hverdagsglimt og milepæle.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 30, alignItems: "center" }}>
            <Btn variant="primary" size="lg" iconRight={<Icon name="arrow-right" size={16} />}>Opret familie — gratis</Btn>
            <Btn variant="ghost" size="lg" icon={<Icon name="play" size={14} />}>Se 60 sek. tur</Btn>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 26, color: p.subtle, fontSize: 13 }}>
            <div style={{ display: "flex" }}>
              {["peach", "butter", "mint", "sky"].map((t, i) => (
                <div key={t} style={{
                  width: 28, height: 28, borderRadius: 999, background: p[t][200],
                  marginLeft: i ? -8 : 0, boxShadow: `0 0 0 2px ${p.bg}`,
                }} />
              ))}
            </div>
            <span>+1.200 forældre i København bruger Lille Liv</span>
          </div>
        </div>

        {/* Hero visual — phone with Discover preview */}
        <div style={{ position: "relative" }}>
          <PhoneMock>
            <DiscoverPreview />
          </PhoneMock>
          {/* Floating cards */}
          <Card padding={14} style={{
            position: "absolute", top: 60, left: -36, width: 200,
            display: "flex", alignItems: "center", gap: 10, boxShadow: SHADOWS.lift,
          }}>
            <Placeholder tone="mint" radius={12} style={{ width: 44, height: 44 }} />
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>Første smil</div>
              <div style={{ fontSize: 11, color: p.subtle }}>Asta · 4 mdr.</div>
            </div>
          </Card>
          <Card padding={12} style={{
            position: "absolute", bottom: 60, right: -32, width: 220,
            background: p.mint[50], boxShadow: SHADOWS.lift,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 999, background: p.mint[200], display: "grid", placeItems: "center", color: p.mint.ink }}>
              <Icon name="sun" size={18} />
            </div>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: p.mint.ink }}>I dag · 14°</div>
              <div style={{ fontSize: 12, color: p.muted }}>Perfekt til Fælledparken</div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

// ── Phone mock ────────────────────────────────────────────────────
function PhoneMock({ children, w = 320, h = 660 }) {
  const { p } = useTheme();
  return (
    <div style={{
      width: w, height: h, margin: "0 auto",
      background: p.ink, padding: 9, borderRadius: 48,
      boxShadow: "0 30px 60px rgba(31,28,22,0.18), 0 6px 12px rgba(31,28,22,0.08)",
    }}>
      <div style={{ width: "100%", height: "100%", borderRadius: 40, overflow: "hidden", background: p.bg, position: "relative" }}>
        {/* notch */}
        <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", width: 100, height: 24, background: p.ink, borderRadius: 999, zIndex: 3 }} />
        {children}
      </div>
    </div>
  );
}

// ── Discover preview (phone content) ──────────────────────────────
function DiscoverPreview() {
  const { p, font } = useTheme();
  return (
    <div style={{ padding: "44px 16px 20px", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Eyebrow>Opdag</Eyebrow>
          <div style={{ fontFamily: font.family, fontSize: 24, marginTop: 2, letterSpacing: font.tracking }}>God formiddag, Maja</div>
        </div>
        <div style={{ width: 36, height: 36, borderRadius: 999, background: p.peach[200] }} />
      </div>

      {/* search */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: p.surface, borderRadius: RADII.pill, boxShadow: `inset 0 0 0 1px ${p.hairline}`, fontSize: 13, color: p.subtle }}>
        <Icon name="search" size={14} /> Cafe, legeplads, Østerbro…
      </div>

      {/* chips */}
      <div style={{ display: "flex", gap: 6, overflow: "hidden" }}>
        <Pill tone="mint" size="sm">Legeplads</Pill>
        <Pill tone="sunken" size="sm">Cafe</Pill>
        <Pill tone="sunken" size="sm">Bibliotek</Pill>
      </div>

      {/* today card */}
      <Card padding={14} radius={RADII.lg} style={{ background: p.peach[50], boxShadow: `inset 0 0 0 1px ${p.peach[100]}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <Eyebrow color={p.peach.ink}>I dag</Eyebrow>
            <div style={{ fontFamily: font.family, fontSize: 18, color: p.peach.ink, marginTop: 4 }}>14° · Sol &amp; vind</div>
          </div>
          <Icon name="sun" size={28} color={p.peach[300]} />
        </div>
        <div style={{ marginTop: 8, fontSize: 12.5, color: p.peach.ink, opacity: 0.85 }}>
          Perfekt til en tur i Fælledparken eller is på Nordhavn.
        </div>
      </Card>

      {/* venue card */}
      <Card padding={12} style={{ display: "flex", gap: 12 }}>
        <Placeholder tone="mint" radius={14} style={{ width: 70, height: 70 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600 }}>Plantebørnehaven</div>
          <div style={{ fontSize: 11.5, color: p.subtle, marginTop: 2 }}>Indendørs leg · Nørrebro</div>
          <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
            <Pill tone="sunken" size="sm">0–3 år</Pill>
            <Pill tone="sky" size="sm">Inde</Pill>
          </div>
        </div>
      </Card>
      <Card padding={12} style={{ display: "flex", gap: 12 }}>
        <Placeholder tone="butter" radius={14} style={{ width: 70, height: 70 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600 }}>Kaffe og Køkken</div>
          <div style={{ fontSize: 11.5, color: p.subtle, marginTop: 2 }}>Cafe · Vesterbro · 0,4 km</div>
        </div>
      </Card>
    </div>
  );
}

// ── Today band ────────────────────────────────────────────────────
function TodayBand() {
  const { p, font } = useTheme();
  return (
    <section style={{ padding: "60px 40px", background: p.sunken }}>
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
          <div>
            <Eyebrow>I dag i København</Eyebrow>
            <Display size={42} style={{ marginTop: 6 }}>Lille Liv ved hvad vejret kan</Display>
          </div>
          <a style={{ display: "inline-flex", gap: 6, alignItems: "center", fontWeight: 600, color: p.muted, fontSize: 14 }}>
            Se dagens forslag <Icon name="arrow-right" size={14} />
          </a>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 16 }}>
          {/* Big weather card */}
          <Card padding={28} radius={RADII["2xl"]} style={{ background: p.sky[50], boxShadow: `inset 0 0 0 1px ${p.sky[100]}`, position: "relative", overflow: "hidden" }}>
            <Blob tone="sky" size={200} opacity={0.6} style={{ top: -50, right: -50 }} />
            <div style={{ position: "relative" }}>
              <Eyebrow color={p.sky.ink}>Onsdag · 14:00</Eyebrow>
              <div style={{ fontFamily: font.family, fontSize: 64, color: p.sky.ink, letterSpacing: font.tracking, marginTop: 8, lineHeight: 1 }}>14° <span style={{ fontSize: 28 }}>delvist sol</span></div>
              <div style={{ marginTop: 16, color: p.sky.ink, fontSize: 14, opacity: 0.85, maxWidth: 360 }}>
                Vinden er mild fra øst. God dag til legeplads med læ — eller en babysvømme-tid efter middagsluren.
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
                <Pill tone="sky" size="sm" icon={<Icon name="stroller" size={12} />}>Legeplads</Pill>
                <Pill tone="sky" size="sm" icon={<Icon name="drop" size={12} />}>Svømning</Pill>
                <Pill tone="sky" size="sm" icon={<Icon name="leaf" size={12} />}>Park</Pill>
              </div>
            </div>
          </Card>

          {/* suggestion 1 */}
          <Card padding={0} radius={RADII["2xl"]} style={{ overflow: "hidden" }}>
            <Placeholder tone="mint" radius={0} label="Fælledparken — soft scandi photo" style={{ height: 160 }} />
            <div style={{ padding: 18 }}>
              <Pill tone="mint" size="sm">Park</Pill>
              <div style={{ fontFamily: font.family, fontSize: 22, marginTop: 10, letterSpacing: font.tracking }}>Fælledparken</div>
              <div style={{ fontSize: 13, color: p.muted, marginTop: 4 }}>Læ om eftermiddagen · 1.2 km</div>
            </div>
          </Card>

          {/* suggestion 2 */}
          <Card padding={0} radius={RADII["2xl"]} style={{ overflow: "hidden" }}>
            <Placeholder tone="butter" radius={0} label="Kaffe og Køkken — interior" style={{ height: 160 }} />
            <div style={{ padding: 18 }}>
              <Pill tone="butter" size="sm">Cafe</Pill>
              <div style={{ fontFamily: font.family, fontSize: 22, marginTop: 10, letterSpacing: font.tracking }}>Kaffe og Køkken</div>
              <div style={{ fontSize: 13, color: p.muted, marginTop: 4 }}>Plads til klapvogn · Vesterbro</div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

// ── Pillars ───────────────────────────────────────────────────────
function Pillars() {
  const { p, font } = useTheme();
  const items = [
    { tone: "mint",   icon: "compass", title: "Opdag", body: "38 udvalgte steder i København — caféer med plads til klapvogn, legepladser med læ og biblioteker med højtlæsning.", footer: "Filtrer på alder, bydel og vejr" },
    { tone: "peach",  icon: "note",    title: "Journal", body: "En privat tidslinje per barn: milepæle, små ture og hverdagsglimt. Ingen offentlig deling — kun jer.", footer: "RLS-sikret · EU-hosted" },
    { tone: "butter", icon: "users",   title: "Familie", body: "Inviter bedsteforældre, dagplejer eller medforælder ind. Alle ser det samme — og kan tilføje deres egne små glimt.", footer: "Op til 6 medlemmer" },
  ];
  return (
    <section style={{ padding: "96px 40px" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: 660, margin: "0 auto 48px" }}>
          <Eyebrow>Hvad er Lille Liv?</Eyebrow>
          <Display size={52} style={{ marginTop: 8 }}>Tre rum til familielivet — <span style={{ fontStyle: "italic", color: p.mint.ink }}>roligt samlet</span>.</Display>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
          {items.map((item) => (
            <Card key={item.title} padding={28} radius={RADII["2xl"]} style={{ background: p[item.tone][50], boxShadow: `inset 0 0 0 1px ${p[item.tone][100]}`, display: "flex", flexDirection: "column", gap: 16, minHeight: 320 }}>
              <div style={{ width: 56, height: 56, borderRadius: 18, background: p[item.tone][200], display: "grid", placeItems: "center", color: p[item.tone].ink }}>
                <Icon name={item.icon} size={26} />
              </div>
              <div style={{ fontFamily: font.family, fontSize: 32, color: p[item.tone].ink, letterSpacing: font.tracking }}>{item.title}</div>
              <div style={{ color: p.ink, opacity: 0.85, fontSize: 15, flex: 1 }}>{item.body}</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: p[item.tone].ink, opacity: 0.7, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Icon name="check" size={14} /> {item.footer}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────────
function Testimonials() {
  const { p, font } = useTheme();
  const items = [
    { name: "Maja & Kasper", neighbourhood: "Nørrebro · Asta 2 år", body: "Mormor følger nu med på Astas dage uden at spørge. Det har gjort en stor forskel for hende — og for os." },
    { name: "Sofie",         neighbourhood: "Vesterbro · Theo 9 mdr.", body: "Endelig én app der ved hvor man kan amme i fred om vinteren. Filtrene på indendørs er guld værd." },
    { name: "Anders",        neighbourhood: "Østerbro · Vilja 4 år",   body: "Vi planlægger weekenden sammen i appen. Asta ved hvor vi skal hen, og det gør hverdagen rolig." },
  ];
  return (
    <section style={{ padding: "60px 40px 96px", background: p.bg }}>
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
          <div>
            <Eyebrow>Forældre i København</Eyebrow>
            <Display size={42} style={{ marginTop: 6 }}>Hverdage gjort lidt nemmere</Display>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
          {items.map((t, i) => (
            <Card key={i} padding={28} radius={RADII["2xl"]} style={{ background: i === 1 ? p.peach[50] : p.surface, boxShadow: i === 1 ? `inset 0 0 0 1px ${p.peach[100]}` : `inset 0 0 0 1px ${p.hairline}` }}>
              <div style={{ fontFamily: font.family, fontSize: 22, lineHeight: 1.35, letterSpacing: font.tracking, color: i === 1 ? p.peach.ink : p.ink }}>
                "{t.body}"
              </div>
              <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 999, background: p[["mint","peach","butter"][i]][200] }} />
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: p.subtle }}>{t.neighbourhood}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pricing ───────────────────────────────────────────────────────
function PricingBlock() {
  const { p, font } = useTheme();
  return (
    <section style={{ padding: "60px 40px 96px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <Card padding={48} radius={RADII["2xl"]} style={{ background: p.mint[50], boxShadow: `inset 0 0 0 1px ${p.mint[100]}`, position: "relative", overflow: "hidden" }}>
          <Blob tone="mint" size={260} opacity={0.6} style={{ top: -80, right: -60 }} />
          <Blob tone="butter" size={180} opacity={0.4} style={{ bottom: -60, left: -40 }} />
          <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 40, alignItems: "center" }}>
            <div>
              <Pill tone="mint" size="sm">Lige nu</Pill>
              <Display size={48} style={{ marginTop: 14, color: p.mint.ink }}>Gratis under MVP — for evigt for de første 1.000 familier.</Display>
              <p style={{ marginTop: 14, color: p.mint.ink, opacity: 0.85, fontSize: 15.5, maxWidth: 460 }}>
                Vi bygger Lille Liv i åbenhed. Senere lancerer vi en familieplan til ~29 kr./md — men dem der hopper med nu, beholder gratis.
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
                <Btn variant="primary" size="lg" iconRight={<Icon name="arrow-right" size={16} />}>Opret familie</Btn>
                <Btn variant="ghost" size="lg">Se hvad der er med</Btn>
              </div>
            </div>
            <Card padding={24} radius={RADII.xl} style={{ background: p.surface }}>
              <div style={{ fontFamily: font.family, fontSize: 28, letterSpacing: font.tracking }}>Familie</div>
              <div style={{ marginTop: 4, color: p.subtle, fontSize: 13 }}>Op til 6 medlemmer</div>
              <div style={{ marginTop: 18, fontFamily: font.family, fontSize: 56, color: p.ink, letterSpacing: "-0.03em", lineHeight: 1 }}>
                0 <span style={{ fontSize: 16, color: p.subtle, fontFamily: BODY_FONT }}>kr/md</span>
              </div>
              <div style={{ marginTop: 22, display: "grid", gap: 10 }}>
                {["Alle 38 København-steder", "Privat journal pr. barn", "Inviter bedsteforældre & dagplejer", "Aula-sync (kommer snart)"].map((item) => (
                  <div key={item} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14 }}>
                    <span style={{ width: 22, height: 22, borderRadius: 999, background: p.mint[100], color: p.mint.ink, display: "grid", placeItems: "center" }}><Icon name="check" size={13} /></span>
                    {item}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </Card>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────
function Footer() {
  const { p, font } = useTheme();
  return (
    <footer style={{ padding: "56px 40px 40px", background: p.ink, color: p.bg }}>
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: 40 }}>
          <div>
            <Logo size={36} accentTone="accent" />
            <p style={{ marginTop: 14, color: p.bg, opacity: 0.65, fontSize: 13.5, maxWidth: 320 }}>
              Familieliv i København, samlet og roligt. Lavet i Nordvest af to forældre på orlov.
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
              <Pill tone="inkChip" size="sm" icon={<Icon name="globe" size={12} />} style={{ background: "rgba(255,255,255,0.08)", color: p.bg, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.15)" }}>DA · EN</Pill>
              <Pill tone="inkChip" size="sm" icon={<Icon name="lock" size={12} />} style={{ background: "rgba(255,255,255,0.08)", color: p.bg, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.15)" }}>EU-hosted</Pill>
            </div>
          </div>
          {[
            ["Produkt", ["Opdag", "Journal", "Familier", "Aula-sync"]],
            ["Selskab", ["Om os", "Privatliv", "Vilkår", "Kontakt"]],
            ["Kom i gang", ["Opret familie", "Log ind", "Inviter bedsteforældre", "Hent app"]],
          ].map(([h, items]) => (
            <div key={h}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: p.bg, opacity: 0.55 }}>{h}</div>
              <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                {items.map((i) => <a key={i} style={{ color: p.bg, opacity: 0.85, fontSize: 14 }}>{i}</a>)}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 48, paddingTop: 22, borderTop: "1px solid rgba(255,255,255,0.12)", display: "flex", justifyContent: "space-between", color: p.bg, opacity: 0.55, fontSize: 12.5 }}>
          <span>© 2026 Lille Liv ApS · CVR 44 12 09 87</span>
          <span>Lavet med omtanke i København</span>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { LandingHeroLed, PhoneMock, DiscoverPreview, Topbar, Hero, TodayBand, Pillars, Testimonials, PricingBlock, Footer });
