import "./popup.css"

import { useEffect, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import {
  Cancel01Icon,
  GithubIcon,
  SecurityBlockIcon,
  Settings02Icon
} from "~popup/icons"

function BlockListPage() {
  const [tab, setTab] = useState<chrome.tabs.Tab>()
  const [tempUrl, setTempUrl] = useState<string | null>(null)
  const [blockLists, setBlockLists] = useStorage<string[]>(
    "site.block.list",
    (v) => (v === undefined ? [] : v)
  )

  useEffect(() => {
    chrome.tabs.query({ currentWindow: true, active: true }).then((tabs) => {
      const tab = tabs[0]
      setTab(tab)
    })
  }, [])

  return (
    <div className="blocklist__container">
      <div className="blocklist__info__container">
        <img src={tab?.favIconUrl} />
        <h2>{tab?.title}</h2>
      </div>
      {tempUrl == null ? (
        <div className="blocklist_btn_container">
          <button
            className="blocklist_btn"
            onClick={() => {
              setBlockLists((state) => {
                const href = decodeURIComponent(tab.url)
                state.push(new URL(href).hostname.replace(/^www\./, ""))
                return [...new Set(state)]
              })
            }}
            disabled={blockLists.some((url) =>
              url.includes(decodeURIComponent(tab.url))
            )}>
            {blockLists.some((url) => url.includes(decodeURIComponent(tab.url)))
              ? "Already Blocked"
              : "Add to blocklist"}
          </button>
          <button className="blocklist_btn" onClick={() => setTempUrl(tab.url)}>
            Add custom URL
          </button>
        </div>
      ) : (
        <div className="blocklist_url_container">
          <input
            type="url"
            placeholder="Enter URL... (Supports Regex)"
            className="blocklist_url_input"
            onChange={(ev) => setTempUrl(ev.target.value)}
            value={tempUrl}
          />
          <button
            className="blocklist_btn"
            disabled={tempUrl.trim() === ""}
            onClick={() => {
              setBlockLists((state) => {
                const href = decodeURIComponent(tempUrl.trim())
                state.push(href)
                return [...new Set(state)]
              })
              setTempUrl(null)
            }}>
            Add
          </button>
          <button className="blocklist_btn" onClick={() => setTempUrl(null)}>
            Cancel
          </button>
        </div>
      )}
      <div className="divider" />
      <div className="blocklist_list_container">
        {blockLists.length === 0 && <p>Empty Blocklist...</p>}
        {blockLists.map((url, idx) => (
          <div key={url} className="blocklist__row">
            <span>
              {idx + 1}. {url}
            </span>
            <button
              onClick={() =>
                setBlockLists((state) => {
                  return state.filter((s) => s !== url)
                })
              }>
              <Cancel01Icon width={10} height={10} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
function SettingsPage() {
  const [redirectUrl, setRedirectUrl] = useStorage<string>(
    "site.block.redirectUrl",
    (v) => (v === undefined ? "https://google.com" : v)
  )

  return (
    <div className="settings__container">
      <div className="settings__row__container">
        <p>Redirect URL</p>
        <input
          type="url"
          value={redirectUrl}
          className="blocklist_url_input"
          onChange={(ev) => setRedirectUrl(ev.target.value)}
        />
      </div>
    </div>
  )
}

export default function IndexPopup() {
  const [tabIndex, setTabIndex] = useState(0)

  return (
    <div className="container">
      <div className="header">
        <h2>Site Blocker</h2>
        <a
          href="https://github.com/jaycho1214/site-blocker-chrome-ext"
          target="_blank">
          <GithubIcon />
        </a>
      </div>
      <div className="tab__container">
        {[<BlockListPage />, <SettingsPage />][tabIndex]}
      </div>
      <div className="tab__btn__container">
        {[<SecurityBlockIcon />, <Settings02Icon />].map((value, idx) => (
          <button
            key={idx}
            onClick={() => setTabIndex(idx)}
            className="tab__btn"
            data-selected={idx === tabIndex}>
            {value}
          </button>
        ))}
      </div>
    </div>
  )
}
