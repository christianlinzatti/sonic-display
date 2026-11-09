"""Baked, in-place choreography with analytic two-bone leg IK (Blender coordinates).
Feet stay at fixed anchors during stance. Swing paths return to those anchors;
soles remain level. No runtime constraints or external motion files are required.
"""
import math
import bpy
from mathutils import Vector, Matrix, Quaternion
from sonic_stage_detail import animate_details

COMMON = [('Dance_Groove',2,.6),('Dance_Techno',2,1),('Idle_Breathe',4,.12),
          ('Dance_House',4,.65),('Dance_HipHop',4,.8),('Dance_Disco',4,.7),
          ('Dance_Shuffle',2,.75),('Dance_Robot',4,.65),('Dance_FestivalBounce',2,.85),('Gesture_Wave',3,.35)]
SIGNATURES = [('Dance_NeonCircuit','Dance_LaserStep'), ('Dance_FestivalFlow','Dance_DiscoStar'), ('Dance_PopLock','Dance_Clockwork')]
STYLES = ['Precise electronic footwork', 'Flowing festival and disco', 'Mechanical popping and locking']

def leg_matrix(bone, start, end):
    rest = bone.bone.tail_local - bone.bone.head_local
    rotation = rest.rotation_difference(end-start) @ bone.bone.matrix_local.to_quaternion()
    bone.matrix = Matrix.LocRotScale(start, rotation, Vector((1,1,1)))
    bpy.context.view_layer.update()

def ground_leg(rig, side, target):
    upper, lower, foot = [rig.pose.bones[side+n] for n in ('UpLeg','Leg','Foot')]
    hip = upper.head.copy()
    a, b = upper.bone.length, lower.bone.length
    axis = target-hip; distance = axis.length; axis.normalize()
    if not abs(a-b)+.001 < distance < a+b-.001:
        raise ValueError('Unreachable grounded foot target')
    along = (a*a-b*b+distance*distance)/(2*distance)
    bend = Vector((0,-1,0)); bend -= axis*bend.dot(axis); bend.normalize()
    knee = hip+axis*along+bend*math.sqrt(max(0,a*a-along*along))
    leg_matrix(upper,hip,knee)
    leg_matrix(lower,knee,target)
    foot.matrix = Matrix.LocRotScale(target, foot.bone.matrix_local.to_quaternion(), Vector((1,1,1)))
    bpy.context.view_layer.update()

def animate_grounded(rig, variant, encore=False):
    rig['sonic_motion_version'] = 3
    rig['sonic_choreography_style'] = STYLES[variant]
    rig['sonic_grounding'] = 'Baked two-bone IK; level soles; fixed stance anchors'
    clips = COMMON + [(name,16 if variant==2 and i==1 else 12,.75) for i,name in enumerate(SIGNATURES[variant])]
    if encore: clips += [(name,4,.6) for name in ['Dance_RockDrive','Dance_LatinSway','Dance_JazzSwing','Dance_LiquidWave','Dance_AfroPulse','Dance_Waltz']]
    if encore>=5: clips += [(name,4,.8) for name in ['Dance_PowerHit','Dance_Ripple','Dance_Turnout','Dance_Stomp']]
    clips += [(name,4,.65) for name in ['Dance_SideGlide','Dance_DiagonalStep','Dance_HeelToe','Dance_PivotStep']]
    full_body=['Dance_RobotGroove','Dance_FluidArc','Dance_FrontmanDrive','Dance_JazzRebound','Dance_CrossStep','Dance_TurnPhrase']
    clips += [(name,4,.8) for name in full_body]
    scene=bpy.context.scene
    for clip,duration,energy in clips:
        rig.animation_data_create(); action=bpy.data.actions.new(clip); rig.animation_data.action=action
        frames=int(duration*scene.render.fps)
        for f in range(frames+1):
            scene.frame_set(f)
            phrase=f/frames*math.tau
            t=phrase*(duration/4 if clip in SIGNATURES[variant] else 1)
            for pb in rig.pose.bones:
                pb.rotation_mode='XYZ'; pb.rotation_euler=(0,0,0); pb.location=(0,0,0);pb.scale=(1,1,1)
            # A slight knee bend leaves room for sway without lifting the support feet.
            offset=Vector((energy*.035*math.sin(t),0,-.055-energy*.018*(1-math.cos(2*t))))
            if clip in full_body:
                # Shift weight over the planted foot, with visibly deeper knee compression.
                sway={'Dance_RobotGroove':.042,'Dance_FluidArc':.065,'Dance_FrontmanDrive':.05,'Dance_JazzRebound':.055,'Dance_CrossStep':.06,'Dance_TurnPhrase':.045}[clip]
                depth={'Dance_RobotGroove':.085,'Dance_FluidArc':.075,'Dance_FrontmanDrive':.11,'Dance_JazzRebound':.09,'Dance_CrossStep':.08,'Dance_TurnPhrase':.085}[clip]
                offset=Vector((-sway*math.sin(t),.02*math.sin(2*t) if clip=='Dance_FluidArc' else 0,-depth-.025*(1-math.cos(2*t))))
            hips=rig.pose.bones['Hips']; hips.location=hips.bone.matrix_local.to_3x3().inverted() @ offset
            hips.rotation_euler.y=energy*.055*math.sin(t)
            rig.pose.bones['Chest'].rotation_euler=(energy*.06*math.sin(2*t),energy*.10*math.sin(t),energy*.08*math.sin(t))
            rig.pose.bones['Head'].rotation_euler.y=-energy*.12*math.sin(t)
            for side,s in [('Left',1),('Right',-1)]:
                arm=rig.pose.bones[side+'Arm']; fore=rig.pose.bones[side+'ForeArm']
                arm.rotation_euler=(energy*.32*math.sin(t+s*.7),0,s*energy*.16)
                fore.rotation_euler.x=-energy*(.4+.25*math.sin(t+s))
            if clip=='Dance_House':
                for side,s in [('Left',1),('Right',-1)]:
                    rig.pose.bones[side+'Arm'].rotation_euler.x=.4*math.sin(t+s*math.pi/2)
            elif clip=='Dance_HipHop':
                rig.pose.bones['Chest'].rotation_euler.x=.12+.08*math.cos(2*t)
                for side,s in [('Left',1),('Right',-1)]:
                    rig.pose.bones[side+'Arm'].rotation_euler=(.25*math.sin(t),0,s*.55)
                    rig.pose.bones[side+'ForeArm'].rotation_euler.x=-.8+.3*math.sin(2*t+s)
            elif clip=='Dance_Disco':
                rig.pose.bones['RightArm'].rotation_euler.z=1.6+.5*math.sin(t)
                rig.pose.bones['LeftArm'].rotation_euler.z=-.35
            elif clip=='Dance_Robot':
                lock=math.sin(t)/math.sqrt(math.sin(t)**2+.045)
                rig.pose.bones['Chest'].rotation_euler.z=.18*lock
                rig.pose.bones['Head'].rotation_euler.y=-.25*lock
                for side,s in [('Left',1),('Right',-1)]:
                    rig.pose.bones[side+'Arm'].rotation_euler.z=s*.9
                    rig.pose.bones[side+'ForeArm'].rotation_euler.x=-.65+s*.5*lock
            elif clip=='Dance_FestivalBounce':
                for side,s in [('Left',1),('Right',-1)]:
                    rig.pose.bones[side+'Arm'].rotation_euler.z=s*(2.1+.25*math.sin(t))
                    rig.pose.bones[side+'ForeArm'].rotation_euler.x=-.3+.2*math.cos(2*t)
            elif clip=='Gesture_Wave':
                rig.pose.bones['RightArm'].rotation_euler.z=2.35
                rig.pose.bones['RightForeArm'].rotation_euler.z=.35*math.sin(2*t)
            # Every performer has its own arm, wrist and torso phrasing, even in shared clips.
            if clip.startswith('Dance_'):
                for side,s in [('Left',1),('Right',-1)]:
                    arm=rig.pose.bones[side+'Arm']; fore=rig.pose.bones[side+'ForeArm']; hand=rig.pose.bones[side+'Hand']
                    if variant==0:
                        arm.rotation_euler.x+=.14*math.sin(2*t+s*.5)
                        fore.rotation_euler.z+=s*.13*math.sin(t)
                        hand.rotation_euler.x=.1*math.sin(2*t)
                    elif variant==1:
                        arm.rotation_euler.z+=s*.22*math.sin(t+s*.4)
                        fore.rotation_euler.x+=.2*math.sin(t+s*.7)
                        hand.rotation_euler.y=.24*math.sin(t+s)
                        rig.pose.bones['Chest'].rotation_euler.y=.14*math.sin(t)
                    else:
                        lock=math.sin(2*t)/math.sqrt(math.sin(2*t)**2+.045)
                        arm.rotation_euler.x+=.18*lock
                        fore.rotation_euler.z+=s*.2*lock
                        hand.rotation_euler.x=.22*lock
                        rig.pose.bones['Head'].rotation_euler.y=.2*lock
            if clip in SIGNATURES[variant]:
                first=clip==SIGNATURES[variant][0]
                for side,s in [('Left',1),('Right',-1)]:
                    arm=rig.pose.bones[side+'Arm'];fore=rig.pose.bones[side+'ForeArm']
                    if variant==0:
                        arm.rotation_euler=(.35*math.sin(2*t+s),0,s*(.65+.25*math.sin(t)))
                        fore.rotation_euler.x=-.8+.4*math.sin((2 if first else 1)*t+s)
                    elif variant==1:
                        arm.rotation_euler=(.3*math.sin(t+s),0,s*((1.2 if first else 1.8)+.4*math.sin(t+s*.5)))
                        fore.rotation_euler.x=-.3+.25*math.cos(t+s)
                    else:
                        lock=math.sin((2 if first else 1)*t)/math.sqrt(math.sin((2 if first else 1)*t)**2+.025)
                        arm.rotation_euler=(.3*s*lock,0,s*(.8+.3*lock))
                        fore.rotation_euler.x=-.8+s*.65*lock
            # V1129 genre phrases: different upper-body trajectories with grounded steps.
            if clip=='Dance_RockDrive':
                rig.pose.bones['Chest'].rotation_euler.x=.12+.12*math.sin(2*t)
                rig.pose.bones['Head'].rotation_euler.x=.18*math.sin(2*t)
                rig.pose.bones['RightArm'].rotation_euler.z=1.5+.3*math.sin(t)
                rig.pose.bones['LeftForeArm'].rotation_euler.x=-1+.25*math.sin(4*t)
            elif clip=='Dance_LatinSway':
                rig.pose.bones['Chest'].rotation_euler.y=.24*math.sin(t)
                for side,s in [('Left',1),('Right',-1)]:
                    rig.pose.bones[side+'Arm'].rotation_euler=(.35*math.sin(t+s),0,s*.8)
                    rig.pose.bones[side+'ForeArm'].rotation_euler.x=-.65+.35*math.cos(t+s)
            elif clip=='Dance_JazzSwing':
                rig.pose.bones['Chest'].rotation_euler.z=.16*math.sin(t)
                for side,s in [('Left',1),('Right',-1)]:
                    rig.pose.bones[side+'Arm'].rotation_euler.x=.55*math.sin(t+s*math.pi/2)
                    rig.pose.bones[side+'ForeArm'].rotation_euler.x=-.8+.2*math.cos(2*t)
            elif clip=='Dance_LiquidWave':
                for i,name in enumerate(['Spine','Chest','Neck','Head']):
                    rig.pose.bones[name].rotation_euler.z=.10*math.sin(t-i*.5)
                for side,s in [('Left',1),('Right',-1)]:
                    rig.pose.bones[side+'Arm'].rotation_euler.z=s*(.9+.35*math.sin(t+s*.5))
                    rig.pose.bones[side+'ForeArm'].rotation_euler.x=-.7+.45*math.sin(t+s)
            elif clip=='Dance_AfroPulse':
                rig.pose.bones['Chest'].rotation_euler=(.12*math.cos(2*t),.18*math.sin(t),.1*math.sin(t))
                for side,s in [('Left',1),('Right',-1)]:
                    rig.pose.bones[side+'Arm'].rotation_euler=(.4*math.sin(2*t+s),0,s*(.6+.2*math.cos(t)))
                    rig.pose.bones[side+'ForeArm'].rotation_euler.x=-.9+.25*math.cos(2*t+s)
            elif clip=='Dance_Waltz':
                rig.pose.bones['Chest'].rotation_euler.y=.18*math.sin(t)
                rig.pose.bones['LeftArm'].rotation_euler.z=-1.1
                rig.pose.bones['RightArm'].rotation_euler.z=1.1
                rig.pose.bones['LeftForeArm'].rotation_euler.x=-.7
                rig.pose.bones['RightForeArm'].rotation_euler.x=-.7
            if clip=='Dance_PowerHit':
                for side,s in [('Left',1),('Right',-1)]:
                    rig.pose.bones[side+'Arm'].rotation_euler.z=s*(1.4+.45*math.sin(2*t))
                    rig.pose.bones[side+'ForeArm'].rotation_euler.x=-.9+.4*math.cos(2*t)
                rig.pose.bones['Chest'].rotation_euler.x=.15*math.cos(2*t)
            elif clip=='Dance_Ripple':
                for i,name in enumerate(['Spine','Chest','Neck','Head']):
                    rig.pose.bones[name].rotation_euler.y=.14*math.sin(t-i*.65)
                for side,s in [('Left',1),('Right',-1)]:
                    rig.pose.bones[side+'Arm'].rotation_euler.z=s*(1+.4*math.sin(t+s*.7))
                    rig.pose.bones[side+'ForeArm'].rotation_euler.z=s*.4*math.sin(t-1)
            elif clip=='Dance_Turnout':
                rig.pose.bones['Chest'].rotation_euler.y=.3*math.sin(t)
                for side,s in [('Left',1),('Right',-1)]:
                    rig.pose.bones[side+'Arm'].rotation_euler.z=s*(.8+.5*math.sin(t+s))
                    rig.pose.bones[side+'ForeArm'].rotation_euler.x=-.65+.4*math.cos(t+s)
            elif clip=='Dance_Stomp':
                rig.pose.bones['Chest'].rotation_euler.x=.18+.10*math.cos(4*t)
                for side,s in [('Left',1),('Right',-1)]:
                    rig.pose.bones[side+'Arm'].rotation_euler.x=.6*math.sin(2*t+s)
                    rig.pose.bones[side+'ForeArm'].rotation_euler.x=-1+.3*math.sin(4*t+s)
            if encore and clip.startswith('Dance_'):
                # Unique phrasing even when two Encore performers share the same base rig.
                rig.pose.bones['RightArm'].rotation_euler.z += encore*.13*math.sin(t)
                rig.pose.bones['RightForeArm'].rotation_euler.x += encore*.17*math.sin(t)
                rig.pose.bones['LeftArm'].rotation_euler.x -= encore*.07*math.sin(2*t)
            if clip in ('Dance_SideGlide','Dance_DiagonalStep','Dance_HeelToe','Dance_PivotStep'):
                # Counterbalance the moving foot with the torso, without root travel.
                rig.pose.bones['Chest'].rotation_euler.z=.11*math.sin(t)
                rig.pose.bones['Chest'].rotation_euler.y=.16*math.sin(t) if clip=='Dance_PivotStep' else .06*math.sin(2*t)
                for side,sign in [('Left',1),('Right',-1)]:
                    rig.pose.bones[side+'Arm'].rotation_euler.x=.35*math.sin(t+sign)
                    rig.pose.bones[side+'ForeArm'].rotation_euler.x=-.6+.2*math.cos(t+sign)
                # Each footwork phrase retains the performer's individual hand phrasing.
            if clip in full_body:
                hips.rotation_euler.y=(.42 if clip=='Dance_TurnPhrase' else .16)*math.sin(t)
                if clip=='Dance_RobotGroove':
                    lock=math.sin(2*t)/math.sqrt(math.sin(2*t)**2+.035)
                    rig.pose.bones['Chest'].rotation_euler=(.08*lock,.12*lock,.08*lock)
                    rig.pose.bones['Head'].rotation_euler.y=-.2*lock
                    for side,sign in [('Left',1),('Right',-1)]:
                        rig.pose.bones[side+'Arm'].rotation_euler=(.2*sign*lock,0,sign*.9)
                        rig.pose.bones[side+'ForeArm'].rotation_euler.x=-.8+sign*.4*lock
                elif clip=='Dance_FluidArc':
                    for i,name in enumerate(['Spine','Chest','Neck','Head']):
                        rig.pose.bones[name].rotation_euler.z=.13*math.sin(t-i*.5)
                    for side,sign in [('Left',1),('Right',-1)]:
                        rig.pose.bones[side+'Arm'].rotation_euler.z=sign*(1.1+.4*math.sin(t+sign*.5))
                        rig.pose.bones[side+'ForeArm'].rotation_euler.x=-.7+.4*math.sin(t-sign)
                elif clip=='Dance_FrontmanDrive':
                    rig.pose.bones['Chest'].rotation_euler.x=.20+.10*math.cos(2*t)
                    rig.pose.bones['Head'].rotation_euler.x=.12*math.sin(2*t)
                    rig.pose.bones['RightArm'].rotation_euler.z=1.6+.35*math.sin(t)
                    rig.pose.bones['LeftArm'].rotation_euler.x=.5*math.sin(t)
                elif clip=='Dance_JazzRebound':
                    rig.pose.bones['Chest'].rotation_euler=(.10*math.cos(2*t),.18*math.sin(t),.12*math.sin(t))
                    for side,sign in [('Left',1),('Right',-1)]:
                        rig.pose.bones[side+'Arm'].rotation_euler.x=.6*math.sin(t+sign*math.pi/2)
                        rig.pose.bones[side+'ForeArm'].rotation_euler.x=-.85+.25*math.cos(2*t+sign)
                elif clip=='Dance_CrossStep':
                    rig.pose.bones['Chest'].rotation_euler.y=-.22*math.sin(t)
                    for side,sign in [('Left',1),('Right',-1)]:
                        rig.pose.bones[side+'Arm'].rotation_euler=(.45*math.sin(t+sign),0,sign*.55)
                elif clip=='Dance_TurnPhrase':
                    rig.pose.bones['Chest'].rotation_euler.y=.20*math.sin(t)
                    for side,sign in [('Left',1),('Right',-1)]:
                        rig.pose.bones[side+'Arm'].rotation_euler.z=sign*(.9+.3*math.cos(t))
                        rig.pose.bones[side+'ForeArm'].rotation_euler.x=-.6+.25*math.sin(t+sign)
            animate_details(rig,variant,clip,t,phrase)
            bpy.context.view_layer.update()
            stationary=clip in ('Idle_Breathe','Gesture_Wave','Dance_Robot','Dance_FestivalBounce','Dance_PopLock','Dance_Clockwork')
            lift=(.075 if clip=='Dance_Shuffle' else (.045 if variant==1 else .032))
            stride=(.12 if clip=='Dance_Shuffle' else (.055 if variant==0 else .035))
            for side,s in [('Left',1),('Right',-1)]:
                swing=0 if stationary else max(0,s*math.sin(t))**3
                # Cubic lift has zero velocity at contact: no takeoff/landing snap.
                target=Vector((s*.14,0,.12))
                target.z+=lift*swing
                target.y+=stride*math.sin(2*t)*swing
                if clip in ('Dance_House','Dance_FestivalFlow','Dance_LaserStep'):
                    target.x+=s*.045*swing
                if clip=='Dance_SideGlide':
                    target.x+=s*.085*swing;target.y=.02*math.sin(2*t)*swing;target.z=.12+.035*swing
                elif clip=='Dance_DiagonalStep':
                    target.x+=s*.045*swing;target.y=-.105*swing;target.z=.12+.06*swing
                elif clip=='Dance_HeelToe':
                    target.y=.08*math.cos(t)*swing;target.z=.12+.05*swing
                elif clip=='Dance_PivotStep':
                    target.x+=s*.055*swing;target.y=.065*math.sin(t)*swing;target.z=.12+.045*swing
                if clip in full_body:
                    spread={'Dance_RobotGroove':.035,'Dance_FluidArc':.075,'Dance_FrontmanDrive':.045,'Dance_JazzRebound':.025,'Dance_CrossStep':-.065,'Dance_TurnPhrase':.055}[clip]
                    stride={'Dance_RobotGroove':.06,'Dance_FluidArc':.075,'Dance_FrontmanDrive':.12,'Dance_JazzRebound':.095,'Dance_CrossStep':.11,'Dance_TurnPhrase':.07}[clip]
                    target.x=s*.14+s*spread*swing
                    target.y=(-stride if clip!='Dance_JazzRebound' else stride*math.cos(2*t))*swing
                    target.z=.12+(.065 if clip in ('Dance_FrontmanDrive','Dance_CrossStep') else .05)*swing
                ground_leg(rig,side,target)
                if clip in ('Dance_PivotStep','Dance_TurnPhrase'):
                    foot=rig.pose.bones[side+'Foot']
                    foot.matrix=Matrix.LocRotScale(target,Quaternion((0,0,1),s*(.50 if clip=='Dance_TurnPhrase' else .30)*swing) @ foot.bone.matrix_local.to_quaternion(),Vector((1,1,1)))
                    bpy.context.view_layer.update()
            for pb in rig.pose.bones:
                pb.keyframe_insert('rotation_euler',frame=f)
                if pb.name.startswith('Face'):pb.keyframe_insert('scale',frame=f)
                # Preserve the exact evaluated IK chain, including tiny rest offsets.
                if pb.name=='Hips' or pb.name.endswith(('UpLeg','Leg','Foot')):
                    pb.keyframe_insert('location',frame=f)
        for fc in action.fcurves:
            for k in fc.keyframe_points:k.interpolation='LINEAR'
        track=rig.animation_data.nla_tracks.new();track.name=clip;track.strips.new(clip,0,action);track.mute=True
        rig.animation_data.action=None
    return [name for name,_,_ in clips]
