"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";
import OneSignal from "react-onesignal";

export default function NotificationPromptModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only check after a short delay to not interrupt initial dashboard load
    const timer = setTimeout(async () => {
      if (typeof window !== "undefined") {
        const hasPrompted = localStorage.getItem("safardine_notif_prompted");
        if (!hasPrompted) {
          try {
            // Check native browser notification permission state
            if ("Notification" in window) {
              const permission = Notification.permission;
              // If it's 'default', it means the user hasn't been asked yet.
              if (permission === "default") {
                setIsOpen(true);
              } else if (permission === "granted") {
                // Already granted, ensure OneSignal is registered since autoRegister is false
                if (OneSignal.Notifications && typeof OneSignal.Notifications.requestPermission === 'function') {
                  OneSignal.Notifications.requestPermission();
                } else if (typeof (OneSignal as any).registerForPushNotifications === 'function') {
                  (OneSignal as any).registerForPushNotifications();
                }
              }
            } else if (OneSignal && OneSignal.Notifications) {
              // Fallback for browsers that don't support the native Notification API well
              const permission: any = OneSignal.Notifications.permission;
              if (permission !== true && permission !== "granted" && permission !== "denied") {
                setIsOpen(true);
              }
            }
          } catch (err) {
            console.error("Error checking notification support:", err);
          }
        }
      }
    }, 5000); // 5 seconds after mount

    return () => clearTimeout(timer);
  }, []);

  const handleEnable = async () => {
    setIsOpen(false);
    localStorage.setItem("safardine_notif_prompted", "true");
    try {
      if ("Notification" in window) {
        const permission = await window.Notification.requestPermission();
        if (permission === "granted") {
          // Sync with OneSignal after granting native permission
          if (OneSignal.Notifications && typeof OneSignal.Notifications.requestPermission === 'function') {
            await OneSignal.Notifications.requestPermission();
          } else if (typeof (OneSignal as any).registerForPushNotifications === 'function') {
            await (OneSignal as any).registerForPushNotifications();
          }
        }
      } else {
        // Fallback if native Notification API is somehow missing
        if (OneSignal.Notifications && typeof OneSignal.Notifications.requestPermission === 'function') {
          await OneSignal.Notifications.requestPermission();
        } else if (typeof (OneSignal as any).registerForPushNotifications === 'function') {
          await (OneSignal as any).registerForPushNotifications();
        }
      }
    } catch (error) {
      console.error("Error prompting push:", error);
    }
  };

  const handleDismiss = () => {
    setIsOpen(false);
    localStorage.setItem("safardine_notif_prompted", "true"); // Prevent nagging
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-[9999] w-full max-w-sm bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-[#EEEEEE] overflow-hidden"
        >
          <div className="relative p-6">
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 shrink-0 bg-[#E8F8EE] rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 text-[#22C55E]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111827]">
                  Never miss an order
                </h3>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed font-medium">
                  Enable notifications to receive real-time updates for new orders, table scans, and important system alerts.
                </p>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={handleDismiss}
                className="flex-1 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-sm rounded-xl transition-colors"
              >
                Not Now
              </button>
              <button
                onClick={handleEnable}
                className="flex-1 px-4 py-2 bg-[#22C55E] hover:bg-[#1DA950] text-white font-bold text-sm rounded-xl transition-colors shadow-sm shadow-[#22C55E]/20"
              >
                Enable Alerts
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
