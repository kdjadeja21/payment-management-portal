import { auth } from "@clerk/nextjs/server"
import { useAuth } from "@clerk/nextjs"

// Server-side auth
export async function getServerSession() {
  const { userId } = await auth()
  if (!userId) {
    return null
  }

  return {
    user: {
      id: userId,
    },
  }
}

// Client-side auth
export function useSession() {
  const { userId } = useAuth()
  if (!userId) {
    return null
  }

  return {
    user: {
      id: userId,
    },
  }
} 