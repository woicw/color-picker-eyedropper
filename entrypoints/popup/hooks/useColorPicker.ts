import { useState, useEffect, useCallback } from "react";
import type { ColorFormat } from "../utils/constants";
import { MESSAGE_TYPES } from "../utils/constants";

export const useColorPicker = () => {
  const [color, setColor] = useState("#FF0000");
  const [isActive, setIsActive] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState<ColorFormat | null>(null);

  useEffect(() => {
    const loadColor = async () => {
      const response = await browser.runtime.sendMessage({
        type: MESSAGE_TYPES.GET_COLOR,
      });
      if (response?.color) {
        setColor(response.color);
      }
    };

    loadColor();

    const listener = (message: any) => {
      if (message.type === MESSAGE_TYPES.COLOR_UPDATED) {
        setColor(message.color);
        setIsActive(false);
        navigator.clipboard.writeText(message.color).catch(() => {});
      }
    };

    browser.runtime.onMessage.addListener(listener);
    return () => {
      browser.runtime.onMessage.removeListener(listener);
    };
  }, []);

  const startPicker = useCallback(() => {
    setIsActive(true);
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs[0]?.id) {
        browser.tabs.sendMessage(tabs[0].id, {
          type: MESSAGE_TYPES.START_PICKER,
        });
      }
    });
  }, []);

  const stopPicker = useCallback(() => {
    setIsActive(false);
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs[0]?.id) {
        browser.tabs.sendMessage(tabs[0].id, {
          type: MESSAGE_TYPES.STOP_PICKER,
        });
      }
    });
  }, []);

  const copyColor = useCallback((format: ColorFormat, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedFormat(format);
      setTimeout(() => {
        setCopiedFormat(null);
      }, 1500);
    });
  }, []);

  return {
    color,
    setColor,
    isActive,
    copiedFormat,
    startPicker,
    stopPicker,
    copyColor,
  };
};
