"""Narrow correction to the existing Rooftop Radio distant Blender modules only."""
import bpy, json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
names=['distant-flat','distant-pitched','distant-stepped']
for name in names:
    path=ROOT/'art/architecture'/f'{name}.blend'
    bpy.ops.wm.open_mainfile(filepath=str(path))
    moved=0
    for obj in bpy.context.scene.objects:
        if obj.type!='MESH' or not obj.data.materials:continue
        material=obj.data.materials[0]
        if material.name!='Distant — Deep blue glazing':continue
        shader=material.node_tree.nodes.get('Principled BSDF')
        shader.inputs['Base Color'].default_value=(.012,.030,.040,1)
        shader.inputs['Roughness'].default_value=.90
        data=obj.data
        neighbors=[set()for _ in data.vertices]
        for edge in data.edges:
            a,b=edge.vertices;neighbors[a].add(b);neighbors[b].add(a)
        unseen=set(range(len(data.vertices)))
        while unseen:
            first=unseen.pop();component={first};stack=[first]
            while stack:
                for other in neighbors[stack.pop()]:
                    if other in unseen:unseen.remove(other);component.add(other);stack.append(other)
            mins=[min(data.vertices[i].co[a]for i in component)for a in range(3)]
            maxs=[max(data.vertices[i].co[a]for i in component)for a in range(3)]
            axis=min([0,1],key=lambda a:maxs[a]-mins[a])
            center=(mins[axis]+maxs[axis])/2
            # Main facade panes only; the setback clerestory is already outside its own face.
            if abs(center)>5.2:
                delta=(5.985 if center>0 else -5.985)-center
                for i in component:data.vertices[i].co[axis]+=delta
                moved+=1
        data.update()
    bpy.ops.object.select_all(action='DESELECT')
    for obj in bpy.context.scene.objects:
        if obj.type=='MESH':obj.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(ROOT/'public/architecture'/f'{name}.glb'),export_format='GLB',use_selection=True,export_yup=True,export_apply=True,export_normals=True,export_texcoords=True,export_animations=False,export_materials='EXPORT',export_image_format='AUTO')
    bpy.ops.wm.save_as_mainfile(filepath=str(path))
    print('FIXED_DISTANT',name,'visible glazing components',moved,flush=True)
