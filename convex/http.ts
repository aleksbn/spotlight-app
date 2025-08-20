import { httpRouter } from "convex/server";
import { Webhook } from "svix";
import { api } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("CLERK_WEBHOOK_SECRET is not set");
    }
    const svix_id = req.headers.get("svix-id");
    const svix_timestamp = req.headers.get("svix-timestamp");
    const svix_signature = req.headers.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response("Missing headers", { status: 400 });
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(webhookSecret);
    let evt: any = null;

    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as any;
    } catch (err) {
      console.log(err);
      return new Response("Error occured", { status: 400 });
    }

    const evtType = evt.type;

    if (evtType === "user.created") {
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;
      const email = email_addresses[0].email_address;
      const name = `${first_name} ${last_name}`.trim();

      try {
        await ctx.runMutation(api.users.createUser, {
          email,
          fullName: name,
          image: image_url,
          clerkId: id,
          username: email.split("@")[0],
        });
      } catch (err) {
        console.log(err);
        return new Response("Error occured", { status: 500 });
      }
    }

    return new Response("Webhook processed successfully", { status: 200 });
  }),
});

export default http;
