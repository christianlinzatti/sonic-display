import type {Metadata} from "next";
import "./globals.css";
export const metadata:Metadata={title:"Sonic Display",description:"Spotify now playing and lyrics display"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="de"><body>{children}</body></html>;}
