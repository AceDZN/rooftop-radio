"""Original Rooftop Radio architecture. Run with Blender 5.2 LTS --background --python.
No external models or textures; geometry and PBR images are authored by this script.
"""
import bpy, math, random, json, argparse, sys, subprocess, shutil
from pathlib import Path
from mathutils import Vector, Euler, Matrix
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT/'art/architecture'
OUT = ROOT/'public/architecture'
DOC = ROOT/'docs/art/architecture'
for d in (ART, OUT, DOC, ART/'textures'): d.mkdir(parents=True, exist_ok=True)
random.seed(27026)
MATS={}
MODULE=[]


def texture_set(name, size, tint, kind):
    """Deterministic multilayer texture maps: subdued mineral/wood surface, not random RGB noise."""
    rng=np.random.default_rng({'plaster':31,'stone':52,'wood':73,'tile':91}[kind])
    y,x=np.mgrid[0:size,0:size].astype(float)
    u=x/size; v=y/size
    grain=rng.normal(0,1,(size,size))
    macro=(np.sin(u*math.tau*3.1+np.sin(v*math.tau*2.3))*0.38 +
           np.sin(v*math.tau*4.3+u*8)*0.22 + np.sin((u+v)*math.tau*11)*0.11)
    if kind=='wood':
        h=np.sin(v*math.tau*29 + np.sin(u*math.tau*1.2)*1.2)*.12+grain*.09
        tone=macro*.012+h*.14
        height=h*.7
    elif kind=='stone':
        pores=np.maximum(grain-1.3,0)
        tone=macro*.035+grain*.007-pores*.015
        height=macro*.12+grain*.15
    elif kind=='tile':
        tone=macro*.035+grain*.008
        height=macro*.08+grain*.10
    else:
        tone=macro*.024+grain*.004
        height=macro*.13+grain*.09
    colors=np.ones((size,size,4),dtype=np.float32)
    for i,c in enumerate(tint): colors[:,:,i]=np.clip(c+tone,0,1)
    dx=(np.roll(height,-1,axis=1)-np.roll(height,1,axis=1))*.17
    dy=(np.roll(height,-1,axis=0)-np.roll(height,1,axis=0))*.17
    normals=np.ones((size,size,4),dtype=np.float32)
    norm=np.sqrt(dx*dx+dy*dy+1)
    normals[:,:,0]=(-dx/norm+1)/2
    normals[:,:,1]=(-dy/norm+1)/2
    normals[:,:,2]=(1/norm+1)/2
    rough=np.ones((size,size,4),dtype=np.float32)
    value=np.clip((.79 if kind!='wood' else .7)+macro*.05+grain*.009,.55,.95)
    rough[:,:,:3]=value[:,:,None]
    images=[]
    for suffix, pixels in [('color',colors),('normal',normals),('roughness',rough)]:
        image=bpy.data.images.new(f'{name}-{suffix}',width=size,height=size,alpha=True)
        image.colorspace_settings.name='sRGB' if suffix=='color' else 'Non-Color'
        image.pixels.foreach_set(pixels.ravel())
        image.update()
        image.filepath_raw=str(ART/'textures'/f'{name}-{suffix}.png')
        image.file_format='PNG'; image.save()
        images.append(image)
    return images


def material(name, color, rough=.8, metallic=0, tex=None):
    m=bpy.data.materials.new(name);m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1)
    p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metallic
    if tex:
        images=texture_set(name,tex[0],color,tex[1])
        for i,image in enumerate(images):
            t=m.node_tree.nodes.new('ShaderNodeTexImage');t.image=image;t.extension='REPEAT'
            if i==0:m.node_tree.links.new(t.outputs['Color'],p.inputs['Base Color'])
            elif i==1:
                normal=m.node_tree.nodes.new('ShaderNodeNormalMap');normal.inputs['Strength'].default_value=.28
                m.node_tree.links.new(t.outputs['Color'],normal.inputs['Color'])
                m.node_tree.links.new(normal.outputs['Normal'],p.inputs['Normal'])
            else:m.node_tree.links.new(t.outputs['Color'],p.inputs['Roughness'])
    MATS[name]=m;return m


def materials():
    material('Lime plaster',(.77,.66,.49),tex=(384,'plaster'))
    material('Honey limestone',(.65,.55,.40),tex=(256,'stone'))
    material('Barrel terracotta',(.48,.20,.115),tex=(256,'tile'))
    material('Aged teal timber',(.055,.22,.205),tex=(256,'wood'))
    material('Oiled walnut',(.16,.085,.041),tex=(128,'wood'))
    material('Graphite iron',(.045,.071,.070),rough=.45,metallic=.72)
    material('Deep blue glazing',(.032,.09,.12),rough=.27,metallic=.16)
    material('Leaf green',(.10,.23,.065),rough=.9)
    material('Warm ochre',(.63,.38,.14),rough=.8)
    material('Arcade pale plaster',(.84,.77,.63),tex=(384,'plaster'))
    material('Atelier ochre plaster',(.76,.56,.36),tex=(384,'plaster'))


class Part:
    def __init__(self,name,verts,faces,mat):
        self.name=name;self.verts=verts;self.faces=faces;self.mat=mat
        self.location=Vector((0,0,0));self.rotation_euler=Euler((0,0,0));self.smooth=False


def add_part(name,verts,faces,mat):
    obj=Part(name,verts,faces,mat);MODULE.append(obj);return obj


def box(name,loc,scale,mat='Honey limestone',bevel=0):
    # Direct authored chamfer mesh avoids expensive per-object modifier evaluation.
    # Sub-centimetre edge bevels are below gameplay pixel scale; preserve geometry where it reads.
    if min(scale)<.17:bevel=0
    hx,hy,hz=[q/2 for q in scale]
    if not bevel:
        verts=[(sx*hx,sy*hy,sz*hz) for sx,sy,sz in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]]
        faces=[(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)]
    else:
        r=min(bevel,min(hx,hy,hz)*.45);half=[hx,hy,hz];verts=[];key={}
        for axis in range(3):
            others=[i for i in range(3)if i!=axis]
            for sign in [-1,1]:
                for a,b in [(-1,-1),(1,-1),(1,1),(-1,1)]:
                    co=[0,0,0];co[axis]=sign*half[axis]
                    co[others[0]]=a*(half[others[0]]-r);co[others[1]]=b*(half[others[1]]-r)
                    key[(axis,sign,a,b)]=len(verts);verts.append(tuple(co))
        faces=[]
        for axis in range(3):
            for sign in [-1,1]:faces.append(tuple(key[(axis,sign,a,b)]for a,b in [(-1,-1),(1,-1),(1,1),(-1,1)]))
        # Derive convex hull faces for 12 edges and 8 corners by exact bevel plane membership.
        for a in range(3):
            for b in range(a+1,3):
                c=3-a-b
                for sa in [-1,1]:
                    for sb in [-1,1]:
                        ids=[i for i,v in enumerate(verts)if abs(sa*v[a]+sb*v[b]-(half[a]+half[b]-r))<1e-6]
                        center=Vector(tuple(sum(verts[i][k]for i in ids)/len(ids)for k in range(3)))
                        normal=Vector(tuple(sa if k==a else sb if k==b else 0 for k in range(3))).normalized()
                        tangent=Vector(tuple(1 if k==c else 0 for k in range(3)));bit=normal.cross(tangent)
                        ids.sort(key=lambda i:math.atan2((Vector(verts[i])-center).dot(bit),(Vector(verts[i])-center).dot(tangent)))
                        faces.append(tuple(ids))
        for sx in [-1,1]:
            for sy in [-1,1]:
                for sz in [-1,1]:
                    ids=[i for i,v in enumerate(verts)if abs(sx*v[0]+sy*v[1]+sz*v[2]-(hx+hy+hz-2*r))<1e-6]
                    faces.append(tuple(ids))
    o=add_part(name,verts,faces,mat);o.location=Vector(loc);return o


def mesh(name,verts,faces,mat):
    return add_part(name,verts,faces,mat)


def beam(name,a,b,r,mat='Graphite iron',vertices=6):
    a,b=Vector(a),Vector(b);axis=(b-a).normalized()
    reference=Vector((0,0,1)) if abs(axis.z)<.9 else Vector((0,1,0))
    u=axis.cross(reference).normalized()*r;v=axis.cross(u).normalized()*r
    verts=[tuple(end+u*math.cos(i*math.tau/vertices)+v*math.sin(i*math.tau/vertices)) for end in [a,b]for i in range(vertices)]
    faces=[tuple(range(vertices-1,-1,-1)),tuple(range(vertices,vertices*2))]
    faces += [(i,(i+1)%vertices,(i+1)%vertices+vertices,i+vertices)for i in range(vertices)]
    return add_part(name,verts,faces,mat)



def local_box(side,name,x,depth,z,w,d,h,mat,bevel=0):
    o=box(name,(x,depth,z),(w,d,h),mat,bevel)
    # Facade-local outer face points towards negative Y. Rotate about building origin.
    angle=side*math.pi/2
    o.location=Vector((o.location.x*math.cos(angle)-o.location.y*math.sin(angle),
                       o.location.x*math.sin(angle)+o.location.y*math.cos(angle),z))
    o.rotation_euler.z=angle
    return o


def point(side,x,depth,z):
    angle=side*math.pi/2
    return (x*math.cos(angle)-depth*math.sin(angle),x*math.sin(angle)+depth*math.cos(angle),z)


def local_mesh(side,name,verts,faces,mat):
    return mesh(name,[point(side,*v) for v in verts],faces,mat)


def arch_panel(side,x,bottom,spring,r,depth,mat,name):
    # A real arched silhouette recessed behind the stone opening.
    pts=[(x-r,depth,bottom),(x+r,depth,bottom),(x+r,depth,spring)]
    pts += [(x+math.cos(i*math.pi/14)*r,depth,spring+math.sin(i*math.pi/14)*r) for i in range(1,15)]
    local_mesh(side,name,pts,[tuple(range(len(pts)))],mat)


def voussoir_arch(side,x,spring,r,depth,thickness,mat='Honey limestone',pieces=13):
    for i in range(pieces):
        a=i*math.pi/pieces+.009;b=(i+1)*math.pi/pieces-.009
        verts=[]
        for y in [depth-.12,depth+.12]:
            for rad,ang in [(r,a),(r,b),(r+thickness,b),(r+thickness,a)]:
                verts.append((x+math.cos(ang)*rad,y,spring+math.sin(ang)*rad))
        local_mesh(side,'Radial dressed arch stone',verts,[(0,1,2,3),(4,7,6,5),(0,4,5,1),(1,5,6,2),(2,6,7,3),(3,7,4,0)],mat)


def wall_with_openings(side,holes):
    # Facade panels leave actual apertures. Main interior volume is 0.6 m behind the front.
    xs=sorted(set([-5.95,5.95]+[v for h in holes for v in [h[0],h[1]]]))
    zs=sorted(set([.22,8.62]+[v for h in holes for v in [h[2],h[3]]]))
    for xa,xb in zip(xs[:-1],xs[1:]):
        for za,zb in zip(zs[:-1],zs[1:]):
            mx,mz=(xa+xb)/2,(za+zb)/2
            if any(a<mx<b and c<mz<d for a,b,c,d in holes):continue
            if xb-xa>.001 and zb-za>.001:
                local_box(side,'Recessed opening wall panel',mx,-5.77,mz,xb-xa,.36,zb-za,'Lime plaster')


def window(side,x,z,w=1.35,h=1.85,shutters=True,lite=False):
    bottom=z-h/2;top=z+h/2
    local_box(side,'Window deep dark reveal',x,-5.985 if lite else -5.59,z,w+.06,.035,h+.04,'Deep blue glazing')
    local_box(side,'Window stone lintel',x,-5.99,top+.12,w+.36,.20,.20,'Honey limestone',.035 if not lite else 0)
    local_box(side,'Projecting limestone sill',x,-6.04,bottom-.10,w+.48,.39,.17,'Honey limestone',.035 if not lite else 0)
    if lite:return
    for sign in [-1,1]:
        local_box(side,'Deep stone window jamb',x+sign*(w/2+.09),-5.81,z,.16,.33,h+.05,'Honey limestone',.018)
    local_box(side,'Timber window mullion',x,-5.63,z,.055,.06,h,'Oiled walnut',.009)
    local_box(side,'Timber window crossbar',x,-5.64,z-.12,w,.065,.055,'Oiled walnut',.009)
    if shutters:
        for sign in [-1,1]:
            cx=x+sign*(w/2+.31)
            local_box(side,'Teal shutter top rail',cx,-6.03,top-.10,.43,.13,.11,'Aged teal timber',.018)
            local_box(side,'Teal shutter bottom rail',cx,-6.03,bottom+.10,.43,.13,.11,'Aged teal timber',.018)
            for edge in [-1,1]:local_box(side,'Teal shutter side stile',cx+edge*.18,-6.03,z,.07,.13,h,'Aged teal timber',.012)
            for j in range(8):
                zz=bottom+.24+j*(h-.48)/7
                slat=local_box(side,'Individual wooden shutter louvre',cx,-6.02,zz,.31,.11,.115,'Aged teal timber',.008)
                # Slight slope catches daylight and shows actual separated slats.
                slat.rotation_euler.x=math.radians(15)*math.cos(side*math.pi/2)
                slat.rotation_euler.y=math.radians(15)*math.sin(side*math.pi/2)
            for zz in [bottom+.30,top-.30]:local_box(side,'Shutter forged hinge',cx,-6.11,zz,.28,.035,.032,'Graphite iron')
    for sign in [-1,1]:
        local_box(side,'Window drip-return block',x+sign*(w/2+.19),-6.02,top+.07,.12,.16,.22,'Honey limestone',.012)


def balcony(side,x,z,w=2.1,lite=False):
    floor=z-.98
    local_box(side,'Cantilever balcony stone',x,-6.13,floor,w,.63,.18,'Honey limestone',.035 if not lite else 0)
    for sx in [-.65,.65]:
        # Substantial stepped corbel supports instead of paper-thin shelf.
        local_box(side,'Balcony corbel',x+sx,-6.01,floor-.22,.20,.37,.32,'Honey limestone',.025 if not lite else 0)
    if lite:return
    def rail(a,b,r=.025):beam('Forged iron balcony rail',point(side,*a),point(side,*b),r)
    for zz in [floor+.18,floor+.85]:rail((x-w/2+.06,-6.44,zz),(x+w/2-.06,-6.44,zz),.032)
    for i in range(9):
        xx=x-w/2+.08+(w-.16)*i/8
        rail((xx,-6.44,floor+.18),(xx,-6.44,floor+.85),.019)
    for sx in [-w/2+.06,w/2-.06]:
        rail((x+sx,-5.96,floor+.85),(x+sx,-6.44,floor+.85),.028)
        rail((x+sx,-6.44,floor+.18),(x+sx,-6.44,floor+.90),.028)
    # Small forged scroll ring beneath top rail.
    for center in [x-.52,x+.52]:
        coords=[(center+math.cos(i*math.tau/12)*.12,-6.445,floor+.48+math.sin(i*math.tau/12)*.12) for i in range(13)]
        for a,b in zip(coords[:-1],coords[1:]):rail(a,b,.015)


def shop(side,x,w=2.6,lite=False,door=False):
    r=w/2;spring=1.60
    arch_panel(side,x,.25,spring,r,-5.985 if lite else -5.54,'Deep blue glazing','Recessed arched shop glazing')
    if lite:
        return
    voussoir_arch(side,x,spring,r,-5.96,.22)
    for sign in [-1,1]:
        local_box(side,'Shop dressed stone upright',x+sign*(r+.11),-5.96,.92,.22,.24,1.36,'Honey limestone',.025)
    local_box(side,'Shop entrance threshold',x,-5.86,.25,w+.26,.57,.18,'Honey limestone',.03)
    # Rectangular storefront joinery plus curved transom.
    for xx in [x-r+.13,x,x+r-.13]:local_box(side,'Teal shop frame upright',xx,-5.66,.95,.075,.075,1.34,'Aged teal timber',.01)
    for zz in [.37,1.64]:local_box(side,'Teal shop frame rail',x,-5.67,zz,w-.18,.085,.075,'Aged teal timber',.01)
    if door:
        local_box(side,'Shop solid door lower panel',x-r*.44,-5.69,.66,r-.19,.06,.58,'Aged teal timber',.02)
        local_box(side,'Brass patinated door handle',x-.10,-5.73,1.0,.035,.045,.19,'Honey limestone',.008)
    # Spandrels visibly fill the upper corners above the arch.
    for sign in [-1,1]:
        arc=[(x+sign*(math.cos(t*math.pi/2)*r),-5.96,spring+math.sin(t*math.pi/2)*r) for t in [i/10 for i in range(11)]]
        poly=arc+[(x,-5.96,3.12),(x+sign*r,-5.96,3.12)]
        local_mesh(side,'Plaster above arched aperture',poly,[tuple(range(len(poly)))],'Lime plaster')


def roof_tiles(lite=False):
    box('Walkable roof plane',(0,0,8.92),(13,13,.16),'Barrel terracotta',.025 if not lite else 0)
    if lite:return
    # Each low profile barrel tile is geometric. Highest point 9.035 m; no obstacle in walk corridors.
    cols=25;rows=19;cw=13/cols;length=13/rows
    for col in range(cols):
        for row in range(rows):
            x=-6.5+col*cw;y=-6.5+row*length
            verts=[]
            for yy in [y+.012,y+length-.012]:
                for k in range(5):
                    t=k/4
                    verts.append((x+t*cw,yy,9.004+math.sin(t*math.pi)*.031))
            faces=[(k,k+1,k+6,k+5) for k in range(4)]
            o=mesh('Shallow barrel tile',verts,faces,'Barrel terracotta')
            o.smooth=True
    # Roof edge covers the tile ends, never rises into the landing space.
    for side in range(4):
        local_box(side,'Terracotta roof edge',0,-6.45,8.98,13,.10,.08,'Barrel terracotta',.014)


def cornices(lite=False,variant='casa'):
    for side in range(4):
        local_box(side,'Limestone ground plinth',0,-5.94,.19,12.0,.24,.38,'Honey limestone',.035 if not lite else 0)
        for z,w,d,h in [(3.21,12.12,.24,.13),(5.67,12.06,.22,.12),(8.52,12.28,.33,.18),(8.71,12.62,.53,.16),(8.83,13,.60,.10)]:
            local_box(side,'Layered stone cornice',0,-5.94,z,w,d,h,'Honey limestone',.025 if not lite else 0)
        if not lite:
            for i in range(17):
                x=-5.65+i*11.3/16
                local_box(side,'Cornice dentil',x,-6.10,8.39,.23,.32,.15,'Honey limestone',.017)
            # Corner ashlar bands give each facade real depth and softened edges.
            for sign in [-1,1]:
                local_box(side,'Continuous corner pilaster backing',sign*5.60,-5.96,4.40,.68,.14,8.10,'Honey limestone')
                for i in range(13):
                    z=.63+i*.59
                    local_box(side,'Rusticated corner ashlar',sign*5.60,-5.96,z,.68,.20,.28,'Honey limestone',.025)


def generate(variant='casa',lite=False):
    MODULE.clear()
    box('Interior masonry volume',(0,0,4.35),(10.96,10.96,8.70),'Lime plaster')
    count=4 if variant!='arcade' else 3
    centers=[-4.25,-1.42,1.42,4.25] if count==4 else [-3.8,0,3.8]
    ww=1.22 if count==4 else 1.62
    for side in range(4):
        print('Building facade',variant,side,flush=True)
        holes=[]
        for z in [4.38,7.07]:
            for x in centers:holes.append((x-ww/2,x+ww/2,z-.92,z+.92))
        ground=[-3.85,0,3.85] if variant!='atelier' else [-3.25,3.25]
        gw=2.55 if variant!='atelier' else 3.35
        for x in ground:holes.append((x-gw/2,x+gw/2,.23,3.12))
        if lite:
            local_box(side,'Distant facade',0,-5.77,4.44,11.9,.36,8.4,'Lime plaster')
        else:wall_with_openings(side,holes)
        for z in [4.38,7.07]:
            for x in centers:window(side,x,z,ww,1.84,shutters=True,lite=lite)
        for x in ground:shop(side,x,gw,lite,door=(x==ground[0]))
        if not lite:
            # Window balconies occur on two faces; no object extends outside the 13 m module.
            if side in [0,1]:
                for x in ([-1.42,1.42] if count==4 else [0]):balcony(side,x,7.07,2.12)
            # Fine decorative band and inset ochre ceramic accents.
            if variant=='atelier':
                for x in [-3,0,3]:local_box(side,'Ochre ceramic frieze',x,-5.97,5.73,.28,.04,.13,'Warm ochre',.015)
            if variant=='arcade':
                for x in [-3.8,0,3.8]:
                    # Separate clerestory stone arches above rectangular shuttered windows.
                    voussoir_arch(side,x,7.89,.44,-5.99,.12,pieces=9)
        else:
            if side in [0,1]:balcony(side,0,7.07,1.9,lite=True)
    cornices(lite,variant)
    roof_tiles(lite)
    if not lite and variant=='atelier':
        # Low corner pier caps, outside the central ±5 m path, at or below roof plane.
        for x in [-6.2,6.2]:
            for y in [-6.2,6.2]:box('Corner cap inset',(x,y,8.90),(.48,.48,.16),'Honey limestone',.035)
    if not lite and variant in ['arcade','atelier']:
        plaster='Arcade pale plaster'if variant=='arcade'else'Atelier ochre plaster'
        for part in MODULE:
            if part.mat=='Lime plaster':part.mat=plaster
    # Light skyline LOD uses only main form, cornice, flat windows and arch silhouettes.
    return list(MODULE)


def join_materials(objects,lite=False):
    # Batch all authored parts into one mesh per material. No thousands of Blender scene objects.
    groups={}
    for part in objects:
        data=groups.setdefault(part.mat,{'verts':[],'faces':[],'smooth':[]})
        offset=len(data['verts']);rot=part.rotation_euler.to_matrix()
        data['verts'] += [tuple(rot@Vector(v)+part.location)for v in part.verts]
        data['faces'] += [tuple(offset+i for i in face)for face in part.faces]
        data['smooth'] += [part.smooth]*len(part.faces)
    result=[]
    import bmesh
    for name,data in groups.items():
        meshdata=bpy.data.meshes.new(name);meshdata.from_pydata(data['verts'],[],data['faces']);meshdata.update()
        bm=bmesh.new();bm.from_mesh(meshdata);bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(meshdata);bm.free()
        obj=bpy.data.objects.new(name,meshdata);bpy.context.collection.objects.link(obj)
        material=MATS[name]
        if lite:
            flatname='Distant — '+name
            if flatname not in MATS:
                source=material.node_tree.nodes.get('Principled BSDF')
                color=tuple(source.inputs['Base Color'].default_value)[:3]
                images=[n.image for n in material.node_tree.nodes if n.type=='TEX_IMAGE'and n.image and n.image.name.endswith('-color')]
                if images:
                    image=images[0];pixels=np.array(image.pixels[:]).reshape(-1,4).mean(axis=0)[:3]
                    color=tuple(float(c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4)for c in pixels)
                if name=='Deep blue glazing':color=(.012,.030,.040)
                m=bpy.data.materials.new(flatname);m.diffuse_color=(*color,1);m.use_nodes=True
                shader=m.node_tree.nodes.get('Principled BSDF');shader.inputs['Base Color'].default_value=(*color,1);shader.inputs['Roughness'].default_value=.90 if name=='Deep blue glazing'else .85
                MATS[flatname]=m
            material=MATS[flatname]
        obj.data.materials.append(material)
        if not lite:
            uv=meshdata.uv_layers.new(name='UVMap')
            for poly in meshdata.polygons:
                poly.use_smooth=data['smooth'][poly.index]
                axis=max(range(3),key=lambda i:abs(poly.normal[i]))
                for loopidx in poly.loop_indices:
                    co=meshdata.vertices[meshdata.loops[loopidx].vertex_index].co
                    pair=(co.x/3,co.y/3)if axis==2 else (co.x/3,co.z/3)if axis==1 else (co.y/3,co.z/3)
                    uv.data[loopidx].uv=pair
        result.append(obj)
    bpy.ops.object.select_all(action='DESELECT')
    for obj in result:obj.select_set(True)
    return result


def export_module(variant,lite=False,background_style='flat'):
    bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
    objs=generate(variant,lite)
    if lite and background_style=='pitched':
        mesh('Distant pitched roof',[(-6.5,-6.5,9),(6.5,-6.5,9),(0,-6.5,10.8),(-6.5,6.5,9),(6.5,6.5,9),(0,6.5,10.8)],[(0,3,5,2),(2,5,4,1)],'Barrel terracotta')
        mesh('Distant gable ends',[(-6.5,-6.5,9),(6.5,-6.5,9),(0,-6.5,10.8),(-6.5,6.5,9),(6.5,6.5,9),(0,6.5,10.8)],[(0,2,1),(3,4,5)],'Lime plaster')
    elif lite and background_style=='stepped':
        box('Distant setback upper floor',(1.5,1,9.55),(7.6,8.4,1.1),'Lime plaster')
        box('Distant setback terracotta roof',(1.5,1,10.16),(8.1,8.9,.12),'Barrel terracotta')
        for x in [-1,1.5,4]:
            box('Distant clerestory glass',(x,-3.22,9.55),(.72,.035,.52),'Deep blue glazing')
    merged=join_materials(MODULE,lite)
    name='distant-'+background_style if lite else variant
    bpy.ops.export_scene.gltf(filepath=str(OUT/f'{name}.glb'),export_format='GLB',use_selection=True,
        export_yup=True,export_apply=True,export_normals=True,export_texcoords=True,
        export_animations=False,export_materials='EXPORT',export_image_format='AUTO')
    tris=sum(len(p.vertices)-2 for o in merged for p in o.data.polygons)
    bounds=[]
    for o in merged:
        for v in o.bound_box:bounds.append(o.matrix_world@Vector(v))
    metadata={'name':name,'blender_version':bpy.app.version_string,'triangles':tris,
              'draw_calls_material_groups':len(merged),'bytes':(OUT/f'{name}.glb').stat().st_size,
              'footprint_xz_m':[13,13],'walkable_roof_y_m':None if lite else 9,'roof_decor_max_y_m':9.035,'background_only':lite,
              'central_path_clear_xz_m':[-5,5],
              'blender_bounds':[[min(v[i] for v in bounds)for i in range(3)],[max(v[i]for v in bounds)for i in range(3)]]}
    (DOC/f'{name}-metadata.json').write_text(json.dumps(metadata,indent=2))
    bpy.ops.file.pack_all()
    bpy.ops.wm.save_as_mainfile(filepath=str(ART/f'{name}.blend'))
    return metadata


def beauty(name):
    scene=bpy.context.scene
    groundmat=bpy.data.materials.new('Proof ground');groundmat.diffuse_color=(.22,.28,.27,1)
    bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.04));ground=bpy.context.object;ground.name='Render proof ground';ground.data.materials.append(groundmat)
    world=bpy.data.worlds.new('Daylight sky') if not scene.world else scene.world
    scene.world=world;world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.60,.76,1,1);world.node_tree.nodes['Background'].inputs[1].default_value=.45
    bpy.ops.object.light_add(type='SUN',location=(-8,-10,18));sun=bpy.context.object;sun.rotation_euler=(math.radians(24),math.radians(-21),math.radians(-28));sun.data.energy=3.5;sun.data.angle=.13
    bpy.ops.object.light_add(type='AREA',location=(3,-8,16));fill=bpy.context.object;fill.data.energy=400;fill.data.shape='DISK';fill.data.size=10;fill.rotation_euler=(Vector((0,0,4))-fill.location).to_track_quat('-Z','Y').to_euler()
    bpy.ops.object.camera_add(location=(18,-23,19));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,4.5))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=23.2;scene.camera=cam
    # Real-time PBR proof avoids starving the interactive game on the shared host.
    for engine in ['BLENDER_EEVEE_NEXT','BLENDER_EEVEE']:
        try:scene.render.engine=engine;break
        except TypeError:continue
    print('PROOF_ENGINE',scene.render.engine,flush=True)
    if hasattr(scene,'eevee') and hasattr(scene.eevee,'taa_render_samples'):scene.eevee.taa_render_samples=32
    scene.render.threads_mode='FIXED';scene.render.threads=4
    scene.render.resolution_x=1280;scene.render.resolution_y=1080;scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='PNG';scene.render.filepath=str(DOC/f'{name}-beauty.png')
    scene.view_settings.view_transform='AgX'
    bpy.ops.wm.save_as_mainfile(filepath=str(ART/f'{name}-proof.blend'))
    bpy.ops.render.render(write_still=True)


def finalize_runtime():
    names=['casa','arcade','atelier']
    for name in names:
        source=ART/f'{name}-original.glb';shutil.copy2(OUT/f'{name}.glb',source)
        command=['npx','--yes','@gltf-transform/cli@4.2.1','optimize',str(source),str(OUT/f'{name}.glb'),
                 '--compress','quantize','--flatten','false','--join','false','--instance','false',
                 '--palette','false','--simplify','false','--texture-compress','webp','--texture-size','512']
        with (DOC/f'optimize-{name}.log').open('w')as log:
            subprocess.run(command,cwd=ROOT,stdout=log,stderr=subprocess.STDOUT,check=True)
    allnames=names+['distant-flat','distant-pitched','distant-stepped']
    report=subprocess.run(['node',str(DOC/'check_geometry.mjs')]+[str(OUT/f'{name}.glb')for name in allnames],
                          cwd=ROOT,capture_output=True,text=True,check=True)
    (DOC/'runtime-checks.json').write_text(report.stdout)
    for row in json.loads(report.stdout):
        name=Path(row['path']).stem;path=DOC/f'{name}-metadata.json';meta=json.loads(path.read_text())
        meta.update(runtime_bytes=row['bytes'],runtime_sha256=row['sha256'],runtime_extensions=row['extensions'])
        path.write_text(json.dumps(meta,indent=2)+'\n')
    manifest={'details':['./architecture/'+name+'.glb'for name in names],
              'distant':['./architecture/'+name+'.glb'for name in allnames[3:]],'height':9,'footprint':[13,13],
              'roofDecorMax':9.035,'centralRoofClearance':[-5,5],'units':'metres','up':'+Y',
              'source':'Original Blender 5.2 LTS architecture; scripts/build_architecture.py',
              'backgroundOnly':allnames[3:]}
    (OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    print('VERIFIED_MANIFEST_READY',str(OUT/'manifest.json'),flush=True)


def main():
    args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
    parser=argparse.ArgumentParser();parser.add_argument('--variant',default='casa');parser.add_argument('--all',action='store_true');parser.add_argument('--render',action='store_true');parser.add_argument('--proof-only',action='store_true');opts=parser.parse_args(args)
    variants=['casa','arcade','atelier','distant-flat','distant-pitched','distant-stepped'] if opts.all else [opts.variant]
    if not opts.proof_only:
        print('Authoring local PBR maps',flush=True)
        materials()
        for name in variants:
            lite=name.startswith('distant')
            meta=export_module('casa' if lite else name,lite=lite,background_style=name.split('-')[-1]if lite else'flat')
            print('ROOFTOP_MODULE',json.dumps(meta),flush=True)
        print('EXPORT_PASS_COMPLETE',flush=True)
        if opts.all:finalize_runtime()
    if opts.render or opts.proof_only:
        for name in variants:
            if name.startswith('distant'):continue
            bpy.ops.wm.open_mainfile(filepath=str(ART/f'{name}.blend'))
            beauty(name)

if __name__=='__main__':main()
