export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    let isPickerActive = false;

    const MESSAGE_TYPES = {
      COLOR_PICKED: "colorPicked",
      PICKER_CANCELLED: "pickerCancelled",
      START_PICKER: "startPicker",
      STOP_PICKER: "stopPicker",
    } as const;

    const notifyCancelled = () => {
      try {
        browser.runtime.sendMessage({
          type: MESSAGE_TYPES.PICKER_CANCELLED,
        });
      } catch (error) {
        // Background script 可能未运行，静默处理
      }
    };

    const startPicker = async () => {
      if (isPickerActive) return;

      if (!("EyeDropper" in window)) {
        alert("您的浏览器不支持原生拾色器，请使用 Chrome 95+ 或 Edge 95+");
        return;
      }

      isPickerActive = true;

      try {
        // @ts-ignore - EyeDropper 可能不在 TypeScript 定义中
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();

        if (result?.sRGBHex) {
          try {
            await browser.runtime.sendMessage({
              type: MESSAGE_TYPES.COLOR_PICKED,
              color: result.sRGBHex,
            });
          } catch (error) {
            // Background script 可能未运行，静默处理
          }
        }
      } catch (err) {
        // EyeDropper API 在用户按 ESC 时会抛出 AbortError
        // 其他错误也可能发生，统一处理为取消
        const error = err as Error;
        if (error.name === "AbortError" || error.name === "NotAllowedError") {
          // 用户取消（ESC 键或权限拒绝），通知 background
          notifyCancelled();
        }
      } finally {
        isPickerActive = false;
      }
    };

    const stopPicker = () => {
      if (isPickerActive) {
        isPickerActive = false;
        notifyCancelled();
      }
    };

    browser.runtime.onMessage.addListener((message) => {
      if (message.type === MESSAGE_TYPES.START_PICKER) {
        startPicker();
      } else if (message.type === MESSAGE_TYPES.STOP_PICKER) {
        stopPicker();
      }
    });
  },
});
