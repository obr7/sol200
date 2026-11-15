from PIL import Image
import numpy as np, json, base64, io
files={'diego':'af31c7bf-image.png','marcus':'a9301eea-image.png','lead':'c16a0728-image.png','layla':'8426948b-image.png'}
meta=json.load(open('meta.json'))
def segs(v,th=2):
    out=[];inside=False
    for i,x in enumerate(v):
        if x>th and not inside: s=i;inside=True
        elif x<=th and inside: out.append((s,i));inside=False
    if inside: out.append((s,len(v)))
    return [p for p in out if p[1]-p[0]>40]
def b64(im):
    b=io.BytesIO(); im.save(b,'PNG',optimize=True); return 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
out={}
for n,f in files.items():
    src=Image.open('/mnt/user-data/uploads/'+f).convert('RGBA'); a=np.array(src); occ=a[:,:,3]>40
    R=segs(occ.sum(1)); C=segs(occ.sum(0))
    y0,y1=R[0]; x0,x1=C[0]
    cell=src.crop((x0,y0,x1,y1)); m=np.array(cell)[:,:,3]>40; ys,xs=np.where(m)
    top=ys.min(); cx=(xs.min()+xs.max())/2; hgt=ys.max()-top
    side=int(hgt*0.46)  # head + shoulders
    box=(int(cx-side/2),top-4,int(cx+side/2),top-4+side)
    por=cell.crop(box)
    arr=np.array(por).astype(float); al=arr[:,:,3:4]/255; arr[:,:,:3]*=al
    pm=Image.fromarray(arr.clip(0,255).astype('uint8'),'RGBA').resize((40,40),Image.BOX)
    p=np.array(pm).astype(float); A=p[:,:,3:4]/255
    rgb=np.where(A>0.01,p[:,:,:3]/np.maximum(A,0.01),0)
    o=np.zeros((40,40,4),dtype='uint8'); o[:,:,:3]=rgb.clip(0,255); o[:,:,3]=np.where(p[:,:,3]>110,255,0)
    pim=Image.fromarray(o,'RGBA'); al=np.array(pim)[:,:,3]
    q=np.array(pim.convert('RGB').quantize(colors=32,method=Image.MEDIANCUT,dither=Image.NONE).convert('RGBA')); q[:,:,3]=al
    pim=Image.fromarray(q,'RGBA'); pim.save(f'{n}_portrait.png')
    out[n]={'atlas':b64(Image.open(f'{n}_atlas.png')),'w':meta[n]['w'],'h':meta[n]['h'],'portrait':b64(pim)}
js='// Character sprite sheets drawn by the team (ChatGPT image generation), sliced and scaled for the game.\n// Rows: 0 down, 1 left, 2 right, 3 up. Columns: 4 walk frames (0 = standing).\nconst TEAM_SPRITES = '+json.dumps(out)+';\n'
open('/home/claude/sol200/src/teamsprites.js','w').write(js)
print(len(js)//1024,'KB')
