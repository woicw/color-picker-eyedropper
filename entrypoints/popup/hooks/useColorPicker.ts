import { useState, useEffect, useCallback } from "react";
import type { ColorFormat } from "../utils/constants";
import { MESSAGE_TYPES } from "../utils/constants";

export const useColorPicker = () => {
  const [color, setColor] = useState("#FF0000");
  const [isActive, setIsActive] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState<ColorFormat | null>(null);

  useEffect(() => {
    const loadColor = async () => {
      try {
        const response = await browser.runtime.sendMessage({
          type: MESSAGE_TYPES.GET_COLOR,
        });
        if (response?.color) {
          setColor(response.color);
        }
      } catch (error) {
        // Background script 可能未运行，使用默认颜色
      }
    };

    loadColor();

    const listener = (message: any) => {
      if (message.type === MESSAGE_TYPES.COLOR_UPDATED) {
        setColor(message.color);
        setIsActive(false);
        navigator.clipboard.writeText(message.color).catch(() => {});
      } else if (message.type === MESSAGE_TYPES.PICKER_CANCELLED) {
        // 拾色器已取消，重置状态
        setIsActive(false);
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
        }).catch((error) => {
          // Content script 可能未注入，重置状态
          setIsActive(false);
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
        }).catch(() => {
          // Content script 可能未注入，静默处理
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
