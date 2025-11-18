import { AppRegistry } from "react-native";
import App from "./App";
import { requireNativeModule } from "expo-modules-core";

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
