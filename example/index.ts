import { AppRegistry, Platform } from "react-native";
import { requireNativeModule } from "expo-modules-core";
import App from "./App";

if (Platform.OS === "android") {
  global.queueMicrotask = (fn: () => void) => setTimeout(fn, 0);
  global.setImmediate = (fn: (...args: any[]) => void, ...args: any[]) =>
    setTimeout(() => fn(...args), 0);
  global.clearImmediate = (id: any) => clearTimeout(id);
}
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
