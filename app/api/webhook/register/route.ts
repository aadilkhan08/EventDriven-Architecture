import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  // Get the webhook secret from environment variable
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return new Response("Missing webhook secret", { status: 400 });
  }

  // Get the headers from the request
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // Check if all headers are present
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  // Get the payload from the request
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Webhook instance
  const webhook = new Webhook(WEBHOOK_SECRET);

  // Verify the payload
  let evt: WebhookEvent;

  try {
    // Verify the payload
    evt = webhook.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;

  } catch (_error) {
    return new Response("Invalid signature", { status: 400 });
  }

  //   get the data from the event coming from clerk webhook
  const eventType = evt.type;

  //   check if the event type is user.created
  if (eventType === "user.created") {
    try {
      const { email_addresses, primary_email_address_id } = evt.data;
      const primaryEmail = email_addresses.find(
        (email) => email.id === primary_email_address_id
      );

      if (!primaryEmail) {
        throw new Response("Primary email not found", { status: 400 });
      }

      //   create a new user
      const newUser = await prisma.user.create({
        data: {
          id: evt.data.id!,
          email: primaryEmail.email_address,
          isSubscribed: false,
        },
      });
      console.log("New user created: ", newUser);
    } catch (error: unknown) {
      return new Response(JSON.stringify(error || "Failed to create user"), {
        status: 400,
      });
    }
  }

  return new Response("Success", { status: 200 });
}

