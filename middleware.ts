// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
  publicRoutes: ["/sign-in", "/sign-up", "/dashboard"],
});

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)", // protect all routes except static files and _next
    "/", 
    "/(api|trpc)(.*)",            // include your API routes if needed
  ],
};
