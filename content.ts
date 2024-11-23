import type { PlasmoCSConfig } from "plasmo"

import { storage } from "~storage"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  run_at: "document_start"
}

async function main() {
  const href = decodeURIComponent(window.location.href)
  const data = await storage.getMany([
    "site.block.list",
    "site.block.redirectUrl"
  ])
  const blockLists: string[] = data["site.block.list"]
  const redirectUrl = data["site.block.redirectUrl"] ?? "https://google.com"
  const mustBlocked = blockLists.some((url) => href.includes(url))
  if (mustBlocked) {
    window.location.replace(redirectUrl)
  }
}

main()
