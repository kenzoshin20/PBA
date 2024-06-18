import { UserSettings } from "../model/user"

const USER_SETTINGS_STORAGE_KEY = 'userSettings'
const defaultUserSettings: UserSettings = {
  soundEffects: false,
  music: false
}
let userSettings: UserSettings = (function() {
  const savedSettingsJson = localStorage.getItem(USER_SETTINGS_STORAGE_KEY)
  if (savedSettingsJson) {
    const savedSettings = JSON.parse(savedSettingsJson)
    return savedSettings
  } else {
    return defaultUserSettings
  }
})()

export function saveUserSettings(newUserSettings: UserSettings) {
  userSettings = newUserSettings
  localStorage.setItem(USER_SETTINGS_STORAGE_KEY, JSON.stringify(userSettings))
} 

export function getUserSettings(): UserSettings {
  return userSettings
}
