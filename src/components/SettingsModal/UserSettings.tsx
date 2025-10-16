import { useSession } from "next-auth/react"
import { Icon } from "@iconify/react"

const socialProviders = [
  { name: "Google", icon: "flat-color-icons:google", provider: "google" },
  { name: "Github", icon: "ant-design:github-outlined", provider: "github" },
]

export const UserSettings = () => {
  const { data: session } = useSession()

  const provider = session?.user?.provider
  const providerData = socialProviders.find((p) => p.provider === provider)

  return (
    <div className="text-[15px] divide-y divide-divider-line text-primary-text">
      {/* Name */}
      <div className="flex items-center justify-between py-3">
        <p>Name</p>
        <ul className="flex items-center gap-2">
          <ol>{session?.user?.name}</ol>
          {providerData && (
            <Icon icon={providerData.icon} fontSize={20} />
          )}
        </ul>
      </div>

      {/* Email */}
      <div className="flex items-center justify-between py-3">
        <p>Email</p>
        <div className="flex items-center gap-3">
          <p>{session?.user?.email ?? "-"}</p>
          {!providerData && (
            <button className="text-sm text-blue-400 hover:underline">
              Alterar
            </button>
          )}
        </div>
      </div>

      {/* Password */}
      {!providerData && (
        <div className="flex items-center justify-between py-3">
          <p>Password</p>
          <button className="text-sm text-blue-400 hover:underline">
            Alterar
          </button>
        </div>
      )}
    </div>
  )
}
