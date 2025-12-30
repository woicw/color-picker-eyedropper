export type ColorFormat = "hex" | "rgb" | "hsl" | "rgba";
export type TabType = "picker" | "favorites";

export const STORAGE_KEYS = {
  FAVORITES: "colorFavorites",
} as const;

export const MESSAGE_TYPES = {
  COLOR_PICKED: "colorPicked",
  COLOR_UPDATED: "colorUpdated",
  PICKER_CANCELLED: "pickerCancelled",
  GET_COLOR: "getColor",
  GET_FAVORITES: "getFavorites",
  ADD_FAVORITE: "addFavorite",
  REMOVE_FAVORITE: "removeFavorite",
  START_PICKER: "startPicker",
  STOP_PICKER: "stopPicker",
} as const;

