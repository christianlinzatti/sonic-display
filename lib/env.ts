export function getEnv(){
  const required=(name:string)=>{const v=process.env[name];if(!v)throw new Error(`Missing environment variable: ${name}`);return v;};
  return {clientId:required("SPOTIFY_CLIENT_ID"),clientSecret:required("SPOTIFY_CLIENT_SECRET"),redirectUri:required("SPOTIFY_REDIRECT_URI"),sessionSecret:required("SESSION_SECRET"),userAgent:process.env.LRCLIB_USER_AGENT||"SonicDisplay/0.1.0"};
}
