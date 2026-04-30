# GitHub issue template — QA finding

Use this body verbatim (with the placeholders filled) when calling `mcp__github__issue_write` (action: `create`) on `mhaegeman/little-one`.

## Title

`<area>: <short symptom>` — e.g. `discover: cluster click on mobile zooms past max and shows blank tiles`

Rules:
- Lowercase area prefix.
- Imperative-free; describe the symptom, not the fix.
- 70 characters or less.
- Prefix `[Static analysis]` if you couldn't actually reproduce in a browser.

## Body

```markdown
## Summary

<One or two sentences: what is broken, where.>

## Steps to reproduce

1. <Step>
2. <Step>
3. <Step>

## Expected

<What should happen.>

## Actual

<What does happen. Include exact error text if any.>

## Environment

- Route: `<path>`
- Locale: `<da | en | both>`
- Viewport: `<mobile 375 | tablet 768 | desktop 1280 | all>`
- Browser/driver: `<Playwright | curl | static-analysis>`
- Branch: `<git branch name at time of test>`
- Commit: `<short sha>`

## Evidence

<Pick what applies; delete the rest.>

- Console error:
  ```
  <paste>
  ```
- Network: `<METHOD> <URL>` returned `<status>` (expected `<status>`)
- Server log:
  ```
  <paste>
  ```
- Screenshot: `<path or attachment description>`
- Code pointer: `<path/to/file.tsx:LINE>`

## Suspected cause

<Only fill if you read the code. Reference `path:line`. Otherwise delete this section.>

## Severity

`P0` / `P1` / `P2` / `P3` — see SKILL.md rubric.

---
Filed by the `qa-tester` skill.
```

## Labels

Always include:
- `bug`
- `qa`

Severity (one of):
- `severity:P0`
- `severity:P1`
- `severity:P2`
- `severity:P3`

Area (one of):
- `area:discover`
- `area:journal`
- `area:families`
- `area:profile`
- `area:onboarding`
- `area:auth`
- `area:marketing`
- `area:i18n`
- `area:a11y`
- `area:infra`

If a label doesn't exist on the repo, omit it (don't fail the call) and note the missing label in the final run report.

## Examples

### Good title
- `journal: photo upload silently fails for HEIC files`
- `discover: filter "neighbourhood=Nørrebro" returns Vesterbro venues`
- `i18n: profile.visibility.publicHelp missing in en.json — falls back to key`
- `a11y: family card has no accessible name in screen-reader`

### Bad title (rewrite)
- ❌ `Bug in discover` → too vague
- ❌ `Fix the cluster click bug` → describes fix, not symptom
- ❌ `When I click on a marker cluster on mobile the map zooms in past the max zoom level and the tiles go blank` → too long; move detail to body
