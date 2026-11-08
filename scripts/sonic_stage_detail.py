"""Original articulated hands and bone-driven facial details for Sonic Stage Crew."""

def add_hands(bones, side, s, variant, box, ball, limb, skin, dark, light):
    palm = (s*.405,-.025,.813)
    box(side+' articulated palm',palm,(.078,.048,.08),skin if variant==1 else dark,side+'Hand',.015)
    box(side+' glove back',(s*.405,-.052,.825),(.051,.012,.035),skin if variant==1 else light,side+'Hand',.006)
    for i, name in enumerate(['Index','Middle','Ring','Little']):
        x=s*(.377+i*.019); length=[.053,.06,.054,.044][i]
        a=(x,-.028,.776); b=(x,-.03,.776-length*.53); c=(x,-.03,.776-length)
        root=side+name+'1';tip=side+name+'2'
        bones[root]=(a,b,side+'Hand');bones[tip]=(b,c,root)
        mat=skin if variant==1 else dark
        limb(root+' segment',a,b,.008,.007,mat,root)
        ball(root+' knuckle',a,(.009,.009,.009),mat,root)
        limb(tip+' segment',b,c,.007,.006,mat,tip)
        ball(tip+' fingertip',c,(.0065,.0065,.0065),mat,tip)
        if variant==2:ball(root+' hinge',b,(.008,.008,.008),light,tip)
    a=(s*.367,-.025,.823);b=(s*.348,-.035,.8);c=(s*.338,-.044,.78)
    bones[side+'Thumb1']=(a,b,side+'Hand');bones[side+'Thumb2']=(b,c,side+'Thumb1')
    mat=skin if variant==1 else dark
    limb(side+' thumb base',a,b,.011,.009,mat,side+'Thumb1')
    limb(side+' thumb tip',b,c,.009,.007,mat,side+'Thumb2')
    ball(side+' thumb pad',c,(.008,.008,.008),mat,side+'Thumb2')

def add_face(bones, variant, ball, box, limb, material, skin, dark, light, suit, white):
    def bone(name,pos,length=.035):
        bones[name]=(pos,(pos[0],pos[1],pos[2]+length),'Head');return name
    if variant==0:
        visor=material('Cyan optical glass',(.015,.62,.85),.5,.45)
        ball('Helmet',(0,.017,1.775),(.155,.125,.155),suit,'Head')
        box('Visor frame',(0,-.119,1.75),(.275,.04,.11),dark,'Head',.025)
        for s in [-1,1]:
            name=bone('FaceVisor'+('Left' if s==1 else 'Right'),(s*.063,-.145,1.75))
            box('Expressive cyan lens',(s*.063,-.145,1.75),(.111,.018,.064),visor,name,.015)
            ball('Headphone outer',(s*.165,0,1.74),(.036,.08,.084),dark,'Head')
            ball('Headphone cyan insert',(s*.19,-.005,1.74),(.016,.05,.055),visor,'Head')
            box('Headband bracket',(s*.125,.005,1.865),(.025,.045,.08),dark,'Head',.01)
        for i in range(3):
            pos=((i-1)*.035,-.125,1.675);name=bone('FaceMeter'+str(i),pos)
            box('Visor status bar',pos,(.019,.012,.012),visor,name,.004)
    elif variant==1:
        blush=material('Rose cheek tint',(.62,.19,.17),0)
        ball('Nova hair',(0,.035,1.8),(.155,.12,.145),dark,'Head')
        bone('NovaBun',(0,.1,1.9))
        ball('Hair bun',(0,.10,1.92),(.085,.085,.085),light,'NovaBun')
        for s in [-1,1]:
            side='Left' if s==1 else 'Right';pos=(s*.052,-.119,1.75)
            eye=bone('FaceEye'+side,pos)
            ball('Eye',pos,(.018,.012,.024),dark,eye)
            ball('Eye catchlight',(s*.052-.004,-.13,1.76),(.005,.004,.006),white,eye)
            browpos=(s*.052,-.114,1.795);brow=bone('FaceBrow'+side,browpos)
            box('Eyebrow',browpos,(.037,.009,.007),dark,brow,.003)
            ball('Cheek',(s*.084,-.109,1.699),(.021,.005,.01),blush,'Head')
            ball('Earring',(s*.146,-.015,1.65),(.022,.022,.045),light,'Head')
        smile=bone('FaceSmile',(0,-.12,1.672))
        points=[(x,-.124,1.665+4*x*x) for x in [-.04,-.024,-.008,.008,.024,.04]]
        for a,b in zip(points,points[1:]):limb('Curved smile',a,b,.0035,.0035,dark,smile)
        for s in [-1,1]:box('Jacket lapel',(s*.14,-.13,1.32),(.08,.035,.28),light,'Chest',.02)
    else:
        led=material('Lime LED display',(.45,.82,.035),.2,.65)
        box('Robot face',(0,-.085,1.73),(.26,.11,.25),dark,'Head')
        for s in [-1,1]:
            side='Left' if s==1 else 'Right';pos=(s*.06,-.147,1.77)
            eye=bone('FaceLedEye'+side,pos)
            box('LED eye',pos,(.057,.015,.032),led,eye,.008)
            box('Chrome brow',(s*.06,-.14,1.808),(.067,.018,.013),white,'Head',.004)
        for i in range(5):
            pos=((i-2)*.025,-.147,1.671);name=bone('FaceLedBar'+str(i),pos)
            box('LED expression bar',pos,(.014,.015,.025),led,name,.004)
        bone('ChromeAntenna',(0,0,1.88))
        limb('Antenna',(0,0,1.88),(0,0,2.01),.012,.012,white,'ChromeAntenna')
        ball('Signal',(0,0,2.02),(.03,.03,.03),led,'ChromeAntenna')

def animate_details(rig, variant, clip, t, phrase):
    import math
    signature=clip.startswith(('Dance_Neon','Dance_Laser','Dance_FestivalFlow','Dance_DiscoStar','Dance_PopLock','Dance_Clockwork'))
    for side,s in [('Left',1),('Right',-1)]:
        for i,name in enumerate(['Thumb','Index','Middle','Ring','Little']):
            if clip=='Gesture_Wave':curl=.06+.035*(1+math.sin(t+i*.35))
            elif signature:
                curl=.18+.62*(.5-.5*math.cos(phrase+i*.13))
                if name=='Index':curl*=1-.88*(.5+.5*math.cos(phrase))
            elif clip=='Idle_Breathe':curl=.16+.025*math.sin(t+i*.2)
            else:curl=.22+.2*(.5+.5*math.sin(t+s*.5+i*.15))
            root=rig.pose.bones[side+name+'1'];tip=rig.pose.bones[side+name+'2']
            root.rotation_euler.x=.8*curl;tip.rotation_euler.x=1.1*curl
            if name=='Thumb':root.rotation_euler.z=s*.22*curl
        if signature:
            rig.pose.bones[side+'ForeArm'].rotation_euler.x+=.22*math.sin(phrase+s*.3)
            rig.pose.bones[side+'Hand'].rotation_euler.z+=s*.12*math.sin(phrase)
    blink=(.5+.5*math.cos(t-1.65))**32
    if variant==0:
        for side,s in [('Left',1),('Right',-1)]:
            p=rig.pose.bones['FaceVisor'+side]
            p.scale=(.95+.05*math.cos(t),1-.85*blink,1)
            p.rotation_euler.z=s*.035*math.sin(t)
        for i in range(3):rig.pose.bones['FaceMeter'+str(i)].scale.y=.7+.5*(.5+.5*math.sin(2*t+i*.8))
    elif variant==1:
        for side,s in [('Left',1),('Right',-1)]:
            rig.pose.bones['FaceEye'+side].scale.y=1-.93*blink
            brow=rig.pose.bones['FaceBrow'+side]
            brow.rotation_euler.z=s*.12*(.5+.5*math.sin(phrase))
        smile=rig.pose.bones['FaceSmile'];smile.scale=(1+.2*(.5+.5*math.sin(phrase)),1+.12*math.sin(phrase),1)
        rig.pose.bones['NovaBun'].rotation_euler.x=.04*math.sin(2*t-.3)
    else:
        for side,s in [('Left',1),('Right',-1)]:
            eye=rig.pose.bones['FaceLedEye'+side]
            eye.scale.y=1-.85*blink
            eye.rotation_euler.z=s*.09*math.sin(phrase)
        for i in range(5):rig.pose.bones['FaceLedBar'+str(i)].scale.y=.6+.8*(.5+.5*math.sin(2*t+i*.7))
        rig.pose.bones['ChromeAntenna'].rotation_euler.x=.045*math.sin(3*t)
