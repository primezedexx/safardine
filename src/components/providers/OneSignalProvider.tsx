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
          
          const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
          
          // OneSignal strictly enforces the origin based on its dashboard configuration.
          // Since it's locked to safardine.vercel.app, initializing it on localhost will crash the dev server.
          if (isLocalhost) {
            console.info("OneSignal: Bypassing initialization on localhost to prevent origin restriction errors.");
            return;
          }
          
          const initOptions: any = {
            appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
            allowLocalhostAsSecureOrigin: true,
            autoRegister: false, 
            notifyButton: {
              enable: false,
            },
          };

          if (process.env.NEXT_PUBLIC_ONESIGNAL_SAFARI_WEB_ID) {
            initOptions.safari_web_id = process.env.NEXT_PUBLIC_ONESIGNAL_SAFARI_WEB_ID;
          }

          await OneSignal.init(initOptions);

          // Log in the user to associate devices with their Supabase user ID
          if (userId) {
            if (typeof OneSignal.login === 'function') {
              await OneSignal.login(userId);
            } else if (typeof (OneSignal as any).setExternalUserId === 'function') {
              await (OneSignal as any).setExternalUserId(userId);
            }
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
