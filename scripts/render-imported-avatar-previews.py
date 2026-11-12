import bpy,json
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parents[1]/'public/avatars/imported'
for entry in json.loads((root/'manifest.json').read_text()):
 bpy.ops.wm.read_factory_settings(use_empty=True)
 bpy.ops.import_scene.gltf(filepath=str(root/entry['file']))
 scene=bpy.context.scene
 for obj in list(scene.objects):
  if obj.type=='ARMATURE' and obj.animation_data:obj.animation_data_clear()
 scene.frame_set(0);bpy.context.view_layer.update()
 depsgraph=bpy.context.evaluated_depsgraph_get()
 points=[obj.matrix_world@Vector(c) for original in scene.objects if original.type=='MESH' for obj in [original.evaluated_get(depsgraph)] for c in obj.bound_box]
 low=Vector(tuple(min(p[i] for p in points) for i in range(3)));high=Vector(tuple(max(p[i] for p in points) for i in range(3)));center=(low+high)/2;size=high-low
 scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=False
 scene.world=bpy.data.worlds.new('Gallery World');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.12,.16,.22,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.5
 bpy.ops.object.camera_add(location=center+Vector((size.z*.16,-size.z*3,size.z*.10)));cam=bpy.context.object;cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=max(size.z,size.x)*1.2;scene.camera=cam
 for delta,power in [((2,-3,4),450),((-3,-2,2),300),((0,3,3),650)]:
  bpy.ops.object.light_add(type='AREA',location=center+Vector(delta)*(size.z/2));lamp=bpy.context.object;lamp.data.energy=power*(size.z/2)**2;lamp.data.shape='DISK';lamp.data.size=size.z*1.6;lamp.rotation_euler=(center-lamp.location).to_track_quat('-Z','Y').to_euler()
 scene.render.resolution_x=384;scene.render.resolution_y=384;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.render.film_transparent=True;scene.render.filepath=str(root/entry['file'].replace('.glb','.png'))
 # Fit the camera to rendered alpha, including the actual skinned pose rather
 # than unused or hidden geometry that may inflate the imported bounds.
 bpy.ops.render.render(write_still=True)
 image=bpy.data.images.load(scene.render.filepath,check_existing=False);pixels=list(image.pixels)
 visible=[i for i in range(384*384) if pixels[i*4+3]>.05];bpy.data.images.remove(image)
 if not visible:raise RuntimeError('Empty avatar preview: '+entry['file'])
 xs=[i%384 for i in visible];ys=[i//384 for i in visible]
 dx=(min(xs)+max(xs)+1)/2-192;dy=(min(ys)+max(ys)+1)/2-192
 rotation=cam.rotation_euler.to_quaternion()
 cam.location+=(rotation@Vector((1,0,0)))*dx*cam.data.ortho_scale/384+(rotation@Vector((0,1,0)))*dy*cam.data.ortho_scale/384
 cam.data.ortho_scale*=max(max(xs)-min(xs)+1,max(ys)-min(ys)+1)/(384*.84)
 bpy.ops.render.render(write_still=True);print('PREVIEW_DONE',entry['file'],flush=True)
