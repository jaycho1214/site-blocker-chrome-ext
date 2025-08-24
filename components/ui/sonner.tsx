import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        style: {
          background: "rgb(9 9 11)", // zinc-950
          border: "1px solid rgb(39 39 42)", // zinc-800
          color: "rgb(244 244 245)", // zinc-100
          fontFamily:
            "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
          fontSize: "12px",
          borderRadius: "6px",
          padding: "8px 12px"
        },
        classNames: {
          success: "!text-green-400",
          error: "!text-red-400",
          warning: "!text-amber-400",
          info: "!text-blue-400"
        }
      }}
      {...props}
    />
  )
}

export { Toaster }
