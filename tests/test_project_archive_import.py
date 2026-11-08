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

    def build(self, num=969, marker=None, extras=(), name=None):
        archive = self.root / 'releases' / (name or f'SonicDisplay-V{num}.zip')
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

    def test_protected_structure_and_ci_helpers_cannot_be_replaced_by_zip(self):
        helpers = [
            'scripts/organize-project-structure.cjs',
            'scripts/organize-version-docs.cjs',
            'tests/v974-repository-cleanup-regression.cjs',
            'scripts/production-workflow-metadata.cjs',
            'tests/production-workflow-regression.cjs',
        ]
        for name in helpers:
            dest = self.root / name
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_text('trusted-current-code', encoding='utf8')
        self.build(extras=[(name, 'outdated-archive-copy') for name in helpers])
        mod.import_archive(self.root, 'SonicDisplay-V969.zip')
        for name in helpers:
            self.assertEqual((self.root / name).read_text(encoding='utf8'),
                             'trusted-current-code', name)

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

    def test_long_descriptive_name_imports_without_renaming(self):
        name = 'SonicDisplay-V1037-Arena-Transformation-2-Long-Filename-Support.zip'
        archive = self.build(num=1037, name=name)
        self.assertEqual(mod.checked_name(f'releases/{name}'), (name, 1037))
        self.assertEqual(mod.select_archive(self.root, name, '', ''), name)
        mod.import_archive(self.root, name)
        self.assertFalse(archive.exists())
        self.assertEqual(json.loads((self.root / 'package.json').read_text())['sonicRoadmapRelease'], 'v1037')

    def test_browser_duplicate_suffix_imports_safely(self):
        name = 'SonicDisplay-V1101-Govee-Scene-Transition-Smoother (1).zip'
        self.assertEqual(mod.checked_name(f'releases/{name}'), (name, 1101))
        self.assertEqual(mod.checked_name('SonicDisplay-V1101 (12).zip'), ('SonicDisplay-V1101 (12).zip', 1101))
        archive = self.build(num=1101, name=name)
        before, head = 'a' * 40, 'b' * 40
        with patch.object(mod.subprocess, 'check_output', return_value=f'releases/{name}\n'):
            self.assertEqual(mod.select_archive(self.root, '', before, head), name)
        mod.import_archive(self.root, name)
        self.assertFalse(archive.exists())
        self.assertEqual(json.loads((self.root / 'package.json').read_text())['sonicRoadmapRelease'], 'v1101')
        for unsafe in ('SonicDisplay-V1101-foo (0).zip', 'SonicDisplay-V1101-foo (10000).zip',
                       'SonicDisplay-V1101-foo (1) (2).zip', 'SonicDisplay-V1101-foo(1).zip',
                       'SonicDisplay-V1101-foo (1)/evil.zip'):
            with self.assertRaises(ValueError):
                mod.checked_name(unsafe)

    def test_long_filename_near_filesystem_limit(self):
        prefix = 'SonicDisplay-V1037-'
        name = prefix + ('A' * (255 - len(prefix) - len('.zip'))) + '.zip'
        self.assertEqual(len(name.encode('utf-8')), 255)
        self.assertEqual(mod.checked_name(name), (name, 1037))
        self.assertEqual(mod.checked_name('SonicDisplay-V1037.zip'), ('SonicDisplay-V1037.zip', 1037))
        with self.assertRaisesRegex(ValueError, '255-byte'):
            mod.checked_name(prefix + 'A' * (256 - len(prefix) - len('.zip')) + '.zip')

    def test_reject_unsafe_descriptive_names(self):
        rejected = [
            'SonicDisplay-V1037-.zip', 'SonicDisplay-V1037-foo-.zip',
            'SonicDisplay-V1037-foo bar.zip', 'SonicDisplay-V1037-../evil.zip',
            'SonicDisplay-V1037-ä.zip', 'SonicDisplay-V1037-foo\\bar.zip',
            'releases/nested/SonicDisplay-V1037-foo.zip',
            'releases/SonicDisplay-V1037-foo.zip\narchive=evil',
        ]
        for name in rejected:
            with self.subTest(name=name), self.assertRaises(ValueError):
                mod.checked_name(name)

    def test_long_filename_version_still_checked(self):
        name = 'SonicDisplay-V1037-Immersive-Concert-Arena.zip'
        self.build(num=1037, marker='v1036', name=name)
        with self.assertRaisesRegex(ValueError, 'Release mismatch'):
            mod.import_archive(self.root, name)

    def test_select_push_diff_with_long_name(self):
        before, head = 'a' * 40, 'b' * 40
        name = 'SonicDisplay-V1037-Arena-Transformation-2.zip'
        with patch.object(mod.subprocess, 'check_output', return_value=f'releases/{name}\n'):
            self.assertEqual(mod.select_archive(self.root, '', before, head), name)
        with patch.object(mod.subprocess, 'check_output', return_value=
                          f'releases/nested/{name}\n'):
            with self.assertRaisesRegex(ValueError, 'exactly one'):
                mod.select_archive(self.root, '', before, head)
        with patch.object(mod.subprocess, 'check_output', return_value=
                          f'releases/{name}\nreleases/SonicDisplay-V1038.zip\n'):
            with self.assertRaisesRegex(ValueError, 'exactly one'):
                mod.select_archive(self.root, '', before, head)

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

    def test_old_zip_preserves_production_workflow_helpers(self):
        helpers = ['scripts/production-workflow-metadata.cjs',
                   'tests/production-workflow-regression.cjs']
        for name in helpers:
            target = self.root / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text('protected workflow helper')
        self.init_git(*helpers)
        self.build()
        mod.import_archive(self.root, 'SonicDisplay-V969.zip', sync_tracked=True)
        for name in helpers:
            self.assertEqual((self.root / name).read_text(), 'protected workflow helper')

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
