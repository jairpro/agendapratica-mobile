import { isAndroid } from "tns-core-modules/platform"
import * as utils from "tns-core-modules/utils/utils"

export function hideKeyboard() {
  // https://stackoverflow.com/a/60269199/12769114
  if (isAndroid) {
    utils.ad.dismissSoftInput()
  }
  /*if (isIOS) {
    frame.topmost().nativeView.endEditing(true)
  }*/
}

export function showKeyboard() {
  /* (isAndroid) {
    utils.ad.showSoftInput()
  }*/
}
