import {NextResponse} from "next/server";
import {getConfigurationSnapshotV667} from "@/services/system/configurationStatusV667";
export const dynamic="force-dynamic";
/** No active external probes; only a safe allowlist of boolean configuration flags. */
export async function GET(){
  return NextResponse.json(getConfigurationSnapshotV667(process.env),{
    headers:{"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}
  });
}
