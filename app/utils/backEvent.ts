import * as application from "tns-core-modules/application"
import {
  AndroidApplication,
  AndroidActivityBackPressedEventData
} from "tns-core-modules/application"

import { goBack } from "~/utils/goBack"

export function backEvent() {
  if (application.android) {
    application.android.on(
      AndroidApplication.activityBackPressedEvent,
      (data: AndroidActivityBackPressedEventData) => {
        if (goBack()) data.cancel = true // prevents default back button behavior
      }
    )
  }
}
