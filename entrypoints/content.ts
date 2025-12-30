export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    let isPickerActive = false;

    const MESSAGE_TYPES = {
      COLOR_PICKED: "colorPicked",
      START_PICKER: "startPicker",
      STOP_PICKER: "stopPicker",
    } as const;

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
          await browser.runtime.sendMessage({
            type: MESSAGE_TYPES.COLOR_PICKED,
            color: result.sRGBHex,
          });
        }
      } catch (err) {
        // 用户取消或出错，静默处理
        if (err && (err as Error).name !== "AbortError") {
          // 可以在这里添加错误处理逻辑
        }
      } finally {
        isPickerActive = false;
      }
    };

    const stopPicker = () => {
      isPickerActive = false;
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
