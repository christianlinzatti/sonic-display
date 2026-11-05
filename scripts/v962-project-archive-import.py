#!/usr/bin/env python3
"""Validate and import an owner-uploaded V962 full-project archive into master.

The ZIP is untrusted input. Enforce path, size, case and symlink constraints before
extracting. Protected GitHub workflow files are staged separately by the CI rule.
"""
from pathlib import Path, PurePosixPath
from zipfile import ZipFile, BadZipFile
import json
import shutil
import stat
import sys

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = ROOT / "releases/SonicDisplay-V962.zip"
REQUIRED = {
    "package.json",
    "package-lock.json",
    "lib/concertNarrativeV962.ts",
    "scripts/v962-production-verify.cjs",
    "tests/v962-concert-narrative-regression.cjs",
    ".github/workflows/v962-narrative-production-validation.yml",
    "docs/versions/V962-INTELLIGENT-CONCERT-NARRATIVE.md",
}

def main():
    if not ARCHIVE.is_file():
        raise RuntimeError(f"Missing user-uploaded archive: {ARCHIVE.relative_to(ROOT)}")
    if ARCHIVE.stat().st_size > 25 * 1024 * 1024:
        raise RuntimeError("ZIP larger than 25 MiB")
    with ZipFile(ARCHIVE) as zipped:
        entries = [e for e in zipped.infolist() if not e.is_dir()]
        names = [e.filename for e in entries]
        if len(entries) < 4000 or not REQUIRED.issubset(names):
            raise RuntimeError("Not a complete V962 project ZIP")
        if len(names) != len(set(names)) or len(names) != len(set(n.casefold() for n in names)):
            raise RuntimeError("Duplicate or case-insensitive filename collision")
        if sum(e.file_size for e in entries) > 80 * 1024 * 1024:
            raise RuntimeError("Unpacked project exceeds 80 MiB")
        for e in entries:
            posix = PurePosixPath(e.filename)
            if (posix.is_absolute() or ".." in posix.parts or "\\" in e.filename
                    or ".git" in posix.parts or not posix.parts):
                raise RuntimeError(f"Unsafe path: {e.filename}")
            if stat.S_IFMT(e.external_attr >> 16) == stat.S_IFLNK:
                raise RuntimeError(f"Symlink rejected: {e.filename}")
        pkg = json.loads(zipped.read("package.json"))
        if str(pkg.get("sonicRoadmapRelease", "")).lower() not in {"v962", "962"}:
            raise RuntimeError("Package does not advertise V962")
        corrupted = zipped.testzip()
        if corrupted:
            raise RuntimeError(f"Broken archive entry: {corrupted}")
        for e in entries:
            dest = ROOT.joinpath(*PurePosixPath(e.filename).parts)
            dest.parent.mkdir(parents=True, exist_ok=True)
            with zipped.open(e) as source, dest.open("wb") as target:
                shutil.copyfileobj(source, target, 256 * 1024)
    ARCHIVE.unlink()
    print(f"Imported {len(entries)} complete V962 files into existing project")

if __name__ == '__main__':
    try:
        main()
    except (RuntimeError, BadZipFile, OSError, ValueError) as exc:
        print(f"V962 import rejected: {exc}", file=sys.stderr)
        sys.exit(1)
