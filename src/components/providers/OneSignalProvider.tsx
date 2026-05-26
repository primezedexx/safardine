"use client";

import { useEffect, useRef } from "react";
import OneSignal from "react-onesignal";

export default function OneSignalProvider({
  userId,
}: {
  userId?: string | null;
}) {
  const initialized = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !initialized.current) {
      initialized.current = true;
      const initOneSignal = async () => {
        try {
          if (!process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID) {
            console.warn("Missing NEXT_PUBLIC_ONESIGNAL_APP_ID");
            return;
          }
          
          await OneSignal.init({
            appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
            safari_web_id: process.env.NEXT_PUBLIC_ONESIGNAL_SAFARI_WEB_ID,
            allowLocalhostAsSecureOrigin: true,
            // We want to trigger the prompt manually later via our custom UI
            // @ts-ignore - The react-onesignal types for this are sometimes overly strict
            autoRegister: false, 
            notifyButton: {
              enable: false,
            } as any,
          });

          // Log in the user to associate devices with their Supabase user ID
          if (userId) {
            await OneSignal.login(userId);
          }
        } catch (error) {
          console.error("OneSignal Init Error:", error);
        }
      };

      initOneSignal();
    }
  }, [userId]);

  return null;
}
