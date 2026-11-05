"""Versioned archive importer regressions (stdlib only, no network)."""
import importlib.util
import json
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from zipfile import ZipFile, ZIP_DEFLATED

SCRIPT = Path(__file__).parents[1] / 'scripts' / 'project-archive-import.py'
spec = importlib.util.spec_from_file_location('sonic_import', SCRIPT)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


class ArchiveImportTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        (self.root / 'releases').mkdir()
        (self.root / '.github/workflows').mkdir(parents=True)
        (self.root / '.github/workflows/keep.yml').write_text('safeguarded', encoding='utf8')
        (self.root / 'scripts').mkdir()
        (self.root / 'scripts/project-archive-import.py').write_text('safeguarded', encoding='utf8')

    def build(self, num=969, marker=None, extras=()):
        archive = self.root / 'releases' / f'SonicDisplay-V{num}.zip'
        required = {x: 'hello' for x in mod.REQUIRED}
        required['package.json'] = json.dumps({'sonicRoadmapRelease': marker or f'v{num}'})
        with ZipFile(archive, 'w', ZIP_DEFLATED) as z:
            for filename, value in required.items():
                z.writestr(filename, value)
            for n in range(2500):
                z.writestr(f'tests/sample/{n:04d}.txt', 'fixture')
            for filename, value in extras:
                z.writestr(filename, value)
        return archive

    def test_import_969_and_970_and_maintain_protected_workflows(self):
        for release in (969, 970):
            self.build(release, extras=[('.github/workflows/keep.yml', 'DANGER'),
                                        ('scripts/project-archive-import.py', 'DANGER')])
            mod.import_archive(self.root, f'SonicDisplay-V{release}.zip')
            self.assertFalse((self.root / 'releases' / f'SonicDisplay-V{release}.zip').exists())
            self.assertEqual((self.root / '.github/workflows/keep.yml').read_text(), 'safeguarded')
            self.assertEqual((self.root / 'scripts/project-archive-import.py').read_text(), 'safeguarded')
            self.assertEqual(json.loads((self.root / 'package.json').read_text())['sonicRoadmapRelease'], f'v{release}')

    def test_bad_marker_refused_without_writing(self):
        self.build(971, marker='v965')
        with self.assertRaisesRegex(ValueError, 'Release mismatch'):
            mod.import_archive(self.root, 'SonicDisplay-V971.zip')
        self.assertFalse((self.root / 'tests/sample/0001.txt').exists())

    def test_zip_slip_refused(self):
        self.build(extras=[('../escaped.txt', 'DANGER')])
        with self.assertRaisesRegex(ValueError, 'Unsafe ZIP path'):
            mod.import_archive(self.root, 'SonicDisplay-V969.zip')
        self.assertFalse((self.root.parent / 'escaped.txt').exists())

    def test_case_collision_refused(self):
        self.build(extras=[('A/thing.ts', '1'), ('a/Thing.ts', '2')])
        with self.assertRaisesRegex(ValueError, 'case-insensitive'):
            mod.import_archive(self.root, 'SonicDisplay-V969.zip')

    def test_rollback_refused(self):
        (self.root / 'package.json').write_text(json.dumps({'sonicRoadmapRelease': 'v972'}))
        self.build(971)
        with self.assertRaisesRegex(ValueError, 'rollback'):
            mod.import_archive(self.root, 'SonicDisplay-V971.zip')

    def test_reject_arbitrary_filename(self):
        for bad in ['../../escape.zip', 'SonicDisplay-V971.zip;rm -rf', 'unknown.zip', 'SonicDisplay-V0.zip',
                    'releases/../SonicDisplay-V971.zip']:
            with self.subTest(bad=bad):
                with self.assertRaises(ValueError):
                    mod.checked_name(bad)

    def test_select_manual(self):
        self.build()
        self.assertEqual(mod.select_archive(self.root, 'SonicDisplay-V969.zip', '', ''), 'SonicDisplay-V969.zip')

    def test_select_push_diff(self):
        self.build()
        before, head = 'a'*40, 'b'*40
        with patch.object(mod.subprocess, 'check_output', return_value='releases/SonicDisplay-V969.zip\n'):
            self.assertEqual(mod.select_archive(self.root, '', before, head), 'SonicDisplay-V969.zip')
        with patch.object(mod.subprocess, 'check_output', return_value='releases/SonicDisplay-V969.zip\nreleases/SonicDisplay-V970.zip\n'):
            with self.assertRaisesRegex(ValueError, 'exactly one'):
                mod.select_archive(self.root, '', before, head)

    def init_git(self, *paths):
        subprocess.run(['git', 'init', '-q'], cwd=self.root, check=True)
        subprocess.run(['git', 'add', '--', *paths], cwd=self.root, check=True)

    def test_sync_removes_only_tracked_managed_missing_files(self):
        (self.root / 'components').mkdir()
        (self.root / 'v874').mkdir()
        (self.root / 'docs/history').mkdir(parents=True)
        (self.root / 'components/retired.tsx').write_text('old')
        (self.root / 'v874/retired.ts').write_text('old')
        (self.root / 'docs/history/keep.txt').write_text('preserve')
        (self.root / 'components/user-local.tsx').write_text('keep')
        self.init_git('components/retired.tsx', 'v874/retired.ts',
                      'docs/history/keep.txt', '.github/workflows/keep.yml',
                      'scripts/project-archive-import.py')
        self.build(extras=[('components/new.tsx', 'new')])
        report = self.root / 'sync-report.json'
        mod.import_archive(self.root, 'SonicDisplay-V969.zip',
                           sync_tracked=True, prune_report=report)
        self.assertFalse((self.root / 'components/retired.tsx').exists())
        self.assertFalse((self.root / 'v874/retired.ts').exists())
        self.assertEqual((self.root / 'components/new.tsx').read_text(), 'new')
        self.assertTrue((self.root / 'components/user-local.tsx').exists())
        self.assertTrue((self.root / 'docs/history/keep.txt').exists())
        self.assertEqual((self.root / '.github/workflows/keep.yml').read_text(), 'safeguarded')
        self.assertEqual((self.root / 'scripts/project-archive-import.py').read_text(), 'safeguarded')
        self.assertEqual(json.loads(report.read_text())['paths'],
                         ['components/retired.tsx', 'v874/retired.ts'])

    def test_dry_run_reports_without_modifying_files(self):
        (self.root / 'components').mkdir()
        (self.root / 'components/stale.ts').write_text('unchanged')
        self.init_git('components/stale.ts')
        self.build()
        report = self.root / 'plan.json'
        mod.import_archive(self.root, 'SonicDisplay-V969.zip',
                           sync_tracked=True, dry_run=True, prune_report=report)
        self.assertTrue((self.root / 'components/stale.ts').exists())
        self.assertTrue((self.root / 'releases/SonicDisplay-V969.zip').exists())
        self.assertEqual(json.loads(report.read_text())['paths'], ['components/stale.ts'])
        self.assertTrue(json.loads(report.read_text())['dry_run'])

    def test_invalid_zip_does_not_prune(self):
        (self.root / 'components').mkdir()
        (self.root / 'components/stale.ts').write_text('keep')
        self.init_git('components/stale.ts')
        self.build(marker='v965')
        with self.assertRaisesRegex(ValueError, 'Release mismatch'):
            mod.import_archive(self.root, 'SonicDisplay-V969.zip', sync_tracked=True)
        self.assertTrue((self.root / 'components/stale.ts').exists())

    def test_sync_fails_closed_outside_git_checkout(self):
        self.build()
        with self.assertRaisesRegex(ValueError, 'Git-tracked'):
            mod.import_archive(self.root, 'SonicDisplay-V969.zip', sync_tracked=True)
        self.assertTrue((self.root / 'releases/SonicDisplay-V969.zip').exists())

    def test_sync_refuses_large_unexpected_source_shrink(self):
        (self.root / 'components').mkdir()
        tracked = []
        for i in range(120):
            path = f'components/file{i:03d}.ts'
            (self.root / path).write_text('code')
            tracked.append(path)
        self.init_git(*tracked)
        self.build()
        with self.assertRaisesRegex(ValueError, 'Unsafe source shrink'):
            mod.import_archive(self.root, 'SonicDisplay-V969.zip', sync_tracked=True)
        self.assertEqual(sum((self.root / p).exists() for p in tracked), 120)


if __name__ == '__main__':
    unittest.main()
