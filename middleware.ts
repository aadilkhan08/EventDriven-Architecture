import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/clerk-sdk-node";

const publicRoutes = createRouteMatcher([
  "/",
  "/api/webhook/register",
  "/sign-in",
  "/sign-up",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const isApiRoute = req.nextUrl.pathname.startsWith("/api");

  // Handle unauthenticated users
  if (!userId && !publicRoutes(req)) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    } else {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }

  // Handle authenticated users
  if (userId) {
    try {
      const user = await clerkClient.users.getUser(userId);
      if (!user) {
        if (isApiRoute) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        } else {
          return NextResponse.redirect(new URL("/sign-in", req.url));
        }
      }

      const role = user.publicMetadata.role as string | undefined;

      // Apply redirect logic only to non-API routes
      if (!isApiRoute) {
        if (role === "admin" && !req.nextUrl.pathname.startsWith("/admin/dashboard")) {
          return NextResponse.redirect(new URL("/admin/dashboard", req.url));
        }
        if (role !== "admin" && req.nextUrl.pathname.startsWith("/admin")) {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
        if (publicRoutes(req)) {
          return NextResponse.redirect(
            new URL(role === "admin" ? "/admin/dashboard" : "/dashboard", req.url)
          );
        }
      }
    } catch (error: unknown) {
      console.error("Error fetching user data from Clerk:", error);
      if (isApiRoute) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      } else {
        return NextResponse.redirect(new URL("/error", req.url));
      }
    }
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};