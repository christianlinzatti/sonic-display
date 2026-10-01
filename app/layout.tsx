import type {Metadata} from "next";
import "./globals.css";
import { UiPreferencesProvider } from "@/context/UiPreferencesContext";
export const metadata:Metadata={title:"Sonic Display",description:"Spotify now playing and lyrics display"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="de"><body><UiPreferencesProvider>{children}</UiPreferencesProvider></body></html>;}
