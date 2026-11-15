from PIL import Image
import numpy as np, json, sys
H=int(sys.argv[1]) if len(sys.argv)>1 else 38
files={'diego':'af31c7bf-image.png','marcus':'a9301eea-image.png','lead':'c16a0728-image.png','layla':'8426948b-image.png'}
def segs(v,th=2):
    out=[];inside=False
    for i,x in enumerate(v):
        if x>th and not inside: s=i;inside=True
        elif x<=th and inside: out.append((s,i));inside=False
    if inside: out.append((s,len(v)))
    return [p for p in out if p[1]-p[0]>40]
meta={}
for n,f in files.items():
    src=Image.open('/mnt/user-data/uploads/'+f).convert('RGBA'); a=np.array(src)
    occ=a[:,:,3]>40
    R=segs(occ.sum(1)); C=segs(occ.sum(0))
    assert len(R)==4 and len(C)==4,(n,R,C)
    # global scale from tallest sprite so all frames share the same scale
    tall=max(r[1]-r[0] for r in R); k=H/tall
    frames=[]
    for ri,(y0,y1) in enumerate(R):
        for ci,(x0,x1) in enumerate(C):
            cell=src.crop((x0-4,y0-4,x1+4,y1+4))
            cc=np.array(cell); m=cc[:,:,3]>40; ys,xs=np.where(m)
            cell=cell.crop((xs.min(),ys.min(),xs.max()+1,ys.max()+1))
            w=max(1,round(cell.width*k)); h=max(1,round(cell.height*k))
            # premultiplied area downscale, then crisp alpha + palette
            arr=np.array(cell).astype(float); al=arr[:,:,3:4]/255; arr[:,:,:3]*=al
            pm=Image.fromarray(arr.clip(0,255).astype('uint8'),'RGBA').resize((w,h),Image.BOX)
            p=np.array(pm).astype(float); A=p[:,:,3:4]/255
            rgb=np.where(A>0.01,p[:,:,:3]/np.maximum(A,0.01),0)
            out=np.zeros((h,w,4),dtype='uint8'); out[:,:,:3]=rgb.clip(0,255); out[:,:,3]=np.where(p[:,:,3]>110,255,0)
            frames.append(Image.fromarray(out,'RGBA'))
    # palette-quantize all frames together for clean pixel colors
    W=max(fr.width for fr in frames)+2; HH=max(fr.height for fr in frames)+1
    atlas=Image.new('RGBA',(W*4,HH*4),(0,0,0,0))
    for i,fr in enumerate(frames):
        r,c=divmod(i,4); atlas.paste(fr,(c*W+(W-fr.width)//2, r*HH+HH-fr.height),fr)
    al=np.array(atlas)[:,:,3]
    q=atlas.convert('RGB').quantize(colors=40,method=Image.MEDIANCUT,dither=Image.NONE).convert('RGBA')
    qa=np.array(q); qa[:,:,3]=al; atlas=Image.fromarray(qa,'RGBA')
    atlas.save(f'{n}_atlas.png'); meta[n]={'w':W,'h':HH}
    print(n,'scale',round(k,4),'frame',W,HH)
json.dump(meta,open('meta.json','w'))
