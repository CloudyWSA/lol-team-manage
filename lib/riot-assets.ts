export const DDRAGON_BASE = "https://ddragon.leagueoflegends.com"
export const CDRAGON_BASE = "https://raw.communitydragon.org/latest"

export async function getLatestVersion() {
  try {
    const response = await fetch("https://ddragon.leagueoflegends.com/api/versions.json", {
      next: { revalidate: 3600 } // Cache for 1 hour
    })
    const versions = await response.json()
    return versions[0]
  } catch (error) {
    console.error("Failed to fetch Riot version:", error)
    return "16.2.1" // Fallback
  }
}

export function getChampionIcon(championName: string, version: string) {
  // Normalize names for Data Dragon: "Lee Sin" -> "LeeSin", "Kai'Sa" -> "Kaisa"
  // Note: some champions have special internal names (e.g., Wukong -> MonkeyKing)
  let normalized = championName.replace(/[\s']+/g, "")
  if (normalized === "Wukong") normalized = "MonkeyKing"
  if (normalized === "LeBlanc") normalized = "Leblanc"
  
  return `${DDRAGON_BASE}/cdn/${version}/img/champion/${normalized}.png`
}

export function getItemIcon(itemId: string | number, version: string) {
  return `${DDRAGON_BASE}/cdn/${version}/img/item/${itemId}.png`
}

export function getRuneIcon(runePath: string) {
  // Community Dragon is usually better for runes/perks
  return `${CDRAGON_BASE}/plugins/rcp-be-lol-game-data/global/default/v1/${runePath.toLowerCase()}`
}

export function getChampionSplash(championName: string) {
  let normalized = championName.replace(/[\s']+/g, "")
  if (normalized === "Wukong") normalized = "MonkeyKing"
  
  return `${DDRAGON_BASE}/cdn/img/champion/splash/${normalized}_0.jpg`
}
