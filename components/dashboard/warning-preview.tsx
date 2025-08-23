import { WARNING_TEMPLATES } from "~lib/warning-templates"

interface WarningPreviewProps {
  templateId?: string
}

export function WarningPreview({
  templateId = "minimal"
}: WarningPreviewProps) {
  const template = WARNING_TEMPLATES[templateId]

  if (!template) return null

  const colorClasses = {
    red: "border-red-800 bg-red-950/50 text-red-300",
    amber: "border-amber-800 bg-amber-950/50 text-amber-300",
    blue: "border-blue-800 bg-blue-950/50 text-blue-300",
    purple: "border-purple-800 bg-purple-950/50 text-purple-300",
    green: "border-green-800 bg-green-950/50 text-green-300"
  }

  return (
    <div className="bg-zinc-950 rounded border border-zinc-800">
      <div className="px-2 py-1 border-b border-zinc-800">
        <span className="text-xs font-mono text-zinc-400">preview</span>
      </div>
      <div className="p-2">
        <div className={`rounded border p-3 ${colorClasses[template.color]}`}>
          <div className="text-sm font-mono font-semibold mb-2">
            {template.title}
          </div>
          <div className="text-xs font-mono opacity-90">{template.message}</div>
        </div>
      </div>
    </div>
  )
}
