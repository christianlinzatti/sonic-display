"""Original Sonic Display stage performers. Run: blender -b -t 2 --python scripts/generate-sonic-avatars.py
No downloaded meshes, textures or motion data. Blender 4.3+, glTF 2.0 export.
"""
import bpy, math, pathlib, sys, json, struct, hashlib
from mathutils import Vector
ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/avatars/sonic'
OUT.mkdir(parents=True, exist_ok=True)
sys.path.insert(0,str(ROOT/'scripts'))
from sonic_stage_motion import animate_grounded
from sonic_stage_detail import add_hands, add_face

def material(name, color, metal=0, glow=0):
    m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*color,1)
    p.inputs['Metallic'].default_value=metal; p.inputs['Roughness'].default_value=.38
    p.inputs['Emission Color'].default_value=(*color,1); p.inputs['Emission Strength'].default_value=glow
    return m

def make(slug, label, accent, variant):
    bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
    suit=material('Midnight stage suit',(.025,.035,.065),.35)
    light=material('Signature luminous trim',accent,.25,1.5)
    skin=material('Warm porcelain' if variant!=2 else 'Brushed chrome',(.56,.29,.17) if variant==0 else ((.68,.4,.26) if variant==1 else (.48,.59,.68)), .7 if variant==2 else .05)
    dark=material('Obsidian visor',(.008,.016,.029),.65)
    white=material('Pearl armor',(.7,.8,.86),.5)
    parts=[]
    def finish(obj, name, mat, bone):
        obj.name=name; obj.data.materials.append(mat)
        bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
        for p in obj.data.polygons: p.use_smooth=True
        vg=obj.vertex_groups.new(name=bone); vg.add(list(range(len(obj.data.vertices))),1,'REPLACE')
        parts.append(obj); return obj
    def ball(name, pos, scale, mat, bone):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=8,location=pos)
        o=bpy.context.object; o.scale=scale; return finish(o,name,mat,bone)
    def box(name, pos, scale, mat, bone, bevel=.04):
        bpy.ops.mesh.primitive_cube_add(size=1,location=pos); o=bpy.context.object; o.scale=scale
        bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
        mod=o.modifiers.new('Soft tailored edges','BEVEL'); mod.width=bevel; mod.segments=2
        bpy.ops.object.modifier_apply(modifier=mod.name)
        return finish(o,name,mat,bone)
    def limb(name, a, b, r1, r2, mat, bone):
        d=Vector(b)-Vector(a)
        bpy.ops.mesh.primitive_cone_add(vertices=16,radius1=r2,radius2=r1,depth=d.length,location=(Vector(a)+Vector(b))/2)
        o=bpy.context.object; o.rotation_mode='QUATERNION'; o.rotation_quaternion=d.to_track_quat('Z','Y')
        return finish(o,name,mat,bone)
    def joint(name, pos, scale, mat, parent, child, axis=(0,0,1)):
        obj=ball(name,pos,scale,mat,child)
        bpy.context.view_layer.update()
        obj.vertex_groups.clear()
        upper=obj.vertex_groups.new(name=parent);lower=obj.vertex_groups.new(name=child)
        direction=Vector(axis);width=max(scale)*1.5
        for v in obj.data.vertices:
            distance=(obj.matrix_world @ v.co-Vector(pos)).dot(direction)
            u=max(0,min(1,.5+distance/width));u=u*u*(3-2*u)
            # Along a leg/arm, the proximal half follows its parent.
            upper.add([v.index],u,'REPLACE');lower.add([v.index],1-u,'REPLACE')
        return obj
    bones={'Hips':((0,0,.96),(0,0,1.1),None),'Spine':((0,0,1.1),(0,0,1.3),'Hips'), 'Chest':((0,0,1.3),(0,0,1.48),'Spine'), 'Neck':((0,0,1.48),(0,0,1.57),'Chest'), 'Head':((0,0,1.57),(0,0,1.85),'Neck')}
    for side,s in [('Left',1),('Right',-1)]:
        hip=(s*.13,0,.96); knee=(s*.14,0,.53); ankle=(s*.14,0,.12)
        shoulder=(s*.26,0,1.44); elbow=(s*.36,0,1.12); wrist=(s*.4,-.025,.86)
        bones.update({side+'Shoulder':((0,0,1.44),shoulder,'Chest'),side+'Arm':(shoulder,elbow,side+'Shoulder'),side+'ForeArm':(elbow,wrist,side+'Arm'),side+'Hand':(wrist,(s*.41,-.03,.74),side+'ForeArm'),side+'UpLeg':(hip,knee,'Hips'),side+'Leg':(knee,ankle,side+'UpLeg'),side+'Foot':(ankle,(s*.14,-.18,.07),side+'Leg')})
        limb(side+' trouser',hip,knee,.115,.085,suit,side+'UpLeg')
        limb(side+' shin',knee,ankle,.08,.06,white if variant==2 else suit,side+'Leg')
        joint(side+' flex knee',knee,(.086,.084,.084),dark,side+'UpLeg',side+'Leg')
        joint(side+' hip socket',hip,(.12,.12,.115),suit,'Hips',side+'UpLeg')
        box(side+' boot',(s*.14,-.055,.075),(.18,.32,.15),dark,side+'Foot')
        box(side+' sole',(s*.14,-.065,.028),(.185,.33,.035),light,side+'Foot',.012)
        limb(side+' sleeve',shoulder,elbow,.11,.075,white if variant==2 else suit,side+'Arm')
        joint(side+' shoulder bridge',shoulder,(.12,.112,.112),white if variant==2 else suit,'Chest',side+'Arm',(-s,0,0))
        ball(side+' shoulder inset',(s*.275,-.085,1.455),(.07,.035,.065),light,side+'Arm')
        limb(side+' forearm',elbow,wrist,.075,.055,skin if variant==1 else suit,side+'ForeArm')
        joint(side+' flex elbow',elbow,(.079,.077,.077),dark,side+'Arm',side+'ForeArm')
        joint(side+' wrist seal',wrist,(.057,.054,.055),dark,side+'ForeArm',side+'Hand')
        add_hands(bones,side,s,variant,box,ball,limb,skin,dark,light)
        box(side+' wrist light',wrist,(.12,.115,.035),light,side+'ForeArm',.012)
        box(side+' leg piping',(s*.205,-.025,.75),(.018,.10,.28),light,side+'UpLeg',.008)
    ball('Pelvis',(0,0,1.0),(.23,.135,.17),suit,'Hips')
    ball('Torso',(0,0,1.28),(.255,.14,.26),white if variant==2 else suit,'Chest')
    box('Belt',(0,-.01,1.075),(.43,.27,.055),light,'Hips',.02)
    limb('Neck',(0,0,1.47),(0,0,1.6),.065,.07,skin,'Neck')
    ball('Head',(0,-.005,1.73),(.145,.12,.18),skin,'Head')
    add_face(bones,variant,ball,box,limb,material,skin,dark,light,suit,white)
    # Equalizer emblem, visible from the front in the stage renderer.
    for i,h in enumerate([.07,.12,.18,.1,.06]):
        box('Equalizer chest '+str(i),((i-2)*.038,-.142,1.32),(.022,.025,h),light,'Chest',.006)
    bpy.ops.object.armature_add(); rig=bpy.context.object; rig.name=label+' Rig'
    bpy.ops.object.mode_set(mode='EDIT'); rig.data.edit_bones.remove(rig.data.edit_bones[0])
    for name,(head,tail,parent) in bones.items():
        b=rig.data.edit_bones.new(name); b.head=head; b.tail=tail
        if parent:b.parent=rig.data.edit_bones[parent]
    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='DESELECT')
    for o in parts:o.select_set(True)
    bpy.context.view_layer.objects.active=parts[0]; bpy.ops.object.join(); mesh=bpy.context.object; mesh.name=label+' Stage Suit'
    mesh.parent=rig; mod=mesh.modifiers.new('Humanoid skin','ARMATURE');mod.object=rig
    scene=bpy.context.scene;scene.render.fps=30
    animate_grounded(rig, variant)
    for track in rig.animation_data.nla_tracks:track.mute=True
    scene.frame_set(0)
    for pb in rig.pose.bones:pb.rotation_euler=(0,0,0);pb.location=(0,0,0);pb.scale=(1,1,1)
    # Export only the original character, excluding thumbnail cameras and lights.
    bpy.ops.object.select_all(action='DESELECT');rig.select_set(True);mesh.select_set(True)
    for track in rig.animation_data.nla_tracks:track.mute=False
    rig.location.z=-1.0  # Match Sonic's centered stage coordinate system.
    bpy.ops.export_scene.gltf(filepath=str(OUT/(slug+'.glb')),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='NLA_TRACKS',export_force_sampling=True,export_frame_range=False,export_extras=True)
    rig.location.z=0
    for track in rig.animation_data.nla_tracks:track.mute=True
    scene.frame_set(0)
    for pb in rig.pose.bones:pb.rotation_euler=(0,0,0);pb.location=(0,0,0);pb.scale=(1,1,1)
    # Render an actual thumbnail of the exported design (no external resources).
    scene.render.engine='CYCLES';scene.cycles.samples=48;scene.cycles.use_denoising=False
    scene.world.color=(.15,.15,.15)
    bpy.ops.object.camera_add(location=(2.5,-6,2.7));cam=bpy.context.object
    cam.rotation_euler=(Vector((0,0,1.05))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=2.5;scene.camera=cam
    for pos,power,size in [((2,-4,5),450,4),((-3,-2,3),300,3),((0,3,4),650,3)]:
        bpy.ops.object.light_add(type='AREA',location=pos);o=bpy.context.object;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.rotation_euler=(Vector((0,0,1))-o.location).to_track_quat('-Z','Y').to_euler()
    scene.render.resolution_x=384;scene.render.resolution_y=384;scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='PNG';scene.render.film_transparent=True
    scene.render.filepath=str(OUT/(slug+'.png'));bpy.ops.render.render(write_still=True)

make('neon-pulse','Neon Pulse',(.03,.8,1),0)
make('festival-nova','Festival Nova',(1,.12,.4),1)
make('chrome-beat','Chrome Beat',(.65,1,.08),2)

# Keep the distributable manifest synchronized whenever the assets are regenerated.
manifest=[]
for path in sorted(OUT.glob('*.glb')):
    binary=path.read_bytes(); gltf=json.loads(binary[20:20+struct.unpack_from('<I',binary,12)[0]])
    manifest.append({'file':path.name,'motionVersion':3,'bytes':len(binary),'sha256':hashlib.sha256(binary).hexdigest(),
      'triangles':sum(gltf['accessors'][p['indices']]['count']//3 for m in gltf['meshes'] for p in m['primitives']),
      'joints':len(gltf['skins'][0]['joints']),
      'clips':[{'name':a['name'],'seconds':max(gltf['accessors'][s['input']]['max'][0] for s in a['samplers'])} for a in gltf['animations']]})
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
