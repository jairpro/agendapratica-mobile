import {
  android,
  AndroidApplication,
  AndroidActivityBackPressedEventData
} from "tns-core-modules/application"

import { goBack } from "~/utils/goBack"

export function backEvent() {
  if (android) {
    android.on(
      AndroidApplication.activityBackPressedEvent,
      (data: AndroidActivityBackPressedEventData) => {
        if (goBack()) data.cancel = true // prevents default back button behavior
      }
    )
  }
}
