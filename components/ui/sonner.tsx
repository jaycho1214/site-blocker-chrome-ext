import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        style: {
          background: "rgb(24 24 27)",
          border: "1px solid rgb(63 63 70)",
          color: "rgb(244 244 245)"
        }
      }}
      {...props}
    />
  )
}

export { Toaster }
