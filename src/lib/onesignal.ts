export async function sendPushNotification({
  userIds,
  title,
  message,
  url,
  tags
}: {
  userIds?: string[];
  title: string;
  message: string;
  url?: string;
  tags?: { key: string, relation: string, value: string }[];
}) {
  const ONE_SIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
  const ONE_SIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

  if (!ONE_SIGNAL_APP_ID || !ONE_SIGNAL_REST_API_KEY) {
    console.warn("OneSignal credentials missing, skipping push notification.");
    return null;
  }

  try {
    const payload: any = {
      app_id: ONE_SIGNAL_APP_ID,
      target_channel: "push",
      headings: { en: title },
      contents: { en: message },
    };

    if (url) {
      payload.url = url;
    }

    if (userIds && userIds.length > 0) {
      payload.include_aliases = { external_id: userIds };
    } else if (tags && tags.length > 0) {
      // Targeting by tags instead of specific users
      payload.filters = tags;
    } else {
      // Broadcast to all
      payload.included_segments = ["Subscribed Users"];
    }

    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${ONE_SIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OneSignal Error Payload:", errorData);
      throw new Error(`OneSignal API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to send push notification:", error);
    return null;
  }
}
