# Automatic production and Playwright workflow

The Actions sidebar uses the stable name **Sonic Display · Production & Playwright**.
After each ZIP import, the importer dispatches it with the package release and exact
import commit. The run then appears as **Sonic Display · V1005 · Production & Playwright**
(or the next version automatically). Both platform job names and artifact names use
the release read from the checked-out `package.json`.

The workflow filename remains `v965-room-wave-production.yml` for compatibility with
older importers. This filename does not select an old application version.

There is one automatic Linux/Windows production matrix for source pushes to `master`
and pull requests. ZIP-only uploads run the importer first; that importer dispatches
the matrix after importing. Documentation-only changes do not build the application.
Normal push/PR run titles show the event; the platform job names resolve the package
version automatically. GitHub evaluates `run-name` before a job can read repository files.

The central matrix retains recent feature regressions, release integrity checks,
the inherited full TypeScript/Next.js gate, fresh build artifact checks, and Playwright
against `next start`. Older version-specific workflows remain available through
**Run workflow** and no longer start on every source or ZIP upload. Scheduled historical
regressions, the ZIP importer, documentation maintenance and deployment reachability
remain separate because they perform different tasks.

The imported commit is pinned for both platform jobs. A dispatched version or revision
that differs from the checked-out package or commit fails before dependency installation.
A newer run supersedes the older production run on the same branch/PR.

Each platform uploads `sonic-V<version>-<os>-production` even after a failure:

- Production proofs and full regression logs.
- Playwright JSON and HTML reports.
- Screenshots and traces for failed tests.

Download the artifact to inspect the HTML report locally with `npx playwright show-report`
or inspect a trace with `npx playwright show-trace`. The JSON proofs and job summary
provide the overall status without needing to open the HTML report.

The workflow metadata helper and routing test are protected from the ZIP importer's
obsolete-source pruning, so an otherwise valid ZIP created before these helpers existed
cannot accidentally remove the files needed by the protected workflow.

Changes to `.github/**` must be committed through GitHub; the ZIP importer deliberately
preserves workflow files. This change does not require another application version ZIP.
