import { Check, Save } from "lucide-react"
import { useEffect, useState } from "react"

import {
  WARNING_TEMPLATES,
  WARNING_TEMPLATES_ARRAY,
  type WarningTemplate
} from "~lib/warning-templates"

import { WarningPreview } from "./warning-preview"

interface BlockAction {
  type: "redirect" | "close" | "warning"
  redirectUrl?: string
  warningTemplate?: string
}

interface BlockActionsProps {
  blockAction: BlockAction
  onUpdateBlockAction: (
    type: BlockAction["type"],
    redirectUrl?: string,
    warningTemplate?: string
  ) => void
}

const actions = [
  { value: "redirect" as const, label: "redirect", icon: "↗" },
  { value: "close" as const, label: "close", icon: "×" },
  { value: "warning" as const, label: "warn", icon: "!" }
]

export function BlockActions({
  blockAction,
  onUpdateBlockAction
}: BlockActionsProps) {
  const [localAction, setLocalAction] = useState<BlockAction>(blockAction)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setLocalAction(blockAction)
    setHasChanges(false)
  }, [blockAction])

  const handleActionTypeChange = (type: BlockAction["type"]) => {
    const newAction = { ...localAction, type }
    setLocalAction(newAction)
    setHasChanges(
      newAction.type !== blockAction.type ||
        newAction.redirectUrl !== blockAction.redirectUrl ||
        newAction.warningTemplate !== blockAction.warningTemplate
    )
  }

  const handleRedirectUrlChange = (redirectUrl: string) => {
    const newAction = { ...localAction, redirectUrl }
    setLocalAction(newAction)
    setHasChanges(
      newAction.type !== blockAction.type ||
        newAction.redirectUrl !== blockAction.redirectUrl ||
        newAction.warningTemplate !== blockAction.warningTemplate
    )
  }

  const handleWarningTemplateChange = (warningTemplate: string) => {
    const newAction = { ...localAction, warningTemplate }
    setLocalAction(newAction)
    setHasChanges(
      newAction.type !== blockAction.type ||
        newAction.redirectUrl !== blockAction.redirectUrl ||
        newAction.warningTemplate !== blockAction.warningTemplate
    )
  }

  const handleSave = () => {
    onUpdateBlockAction(
      localAction.type,
      localAction.redirectUrl,
      localAction.warningTemplate
    )
    setHasChanges(false)
  }

  return (
    <div className="space-y-2">
      {/* Action selector */}
      <div className="bg-zinc-950 rounded border border-zinc-800">
        <div className="px-2 py-1 border-b border-zinc-800">
          <span className="text-xs font-mono text-zinc-400">
            block behavior
          </span>
        </div>

        <div className="p-1">
          {actions.map((action) => (
            <button
              key={action.value}
              onClick={() => handleActionTypeChange(action.value)}
              className={`w-full flex items-center justify-between px-2 py-1 rounded text-xs font-mono transition-all ${
                localAction.type === action.value
                  ? "bg-white text-black"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
              }`}>
              <div className="flex items-center gap-2">
                <span className="w-4 text-center">{action.icon}</span>
                <span>{action.label}</span>
              </div>
              {localAction.type === action.value && (
                <Check className="w-3 h-3" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Redirect URL input */}
      {localAction.type === "redirect" && (
        <div className="bg-zinc-950 rounded border border-zinc-800">
          <div className="px-2 py-1 border-b border-zinc-800">
            <span className="text-xs font-mono text-zinc-400">
              redirect url
            </span>
          </div>
          <div className="p-2">
            <input
              placeholder="https://google.com"
              value={localAction.redirectUrl || ""}
              onChange={(e) => handleRedirectUrlChange(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 font-mono"
            />
          </div>
        </div>
      )}

      {/* Warning template selection */}
      {localAction.type === "warning" && (
        <div className="bg-zinc-950 rounded border border-zinc-800">
          <div className="px-2 py-1 border-b border-zinc-800">
            <span className="text-xs font-mono text-zinc-400">
              warning style
            </span>
          </div>
          <div className="p-1 space-y-1">
            {WARNING_TEMPLATES_ARRAY.map((template) => (
              <button
                key={template.id}
                onClick={() => handleWarningTemplateChange(template.id)}
                className={`w-full flex items-center justify-between px-2 py-1 rounded text-xs font-mono transition-all ${
                  localAction.warningTemplate === template.id
                    ? "bg-white text-black"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                }`}>
                <div className="flex items-center gap-2">
                  <span className="w-4 text-center">{template.icon}</span>
                  <span>{template.name}</span>
                </div>
                {localAction.warningTemplate === template.id && (
                  <Check className="w-3 h-3" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Warning template preview */}
      {localAction.type === "warning" && localAction.warningTemplate && (
        <WarningPreview templateId={localAction.warningTemplate} />
      )}

      {/* Save button */}
      {hasChanges && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-3 py-1 bg-white text-black rounded text-xs font-mono hover:bg-zinc-200 transition-all">
            <Save className="w-3 h-3" />
            save
          </button>
        </div>
      )}

      {/* Status */}
      <div className="bg-zinc-950 rounded border border-zinc-800">
        <div className="px-2 py-1 border-b border-zinc-800">
          <span className="text-xs font-mono text-zinc-400">active rule</span>
        </div>
        <div className="px-2 py-1">
          <span className="text-xs font-mono text-green-400">
            {blockAction.type === "redirect" &&
              `→ ${blockAction.redirectUrl || "https://google.com"}`}
            {blockAction.type === "close" && "× close tab"}
            {blockAction.type === "warning" &&
              `! ${WARNING_TEMPLATES[blockAction.warningTemplate || "minimal"]?.name || "minimal"} warning`}
          </span>
        </div>
      </div>
    </div>
  )
}
