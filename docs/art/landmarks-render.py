"""Offline geometry proof. Does not start a browser or alter runtime assets.
Blender --background --threads 4 --python docs/art/landmarks-render.py
Node-only GLB omits canvas sign, clock and mural paint; runtime includes these.
"""
import bpy, math
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(ROOT/'docs/art/landmarks-proof.glb'))
scene=bpy.context.scene
scene.render.engine='CYCLES'
scene.cycles.samples=24
scene.render.threads_mode='FIXED'
scene.render.threads=4
scene.cycles.use_denoising=True
scene.render.image_settings.file_format='PNG'
scene.world=bpy.data.worlds.new('Warm blue sky')
scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.50,.66,.72,1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value=.65
scene.view_settings.view_transform='AgX'
def material(name,color):
    m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
    m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(*color,1)
    m.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value=.85
    return m
floor=material('Review roof lime',(.70,.62,.47))
for i in range(9):
    bpy.ops.mesh.primitive_cube_add(size=1,location=((i%3)*12,-(i//3)*12,-.18))
    o=bpy.context.object;o.name='Proof pedestal';o.dimensions=(11.85,11.85,.3)
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    bevel=o.modifiers.new('Stone edge','BEVEL');bevel.width=.07;bevel.segments=2
    o.data.materials.append(floor)
sun_data=bpy.data.lights.new('Late morning sun','SUN');sun_data.energy=2.8;sun_data.angle=.12
sun=bpy.data.objects.new('Late morning sun',sun_data);scene.collection.objects.link(sun);sun.rotation_euler=(math.radians(26),math.radians(-22),math.radians(-24))
area_data=bpy.data.lights.new('Sky fill','AREA');area_data.energy=1800;area_data.shape='DISK';area_data.size=28
area=bpy.data.objects.new('Sky fill',area_data);scene.collection.objects.link(area);area.location=(12,-12,28)
cam_data=bpy.data.cameras.new('Proof camera');cam=bpy.data.objects.new('Proof camera',cam_data);scene.collection.objects.link(cam);scene.camera=cam
def render(name,position,target,scale,w=1280,h=1050):
    cam.location=position;cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler()
    cam_data.type='ORTHO';cam_data.ortho_scale=scale
    scene.render.resolution_x=w;scene.render.resolution_y=h;scene.render.resolution_percentage=100
    scene.render.filepath=str(ROOT/'docs/art'/name);bpy.ops.render.render(write_still=True)
render('landmarks-overview.png',(40,-49,38),(10,-11,1.2),45,1500,1250)
render('landmarks-bell-cafe.png',(30,-17,14),(17,-2.0,2.2),25,1400,1050)
