import importlib.util
import json
import subprocess
import tempfile
import unittest
import zipfile
from pathlib import Path
spec=importlib.util.spec_from_file_location('recovery',Path(__file__).resolve().parents[1]/'scripts/release-recovery.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class RecoveryTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name)
  self.run_git('init','-q');self.run_git('config','user.name','Test');self.run_git('config','user.email','test@example.invalid')
  self.write('package.json',json.dumps({'version':'0.1.0-v1007','sonicRoadmapRelease':'v1007'}));self.lock('0.1.0-v1007')
  self.write('app/page.tsx','old');self.write('.github/workflows/ci.yml','old workflow');self.write('data/user.json','old user');self.write('scripts/release-recovery.py','old tool')
  self.commit('stable');self.old=self.run_git('rev-parse','HEAD').strip()
  self.write('package.json',json.dumps({'version':'0.1.0-v1008','sonicRoadmapRelease':'v1008'}));self.lock('0.1.0-v1008')
  self.write('app/page.tsx','new');self.write('components/new.tsx','new');self.write('.github/workflows/ci.yml','new workflow');self.write('data/user.json','current user');self.write('scripts/release-recovery.py','new tool')
  self.commit('update')
 def tearDown(self):self.tmp.cleanup()
 def run_git(self,*args):return subprocess.check_output(['git',*args],cwd=self.root).decode()
 def write(self,path,value):p=self.root/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(value)
 def lock(self,v):self.write('package-lock.json',json.dumps({'version':v,'packages':{'':{'version':v}}}))
 def commit(self,msg):self.run_git('add','.');self.run_git('commit','-qm',msg)
 def test_preview_does_not_modify(self):
  plan=m.recover(self.root,self.old);self.assertEqual(plan['to'],'v1007');self.assertFalse(plan['applied']);self.assertEqual((self.root/'app/page.tsx').read_text(),'new')
 def test_apply_preserves_workflows_user_data_and_tool(self):
  plan=m.recover(self.root,self.old,True);self.assertTrue(plan['applied']);self.assertEqual((self.root/'app/page.tsx').read_text(),'old');self.assertFalse((self.root/'components/new.tsx').exists())
  for path,value in [('.github/workflows/ci.yml','new workflow'),('data/user.json','current user'),('scripts/release-recovery.py','new tool')]:self.assertEqual((self.root/path).read_text(),value)
 def test_dirty_tree_stops(self):
  self.write('app/page.tsx','user edit')
  with self.assertRaisesRegex(ValueError,'clean'):m.recover(self.root,self.old,True)
 def test_untracked_file_stops(self):
  self.write('components/user.tsx','user data')
  with self.assertRaisesRegex(ValueError,'clean'):m.recover(self.root,self.old,True)
 def test_snapshot_omits_user_data_and_contains_versioned_source(self):
  with tempfile.TemporaryDirectory() as d:
   output=Path(d)/'backup.zip';result=m.snapshot(self.root,output)
   self.assertEqual(result['release'],'v1008')
   with zipfile.ZipFile(output) as z:
    self.assertNotIn('data/user.json',z.namelist());self.assertEqual(z.read('app/page.tsx'),b'new')
   with self.assertRaises(FileExistsError):m.snapshot(self.root,output)
 def test_snapshot_inside_checkout_stops(self):
  with self.assertRaisesRegex(ValueError,'outside'):m.snapshot(self.root,self.root/'backup.zip')
 def test_ignored_user_model_is_not_overwritten(self):
  self.write('public/avatars/personal.glb','tracked model');self.commit('model baseline');target=self.run_git('rev-parse','HEAD').strip()
  self.run_git('rm','public/avatars/personal.glb');self.write('.gitignore','public/avatars/*.glb\n');self.commit('remove model')
  self.write('public/avatars/personal.glb','personal upload')
  with self.assertRaisesRegex(ValueError,'user file'):m.recover(self.root,target,True)
  self.assertEqual((self.root/'public/avatars/personal.glb').read_text(),'personal upload')
 def test_invalid_target_lockfile_stops(self):
  self.lock('0.1.0-v1');self.commit('invalid lock');target=self.run_git('rev-parse','HEAD').strip()
  self.lock('0.1.0-v1008');self.commit('repair lock')
  with self.assertRaisesRegex(ValueError,'invalid'):m.recover(self.root,target,True)
 def test_ref_injection_stops(self):
  with self.assertRaisesRegex(ValueError,'40-character'):m.recover(self.root,'--all',True)
if __name__=='__main__':unittest.main()
