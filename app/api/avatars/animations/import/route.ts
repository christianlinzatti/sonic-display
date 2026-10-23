import { NextRequest, NextResponse } from "next/server";
import { isAdmin, sameOrigin } from "@/lib/avatarAdmin";
import { useBlob } from "@/lib/avatarBlob";
import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({error:"Nicht angemeldet"},{status:401});
  if (!sameOrigin(req)) return NextResponse.json({error:"Origin mismatch"},{status:403});
  if (process.env.NODE_ENV !== "development" || useBlob) return NextResponse.json({error:"Lokaler Import nur in der Entwicklung ohne Blob"},{status:403});
  try {
    const file=(await req.formData()).get("file");
    if (!(file instanceof File) || !/\.glb$/i.test(file.name) || file.size>35*1024*1024 || file.size<20) return NextResponse.json({error:"GLB erforderlich (max. 35 MB)"},{status:400});
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (new TextDecoder().decode(bytes.slice(0,4))!=="glTF") return NextResponse.json({error:"Ungültiger GLB-Header"},{status:400});
    const name=`animation-${randomUUID()}.glb`;
    const dir=path.join(process.cwd(),"public","animations");
    await mkdir(dir,{recursive:true}); await writeFile(path.join(dir,name),bytes);
    return NextResponse.json({url:`/animations/${name}`});
  } catch {return NextResponse.json({error:"Import fehlgeschlagen"},{status:500});}
}
