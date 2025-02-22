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
  // Get the user's ID
  const { userId } = await auth();

  // If the user is not logged in and the request is not to a public route, redirect to the sign-in page
  if (!userId && !publicRoutes(req)) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // If the user is logged in, get their data
  if (userId) {
    try {
      // Get the user's data
      const user = await clerkClient.users.getUser(userId);
      if (!user) {
        return NextResponse.redirect(new URL("/sign-in", req.url));
      }

      // Get the user's role
      const role = user.publicMetadata.role as string | undefined;

      // Check if the user has the required role
      if (role === "admin" && !req.nextUrl.pathname.startsWith("/admin/dashboard")) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }

      // Redirect non-admin users to their dashboard
      if (role !== "admin" && req.nextUrl.pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      if (publicRoutes(req)) {
        return NextResponse.redirect(
          new URL(role === "admin" ? "/admin/dashboard" : "/dashboard", req.url)
        );
      }
    } catch (error: unknown) {
      console.error("Error fetching user data from Clerk:", error);
      return NextResponse.redirect(new URL("/error", req.url));
    }
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
