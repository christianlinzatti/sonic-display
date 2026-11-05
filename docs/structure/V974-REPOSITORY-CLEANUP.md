# V974 – GitHub Repository Cleanup & Maintenance

This is a **conservative cleanup**, not a deletion of the live application.
The last imported source on `master` at the start of the cleanup was **V971**.
V972/V973 were available as complete ZIP releases but had not yet been imported
to GitHub, so this cleanup intentionally does **not** rename the app release.

## Safety / restore point

Backup Git ref:
`backup/pre-v974-cleanup-20261105` (source commit `7a6632129865b6a03d68ca381175c3a5113229d9`).
If an unexpected regression appears, compare against or restore files from
that branch rather than rewriting the published commit history.

## Git tree audit

- 98 historical Markdown documents already existed with identical Git blob SHAs
  under `docs/`. Remove only the redundant root copies.
- 47 root evidence files already existed identically under `artifacts/`.
  Remove only those redundant root copies.
- 25 historical root evidence files lacked an identical sibling. Move them into
  `artifacts/historical/recovered-root/`, preserving their original Git blobs.
- 17 stale files under `v874/`…`v878/` were byte-identical to active
  counterparts or existing `artifacts/legacy-snapshots/`; remove stale paths.
- 7 root-only installer scripts already exist identically under
  `docs/history/retired-installers/`; remove executable root copies.
- Move two additional historical items from `backups/` and
  `verification-v730/` to the archive; remove one generated
  `tsconfig.tsbuildinfo` cache and ignore it in Git going forward.
- Result: root contains only the 13 intentionally maintained files.
  `app/`, `components/`, `lib/`, `services/`, `integrations/`,
  `scripts/`, `tests/`, `.github/` and `releases/` remain intact.

These operations move/delete only paths whose provenance was verified
against the repository tree. They do **not** purge Git history or delete
user data, secrets, or the active application.

## Ongoing hygiene

The version-neutral import workflow now runs
`node scripts/organize-project-structure.cjs` after importing any
`releases/SonicDisplay-VNNN.zip`, before staging the change. It then
runs the inherited V966 structure regression and the V974 cleanup regression.
An unknown source conflict **fails closed** instead of silently overwriting.

Full TypeScript and Next.js production validation still run in the
separate existing CI. A clean repository tree alone is not proof
that a new application build has succeeded.
