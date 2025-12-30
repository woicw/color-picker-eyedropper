import { useState, useEffect, useCallback } from "react";
import { MESSAGE_TYPES } from "../utils/constants";

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);

  const loadFavorites = useCallback(async () => {
    try {
      const response = await browser.runtime.sendMessage({
        type: MESSAGE_TYPES.GET_FAVORITES,
      });
      if (response?.favorites) {
        setFavorites(response.favorites);
      }
    } catch (error) {
      // Background script 可能未运行，使用空数组
      setFavorites([]);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const toggleFavorite = useCallback(async (color: string) => {
    try {
      const isFavorite = favorites.includes(color);
      await browser.runtime.sendMessage({
        type: isFavorite ? MESSAGE_TYPES.REMOVE_FAVORITE : MESSAGE_TYPES.ADD_FAVORITE,
        color,
      });
      await loadFavorites();
    } catch (error) {
      // 静默处理错误
    }
  }, [favorites, loadFavorites]);

  const removeFavorite = useCallback(async (colorToRemove: string) => {
    try {
      await browser.runtime.sendMessage({
        type: MESSAGE_TYPES.REMOVE_FAVORITE,
        color: colorToRemove,
      });
      await loadFavorites();
    } catch (error) {
      // 静默处理错误
    }
  }, [loadFavorites]);

  return {
    favorites,
    isFavorite: (color: string) => favorites.includes(color),
    toggleFavorite,
    removeFavorite,
    reload: loadFavorites,
  };
};

