#!/usr/bin/env python3
"""Import owner-uploaded, versioned full-project ZIP files safely.

On push, select precisely one newly added/modified releases/SonicDisplay-VNNN.zip.
On manual dispatch, require an explicit ZIP filename. Version in package.json
must match the filename; do not trust or import CI workflow definitions from ZIPs.
"""

import argparse
import json
import re
import shutil
import stat
import subprocess
import sys
from pathlib import Path, PurePosixPath
from zipfile import BadZipFile, ZipFile

ARCHIVE_NAME = re.compile(r"SonicDisplay-V([1-9][0-9]*)\.zip\Z")
REQUIRED = {
    "package.json", "package-lock.json", "tsconfig.json", "app/page.tsx",
    "README.md", "lib/ultimateConcertRoadmapV958.ts",
}
MAX_ZIP_BYTES = 25 * 1024 * 1024
MAX_UNPACKED_BYTES = 80 * 1024 * 1024
MAX_ENTRIES = 10000
MIN_ENTRIES = 2500

# Only managed application/code directories are reconciled against complete ZIPs.
# Historical evidence, runtime user data, uploads, .github, and releases are NEVER
# pruned. The importer's own file and GitHub-only tests are pinned as well.
SYNC_DIRS = frozenset({
    "app", "components", "config", "context", "hooks", "integrations",
    "lib", "public", "scripts", "services", "tests", "types",
})
SYNC_PROTECTED = frozenset({
    # These support the protected, version-independent production workflow.
    "scripts/production-workflow-metadata.cjs", "tests/production-workflow-regression.cjs",
    "scripts/project-archive-import.py", "tests/test_project_archive_import.py",
    "scripts/organize-project-structure.cjs", "tests/v974-repository-cleanup-regression.cjs",
})


def is_managed_source(name):
    parts = PurePosixPath(name).parts
    return (len(parts) >= 2 and name not in SYNC_PROTECTED and
            (parts[0] in SYNC_DIRS or re.fullmatch(r"v[0-9]+", parts[0]) is not None))


def plan_tracked_prune(root, archive_files):
    """Return Git-tracked stale files only; fail closed if Git isn't available.

    This is not a recursive deletion: ignored/untracked files and protected
    project documentation, runtime data, release ZIPs and workflows survive.
    """
    try:
        result = subprocess.run(
            ["git", "ls-files", "--cached", "--full-name", "-z"],
            cwd=root, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True,
        )
    except (OSError, subprocess.CalledProcessError) as exc:
        raise ValueError(f"Cannot inspect Git-tracked files for safe cleanup: {exc}") from exc
    tracked = [entry.decode("utf-8", errors="surrogateescape")
               for entry in result.stdout.split(b"\0") if entry]
    managed = [path for path in tracked if is_managed_source(path)]
    stale = sorted(path for path in managed if path not in archive_files)
    # A major shrink usually indicates an incomplete or wrong archive. Stop
    # rather than deleting an unexpectedly large fraction of the project.
    if len(managed) >= 100 and len(stale) > max(50, len(managed) // 10):
        raise ValueError(f"Unsafe source shrink: {len(stale)} of {len(managed)} managed Git files "
                         "are absent from ZIP (over 10%); import cancelled")
    for name in stale:
        path = root.joinpath(*PurePosixPath(name).parts)
        if not path.is_file() and not path.is_symlink():
            raise ValueError(f"Tracked cleanup target is not a file: {name}")
        if any(parent.is_symlink() for parent in path.parents if parent != root.parent):
            raise ValueError(f"Refusing cleanup under symlink: {name}")
    return stale


def write_prune_report(path, version, removed, dry_run):
    if not path:
        return
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps({
        "schema": "sonic-tracked-source-prune-v1", "version": version,
        "dry_run": bool(dry_run), "count": len(removed), "paths": removed,
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def prune_tracked_files(root, stale):
    for name in stale:
        target = root.joinpath(*PurePosixPath(name).parts)
        target.unlink()
        parent = target.parent
        # Git does not track directories. Remove newly empty directories only.
        while parent != root:
            try:
                parent.rmdir()
            except OSError:
                break
            parent = parent.parent



def checked_name(value):
    """Return (basename, version); never accept arbitrary checkout paths."""
    name = value.removeprefix("releases/")
    match = ARCHIVE_NAME.fullmatch(name)
    if not match or name != Path(name).name:
        raise ValueError("Expected a filename like SonicDisplay-V969.zip in releases/")
    return name, int(match.group(1))


def outputs(path, values):
    for key, value in values.items():
        line = f"{key}={value}\n"
        if path:
            with open(path, "a", encoding="utf-8") as stream:
                stream.write(line)
        else:
            print(line.strip())


def select_archive(root, manual, before, head):
    if manual:
        name, _ = checked_name(manual)
        if not (root / "releases" / name).is_file():
            raise ValueError(f"Archive not present in releases/: {name}")
        return name
    if not (re.fullmatch(r"[0-9a-f]{40}", before or "") and
            re.fullmatch(r"[0-9a-f]{40}", head or "") and
            before != "0" * 40):
        raise ValueError("A valid push before/head SHA is required; otherwise use manual dispatch")
    changed = subprocess.check_output(
        ["git", "diff", "--name-only", "--diff-filter=AM", before, head, "--", "releases/"],
        cwd=root, text=True,
    ).splitlines()
    valid = [PurePosixPath(entry).name for entry in changed
             if entry.startswith("releases/") and ARCHIVE_NAME.fullmatch(PurePosixPath(entry).name)]
    if len(valid) != 1:
        raise ValueError(f"Expected exactly one newly added/modified versioned ZIP, found {len(valid)}. "
                         "Use workflow_dispatch with an explicit ZIP name for a retry")
    return valid[0]


def validate_member(info):
    filename = info.filename
    p = PurePosixPath(filename)
    if (not filename or p.is_absolute() or filename.startswith("/") or
            "\\" in filename or "\x00" in filename or p.as_posix() != filename or
            any(part in ("", ".", "..") for part in p.parts) or
            any(part.lower() == ".git" for part in p.parts) or
            any(part.endswith((".", " ")) for part in p.parts)):
        raise ValueError(f"Unsafe ZIP path: {filename!r}")
    if stat.S_IFMT(info.external_attr >> 16) not in (0, stat.S_IFREG):
        raise ValueError(f"Non-regular ZIP entry rejected: {filename!r}")
    if p.parts[0].lower() in ("releases", "node_modules") or (filename.startswith(".env") and filename != ".env.example"):
        raise ValueError(f"Forbidden ZIP target: {filename!r}")
    return p


def import_archive(root, requested, output=None, dry_run=False, sync_tracked=False, prune_report=None):
    name, version = checked_name(requested)
    archive = root / "releases" / name
    if not archive.is_file() or archive.is_symlink():
        raise ValueError(f"Missing regular archive file: releases/{name}")
    if archive.stat().st_size > MAX_ZIP_BYTES:
        raise ValueError("ZIP exceeds 25 MiB")
    with ZipFile(archive) as zf:
        entries = [entry for entry in zf.infolist() if not entry.is_dir()]
        names = [entry.filename for entry in entries]
        if not MIN_ENTRIES <= len(entries) <= MAX_ENTRIES:
            raise ValueError(f"Incomplete/unexpected file count: {len(entries)}")
        if not REQUIRED.issubset(names):
            raise ValueError(f"Missing essential project files: {sorted(REQUIRED - set(names))}")
        if len(set(names)) != len(names) or len({n.casefold() for n in names}) != len(names):
            raise ValueError("Duplicate or case-insensitive filename collision")
        if sum(entry.file_size for entry in entries) > MAX_UNPACKED_BYTES:
            raise ValueError("Uncompressed project exceeds 80 MiB")
        all_paths = [validate_member(entry) for entry in entries]
        package = json.loads(zf.read("package.json"))
        marker = str(package.get("sonicRoadmapRelease", "")).lower().removeprefix("v")
        if marker != str(version):
            raise ValueError(f"Release mismatch: ZIP is V{version}, package.json says "
                             f"sonicRoadmapRelease={package.get('sonicRoadmapRelease')!r}")
        current_package = root / "package.json"
        if current_package.is_file():
            current = json.loads(current_package.read_text(encoding="utf-8"))
            current_marker = str(current.get("sonicRoadmapRelease", "")).lower().removeprefix("v")
            if current_marker.isdecimal() and version < int(current_marker):
                raise ValueError(f"Refusing release rollback from V{current_marker} to V{version}")
        corrupted = zf.testzip()
        if corrupted:
            raise ValueError(f"Corrupt ZIP entry: {corrupted}")
        planned = []
        skipped = []
        for entry, rel in zip(entries, all_paths):
            # Uploaded ZIPs never get to replace GitHub Actions or their own validator.
            if rel.parts[0].casefold() == ".github" or str(rel).casefold() == "scripts/project-archive-import.py":
                skipped.append(str(rel))
                continue
            dest = root.joinpath(*rel.parts)
            if dest.is_symlink() or any(parent.is_symlink() for parent in dest.parents if parent != root.parent):
                raise ValueError(f"Target includes a symlink: {rel}")
            planned.append((entry, dest))
        stale = plan_tracked_prune(root, set(names)) if sync_tracked else []
        write_prune_report(prune_report, version, stale, dry_run)
        if not dry_run:
            for entry, dest in planned:
                dest.parent.mkdir(parents=True, exist_ok=True)
                with zf.open(entry) as source, dest.open("wb") as target:
                    shutil.copyfileobj(source, target, length=256 * 1024)
            prune_tracked_files(root, stale)
    if not dry_run:
        archive.unlink()
    outputs(output, {"version": version, "archive": name, "files": len(planned), "removed": len(stale)})
    print(f"Validated V{version}: {len(entries)} entries; "+
          f"{'would import' if dry_run else 'imported'} {len(planned)} files, "
          f"preserved {len(skipped)} protected paths; "
          f"{'would remove' if dry_run else 'removed'} {len(stale)} stale managed Git files")
    for old in stale[:40]:
        print(f"  {'would remove' if dry_run else 'removed'}: {old}")
    if len(stale) > 40:
        print(f"  ... {len(stale) - 40} additional paths (see prune report)")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--select", action="store_true")
    parser.add_argument("--archive", default="")
    parser.add_argument("--manual", default="")
    parser.add_argument("--before", default="")
    parser.add_argument("--head", default="")
    parser.add_argument("--output", default="")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--sync-tracked", action="store_true",
                        help="Remove missing Git-tracked code files from managed directories")
    parser.add_argument("--prune-report", default="",
                        help="Write audited JSON listing all planned/removed files")
    args = parser.parse_args()
    try:
        root = args.root.resolve()
        if args.select:
            name = select_archive(root, args.manual, args.before, args.head)
            outputs(args.output, {"archive": name})
        else:
            if not args.archive:
                raise ValueError("--archive required")
            import_archive(root, args.archive, output=args.output or None,
                           dry_run=args.dry_run, sync_tracked=args.sync_tracked,
                           prune_report=args.prune_report or None)
    except (ValueError, BadZipFile, OSError, subprocess.CalledProcessError, json.JSONDecodeError) as exc:
        print(f"Sonic Display ZIP import rejected: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
