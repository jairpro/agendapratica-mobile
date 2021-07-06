import { List } from "./lists"

const appSettings = require("tns-core-modules/application-settings")

export function StorageGetList(key: string): List {
  let str = appSettings.getString(key)
  let list = typeof str === 'string' ? JSON.parse(str) : []
  list = list instanceof Array ? list : []
  return list
}

export function StorageSetList(key: string, list: List) {
  appSettings.setString(key, JSON.stringify(list))
}

export function StorageGetBoolean(key: string, defaultValue: boolean): boolean {
  return appSettings.getBoolean(key, defaultValue)
}

export function StorageSetBoolean(key: string, value: boolean) {
  appSettings.setBoolean(key, value)
}
