#!/usr/bin/env python3
"""Import an exact V960 full-project ZIP into an existing git checkout.

Only run this against a ZIP intentionally uploaded to the repository by its owner.
The archive is removed from the working tree after verified extraction.
"""
from pathlib import Path, PurePosixPath
from zipfile import ZipFile, BadZipFile
import json
import shutil
import stat
import sys

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = ROOT / "releases/SonicDisplay-V960.zip"
REQUIRED = {
    "package.json",
    "package-lock.json",
    "lib/concertContinuityV960.ts",
    "scripts/v960-production-verify.cjs",
    "tests/v960-concert-continuity-regression.cjs",
    ".github/workflows/v960-concert-continuity.yml",
}

def main():
    if not ARCHIVE.is_file():
        raise RuntimeError(f"Missing uploaded archive: {ARCHIVE.relative_to(ROOT)}")
    if ARCHIVE.stat().st_size > 25 * 1024 * 1024:
        raise RuntimeError("Archive exceeds 25 MiB safety limit")
    with ZipFile(ARCHIVE) as zipped:
        entries = [x for x in zipped.infolist() if not x.is_dir()]
        names = [x.filename for x in entries]
        if len(entries) < 4000 or not REQUIRED.issubset(names):
            raise RuntimeError("Archive is not a complete Sonic Display V960 project")
        if len(names) != len(set(names)) or len(names) != len(set(n.casefold() for n in names)):
            raise RuntimeError("Duplicate or case-insensitive file name collision")
        if sum(x.file_size for x in entries) > 80 * 1024 * 1024:
            raise RuntimeError("Uncompressed project exceeds safety limit")
        for info in entries:
            p = PurePosixPath(info.filename)
            if p.is_absolute() or ".." in p.parts or "\\" in info.filename or ".git" in p.parts:
                raise RuntimeError(f"Unsafe ZIP entry: {info.filename}")
            if stat.S_IFMT(info.external_attr >> 16) == stat.S_IFLNK:
                raise RuntimeError(f"Symlink entries not accepted: {info.filename}")
        package = json.loads(zipped.read("package.json"))
        if str(package.get("sonicRoadmapRelease", "")).lower() not in {"v960", "959"}:
            raise RuntimeError("Package does not advertise V960 release")
        bad = zipped.testzip()
        if bad:
            raise RuntimeError(f"ZIP integrity error: {bad}")
        imported = 0
        for info in entries:
            target = ROOT.joinpath(*PurePosixPath(info.filename).parts)
            target.parent.mkdir(parents=True, exist_ok=True)
            with zipped.open(info) as source, target.open("wb") as destination:
                shutil.copyfileobj(source, destination, length=256 * 1024)
            imported += 1
    # Do not commit the redundant 9MB ZIP; it remains in the triggering commit.
    ARCHIVE.unlink()
    print(f"Imported {imported} validated V960 project files into {ROOT}")

if __name__ == "__main__":
    try:
        main()
    except (RuntimeError, BadZipFile, OSError, ValueError) as exc:
        print(f"V960 import rejected: {exc}", file=sys.stderr)
        sys.exit(1)
