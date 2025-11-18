# expo-unified-push

Expo integration of the android UnifiedPush library.

> [!WARNING]  
> This library is only supported on Android at the moment. For iOS suport, we recommend using the [RN Push Notifications](https://github.com/react-native-push-notification/ios) library or the [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) library.

## API documentation

Main documentation is available at [ExpoUnifiedPushModule](https://juandjara.github.io/expo-unified-push/classes/ExpoUnifiedPushModule.html) typedoc pages.

## Installation in managed Expo projects

For [managed](https://docs.expo.dev/archive/managed-vs-bare/) Expo projects, please follow the installation instructions in the [API documentation](#api-documentation).

## Installation in bare React Native projects

For bare React Native projects, you must ensure that you have [installed and configured the `expo` package](https://docs.expo.dev/bare/installing-expo-modules/) before continuing.

### Add the package to your npm dependencies

```
npm install expo-unified-push
```

## Example integration into your app

To see an example implementation of the library, you can check the [App.tsx](./example/App.tsx) file in the [example](./example) folder.

### Handling pushes while the app is killed

The module exposes a native headless task so your JavaScript can still run when UnifiedPush wakes the process in the background. Register a handler as early as possible (for example in `index.js`):

```ts
import { AppRegistry } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';

const ExpoUnifiedPush = requireNativeModule('ExpoUnifiedPush');

AppRegistry.registerHeadlessTask(
  ExpoUnifiedPush.headlessTaskName,
  () => async ({ action, data }) => {
    if (action === 'message') {
      // Do whatever work is needed without a UI.
    }
  }
);
```

When the JS bridge is not available the module falls back to the headless task, so make sure to keep the handler lightweight and to finish within the 30 second timeout.

### Testing with a simple Node backend

An example backend lives in `server/`. Generate VAPID keys and send a test message:

```
cd server
npm install           # first time only
npm run generate-keys # writes vapid-keys.json
```

Copy the `publicKey` into `example/.env.local` as `EXPO_PUBLIC_SERVER_VAPID_KEY`. Then, set the device endpoint (logged when you receive the `registered` event) and private key in `server/.env`:

```
UP_ENDPOINT=https://push.example/...
UP_P256DH=<data.pubKey value from the "registered" event>
UP_AUTH=<data.auth value from the "registered" event>
UP_PUBLIC_KEY=<publicKey from vapid-keys.json>
UP_PRIVATE_KEY=<privateKey from vapid-keys.json>
```

To test a silent/headless notification set `UP_SILENT=true` (and optionally tweak `UP_TYPE`) before sending. Finally send a push:

```
npm run send
```

Use this flow to exercise background/headless delivery without deploying a real backend.

## Sending notifications from your backend 

To send notifications from your backend, use the [`web-push`](https://www.npmjs.com/package/web-push) npm library or something similar. It will handle all encoding of parameters for you. Remember to set up VAPID keys for improved security (more info on the `web-push` readme)

## Contributing

Contributions are very welcome! Just make sure to keep the code style consistent with the rest of the codebase and ask before adding any new dependencies.
