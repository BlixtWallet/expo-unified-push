import { AppRegistry, Platform } from "react-native";
import { requireNativeModule } from "expo-modules-core";
import App from "./App";

const shimMicrotasks = () => {
  if (Platform.OS !== "android") {
    return;
  }

  const schedule = (fn: (...args: any[]) => void, ...args: any[]) =>
    setTimeout(() => fn(...args), 0);

  (globalThis as typeof global).queueMicrotask = schedule;
  (globalThis as typeof global).setImmediate = (
    fn: (...args: any[]) => void,
    ...args: any[]
  ) => {
    const handle = schedule(fn, ...args);
    return handle;
  };
  (globalThis as typeof global).clearImmediate = (handle: any) => {
    clearTimeout(handle);
  };
};

shimMicrotasks();
const ExpoUnifiedPush = requireNativeModule("ExpoUnifiedPush");

AppRegistry.registerComponent("main", () => App);

AppRegistry.registerHeadlessTask(
  ExpoUnifiedPush.headlessTaskName,
  () =>
    async ({ action, data }: { action: string; data: Record<string, any> }) => {
      if (action === "message") {
        if (data?.decrypted && data?.message) {
          try {
            const payload = JSON.parse(data.message);
            console.log("[Headless] Silent push", payload);
          } catch (e) {
            console.log("[Headless] Raw push", data.message);
          }
        }
        // TODO: trigger background work here
      }
    },
);
