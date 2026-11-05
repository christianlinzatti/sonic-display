# V985 – Predictive Show Timeline

- Verified-V604-only V763 scene gate for song- and duration-bound V354 cues.
- Story energy is decorative style only; no invented musical event timestamps.
- Two-second **preview-only** anticipation for the next confirmed cue.
- Optional reviewed import of bounded camera, virtual lighting, dance and FX clips.
- Existing manual timeline conflicts are skipped. Inactive scores remain inactive.
- Safe V764-backed creation for a missing song score; no hardware commands.
- V985 focused regression, isolated type check and mandatory CI/Vercel gates.

**Validation:** Local focused regressions and syntax/architecture checks. Full
TypeScript and Next.js build are pending actual `npm ci`/CI execution.
