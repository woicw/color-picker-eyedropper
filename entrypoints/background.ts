export default defineBackground(() => {
  let currentColor = "#000000";
  const STORAGE_KEYS = {
    FAVORITES: "colorFavorites",
  };

  const MESSAGE_TYPES = {
    COLOR_PICKED: "colorPicked",
    COLOR_UPDATED: "colorUpdated",
    PICKER_CANCELLED: "pickerCancelled",
    GET_COLOR: "getColor",
    GET_FAVORITES: "getFavorites",
    ADD_FAVORITE: "addFavorite",
    REMOVE_FAVORITE: "removeFavorite",
    START_PICKER: "startPicker",
  } as const;

  // 监听键盘快捷键
  browser.commands.onCommand.addListener((command) => {
    if (command === 'start-picker') {
      browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        if (tabs[0]?.id) {
          browser.tabs.sendMessage(tabs[0].id, { type: MESSAGE_TYPES.START_PICKER }).catch(() => {
            // Content script 可能未注入，静默处理
          });
        }
      });
    }
  });

  // 从存储中加载收藏
  const loadFavorites = async (): Promise<string[]> => {
    const result = await browser.storage.local.get(STORAGE_KEYS.FAVORITES);
    return (result[STORAGE_KEYS.FAVORITES] as string[]) || [];
  };

  // 保存收藏
  const saveFavorites = async (favorites: string[]) => {
    await browser.storage.local.set({ [STORAGE_KEYS.FAVORITES]: favorites });
  };

  // 监听来自 content script 的消息
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === MESSAGE_TYPES.COLOR_PICKED) {
      currentColor = message.color;
      
      browser.runtime.sendMessage({
        type: MESSAGE_TYPES.COLOR_UPDATED,
        color: message.color,
      }).catch(() => {
        // 如果没有 popup 打开，静默处理错误
      });
      return false;
    } else if (message.type === MESSAGE_TYPES.PICKER_CANCELLED) {
      // 通知 popup 拾色器已取消
      browser.runtime.sendMessage({
        type: MESSAGE_TYPES.PICKER_CANCELLED,
      }).catch(() => {
        // 如果没有 popup 打开，静默处理错误
      });
      return false;
    } else if (message.type === MESSAGE_TYPES.GET_COLOR) {
      sendResponse({ color: currentColor });
      return false;
    } else if (message.type === MESSAGE_TYPES.GET_FAVORITES) {
      loadFavorites().then((favorites) => {
        sendResponse({ favorites });
      });
      return true;
    } else if (message.type === MESSAGE_TYPES.ADD_FAVORITE) {
      (async () => {
        const favorites = await loadFavorites();
        if (!favorites.includes(message.color)) {
          favorites.push(message.color);
          await saveFavorites(favorites);
        }
        sendResponse({ success: true });
      })();
      return true;
    } else if (message.type === MESSAGE_TYPES.REMOVE_FAVORITE) {
      (async () => {
        let favorites = await loadFavorites();
        favorites = favorites.filter((c) => c !== message.color);
        await saveFavorites(favorites);
        sendResponse({ success: true });
      })();
      return true;
    }
    return false;
  });
});
