#!/usr/bin/env python3
"""Deterministic *small* GLB smoke-test mannequin for V777, NOT a high-poly production avatar.
Skinned cylinder + animated bones + one facial mouthOpen morph; glTF 2.0 binary.
"""
import json,math,struct,pathlib
root=pathlib.Path(__file__).resolve().parents[1];dest=root/'public/benchmark/v777-reference-performer.glb'
blob=bytearray(); views=[]; accessors=[]
def accessor(values,ctype,kind,n,minimum=None,maximum=None):
    while len(blob)%4:blob.append(0)
    offset=len(blob);fmt={5126:'f',5123:'H',5125:'I'}[ctype];blob.extend(struct.pack('<'+str(len(values))+fmt,*values))
    views.append({'buffer':0,'byteOffset':offset,'byteLength':len(blob)-offset})
    acc={'bufferView':len(views)-1,'componentType':ctype,'count':len(values)//n,'type':kind}
    if minimum is not None:acc['min']=minimum
    if maximum is not None:acc['max']=maximum
    accessors.append(acc);return len(accessors)-1
pos=[];normal=[];joints=[];weights=[];index=[]
radial=24;rows=24
for row in range(rows):
    y=-1.15+row*(2.28/(rows-1));r=.28*(.87 if y>1.0 else (1.1 if y>-.1 else .75))
    for i in range(radial):
        a=2*math.pi*i/radial;pos.extend([r*math.cos(a),y,r*math.sin(a)])
        normal.extend([math.cos(a),0,math.sin(a)]);joints.extend([0,1,2,2]);w=min(1,max(0,(y+.20)/1.2));weights.extend([1-w,w,0,0])
for row in range(rows-1):
 for i in range(radial):
    j=row*radial+i;k=row*radial+(i+1)%radial;l=j+radial;m=k+radial
    index.extend([j,k,m,j,m,l])
position=accessor(pos,5126,'VEC3',3,[-.35,-1.15,-.35],[.35,1.2,.35]);normals=accessor(normal,5126,'VEC3',3)
js=accessor(joints,5123,'VEC4',4);ws=accessor(weights,5126,'VEC4',4)
indices=accessor(index,5123,'SCALAR',1)
# Hip (joint 0) at origin, torso at .55, head at +.64. Pure translation inverse binds.
mat=[]
for y in [0,.55,1.19]:
 mat.extend([1,0,0,0,0,1,0,0,0,0,1,0,0,-y,0,1])
ibm=accessor(mat,5126,'MAT4',16)
# Small mouth quad attached as regular mesh to the head bone, one morph-target delta.
mp=[-.13,-.04,.28,.13,-.04,.28,.13,.04,.28,-.13,.04,.28]
mn=[0,0,1]*4;delta=[0,-.08,0,0,-.08,0,0,.12,0,0,.12,0]
mi=[0,1,2,0,2,3]
ma=accessor(mp,5126,'VEC3',3,[-.13,-.04,.28],[.13,.04,.28]);mna=accessor(mn,5126,'VEC3',3)
morph=accessor(delta,5126,'VEC3',3);mid=accessor(mi,5123,'SCALAR',1)
times=accessor([0,.3,.6,.9,1.2],5126,'SCALAR',1,[0],[1.2])
def quat_z(a):return [0,0,math.sin(a/2),math.cos(a/2)]
def quat_y(a):return [0,math.sin(a/2),0,math.cos(a/2)]
hip_rot=accessor(sum((quat_y(a) for a in [0,.12,0,-.12,0]),[]),5126,'VEC4',4)
torso_rot=accessor(sum((quat_z(a) for a in [0,.18,0,-.18,0]),[]),5126,'VEC4',4)
head_rot=accessor(sum((quat_z(a) for a in [0,-.1,0,.08,0]),[]),5126,'VEC4',4)
gltf={'asset':{'version':'2.0','generator':'Sonic V777 deterministic reference rig'},
 'scene':0,'scenes':[{'nodes':[0]}],
 'buffers':[{'byteLength':len(blob)}],'bufferViews':views,'accessors':accessors,
 'materials':[{'name':'reference-body','pbrMetallicRoughness':{'baseColorFactor':[.18,.74,.88,1], 'metallicFactor':.15,'roughnessFactor':.66}},
              {'name':'reference-mouth','doubleSided':True,'pbrMetallicRoughness':{'baseColorFactor':[.05,.04,.10,1],'metallicFactor':0,'roughnessFactor':.8}}],
 'meshes':[{'name':'SkinnedReferenceBody','primitives':[{'attributes':{'POSITION':position,'NORMAL':normals,'JOINTS_0':js,'WEIGHTS_0':ws},'indices':indices,'material':0}]},
           {'name':'MouthViseme','weights':[0],'extras':{'targetNames':['mouthOpen']},'primitives':[{'attributes':{'POSITION':ma,'NORMAL':mna},'indices':mid,'material':1,'targets':[{'POSITION':morph}]}]}],
 'nodes':[{'name':'ReferenceRig','children':[1,4]},
          {'name':'Hips','children':[2]},
          {'name':'Spine','translation':[0,.55,0],'children':[3]},
          {'name':'Head','translation':[0,.64,0],'children':[5]},
          {'name':'BodySkin','mesh':0,'skin':0},
          {'name':'Mouth','mesh':1,'translation':[0,.19,.02]}],
 'skins':[{'joints':[1,2,3],'skeleton':1,'inverseBindMatrices':ibm}],
 'animations':[{'name':'Dance_Beat','samplers':[{'input':times,'output':hip_rot,'interpolation':'LINEAR'},
                                                     {'input':times,'output':torso_rot,'interpolation':'LINEAR'},
                                                     {'input':times,'output':head_rot,'interpolation':'LINEAR'}],
               'channels':[{'sampler':0,'target':{'node':1,'path':'rotation'}},{'sampler':1,'target':{'node':2,'path':'rotation'}},{'sampler':2,'target':{'node':3,'path':'rotation'}}]}]}
# BodySkin node must be under scene root; bone joint 2's parent 1 etc.
jsn=json.dumps(gltf,sort_keys=True,separators=(',',':')).encode();jsn+=b' '*((-len(jsn))%4)
blob+=b'\0'*(-len(blob)%4)
file=struct.pack('<4sII',b'glTF',2,12+8+len(jsn)+8+len(blob))+struct.pack('<I4s',len(jsn),b'JSON')+jsn+struct.pack('<I4s',len(blob),b'BIN\0')+blob
dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(file)
print(dest, len(file),'bytes,',len(pos)//3,'vertices,',len(index)//3,'triangles')
