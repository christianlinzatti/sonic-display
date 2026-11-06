#!/usr/bin/env python3
"""Preview or explicitly restore a known Git source revision; never push or deploy."""
import argparse
import hashlib
import io
import zipfile
import json
import re
import subprocess
from pathlib import Path

ROOT_FILES = {'package.json', 'package-lock.json', 'next.config.ts', 'next-env.d.ts',
              'global.d.ts', 'tsconfig.json', 'tsconfig.v319-core.json', 'vercel.json', 'README.md', 'ARCHITECTURE.md'}
SOURCE_DIRS = {'app','components','config','context','hooks','integrations','lib','public','scripts','services','tests','types'}
PROTECTED = {'scripts/release-recovery.py','scripts/project-archive-import.py',
             'scripts/organize-project-structure.cjs','scripts/production-workflow-metadata.cjs',
             'tests/production-workflow-regression.cjs','tests/test_project_archive_import.py',
             'tests/v974-repository-cleanup-regression.cjs','tests/test_release_recovery.py'}

def managed(name):
    p = Path(name)
    return (name in ROOT_FILES or len(p.parts)>1 and p.parts[0] in SOURCE_DIRS) and name not in PROTECTED

def git(root, *args):
    return subprocess.check_output(['git', *args], cwd=root).decode('utf-8')

def recover(root, ref, apply=False):
    root = Path(root).resolve()
    if not re.fullmatch(r'[0-9a-fA-F]{40}', ref):
        raise ValueError('Use the full 40-character commit SHA of a known working revision')
    target = git(root, 'rev-parse', '--verify', ref+'^{commit}').strip()
    head = git(root, 'rev-parse', 'HEAD').strip()
    # Refuse local edits, staged changes and untracked managed source files.
    if git(root, 'status', '--porcelain', '--untracked-files=normal').strip():
        raise ValueError('Working tree must be clean; save your changes before recovery')
    current = json.loads(git(root, 'show', head+':package.json'))
    previous = json.loads(git(root, 'show', target+':package.json'))
    lock = json.loads(git(root, 'show', target+':package-lock.json'))
    if not re.fullmatch(r'v[1-9][0-9]*', previous.get('sonicRoadmapRelease','')) or previous.get('version') != lock.get('version') or previous.get('version') != lock.get('packages',{}).get('',{}).get('version'):
        raise ValueError('Target release metadata/lockfile are invalid')
    paths = [p for p in git(root,'diff','--name-only','-z',head,target,'--').split('\0') if p and managed(p)]
    # Avoid overwriting ignored user files if a historical revision tracks that path.
    tracked = set(git(root,'ls-files','-z').split('\0'))
    for name in paths:
        path = root / name
        if path.is_symlink() or any(parent.is_symlink() for parent in path.parents if parent != root.parent):
            raise ValueError('Refusing a symlink recovery target: '+name)
        if path.exists() and name not in tracked:
            raise ValueError('Refusing to overwrite an untracked or ignored user file: '+name)
    plan = {'from':current.get('sonicRoadmapRelease'),'to':previous['sonicRoadmapRelease'],
            'sourceCommit':head,'restoreCommit':target,'paths':paths,'applied':False}
    if apply and paths:
        # Build and validate the whole binary patch before a single apply operation.
        patch = subprocess.check_output(['git','diff','--binary',head,target,'--',*paths],cwd=root)
        subprocess.run(['git','apply','--check','--binary','-'],input=patch,cwd=root,check=True)
        subprocess.run(['git','apply','--binary','-'],input=patch,cwd=root,check=True)
        plan['applied'] = True
    return plan


def snapshot(root, output):
    root, output = Path(root).resolve(), Path(output).resolve()
    if output == root or root in output.parents:
        raise ValueError('Store the backup outside the checkout')
    if git(root, 'status', '--porcelain', '--untracked-files=normal').strip():
        raise ValueError('Working tree must be clean before snapshot')
    head = git(root, 'rev-parse', 'HEAD').strip()
    allowed_dirs = SOURCE_DIRS | {'docs','artifacts','changelog','.github'}
    allowed_root = ROOT_FILES | {'.env.example','.gitignore','.gitattributes'}
    names = []
    for entry in git(root, 'ls-tree', '-r', '-z', head).split('\0'):
        if not entry:
            continue
        metadata, name = entry.split('\t', 1)
        if name not in allowed_root and Path(name).parts[0] not in allowed_dirs:
            continue
        if metadata.split()[0] not in {'100644','100755'}:
            raise ValueError('Snapshot contains a non-regular source: '+name)
        names.append(name)
    archive = subprocess.check_output(['git','archive','--format=zip',head,'--',*names],cwd=root)
    with zipfile.ZipFile(io.BytesIO(archive)) as z:
        package = json.loads(z.read('package.json'))
        lock = json.loads(z.read('package-lock.json'))
        if z.testzip() or package.get('version') != lock.get('version') or package.get('version') != lock.get('packages',{}).get('',{}).get('version') or package.get('version') != '0.1.0-'+str(package.get('sonicRoadmapRelease')):
            raise ValueError('Backup validation failed')
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('xb') as target:
        target.write(archive)
    return {'backup':str(output),'commit':head,'release':package.get('sonicRoadmapRelease'),
            'sha256':hashlib.sha256(archive).hexdigest(),'files':len(names)}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[1])
    parser.add_argument('--snapshot',type=Path,help='Create a source ZIP backup outside this checkout')
    parser.add_argument('--ref',help='Full commit SHA of the last working imported release')
    parser.add_argument('--apply',action='store_true',help='Explicitly restore the previewed source files locally')
    args = parser.parse_args()
    try:
        if args.snapshot:
            if args.ref or args.apply:
                raise ValueError('Use --snapshot separately from recovery')
            result = snapshot(args.root,args.snapshot)
        elif args.ref:
            result = recover(args.root,args.ref,args.apply)
        else:
            raise ValueError('Specify --ref for preview/recovery or --snapshot for backup')
        print(json.dumps(result,indent=2))
        return 0
    except (ValueError,OSError,subprocess.CalledProcessError,json.JSONDecodeError) as error:
        print('Recovery stopped: '+str(error))
        return 1
if __name__ == '__main__':
    raise SystemExit(main())
