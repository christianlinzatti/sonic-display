"""Run by Blender in background mode: blender -b -t 2 --python this.py -- input.fbx output.glb"""
import bpy
import sys
from pathlib import Path

args = sys.argv[sys.argv.index('--') + 1:]
if len(args) != 2:
    raise RuntimeError('Expected input FBX and output GLB paths')
source, destination = map(Path, args)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=str(source), use_anim=True)
if not bpy.data.objects:
    raise RuntimeError('FBX contains no importable objects')
# Blender exports meshes, armatures, materials and supported animation actions.
bpy.ops.export_scene.gltf(filepath=str(destination), export_format='GLB', export_animations=True, export_skins=True, export_materials='EXPORT', export_apply=False)
if not destination.is_file() or destination.stat().st_size == 0:
    raise RuntimeError('No GLB was generated')
print('SONIC_FBX_CONVERSION_OK')
