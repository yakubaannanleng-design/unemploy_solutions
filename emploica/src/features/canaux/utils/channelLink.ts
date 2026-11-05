// PROBLÈME RÉSOLU : refuse les liens de canaux dont le protocole n'est pas HTTP(S).
export function isValidChannelLink(link: string): boolean {
  try {
    const url = new URL(link);
    return (url.protocol === "https:" || url.protocol === "http:") && !!url.hostname;
  } catch {
    return false;
  }
}
