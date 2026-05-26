import { NextResponse } from "next/server";
import { sendPushNotification } from "@/lib/onesignal";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // In a real app, verify that 'user' is an admin.
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, message, url, userIds, tags } = body;

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
    }

    const result = await sendPushNotification({
      title,
      message,
      url,
      userIds,
      tags
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
