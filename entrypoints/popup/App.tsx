import { useState, useEffect } from "react";
import "./App.css";
import { useColorPicker } from "./hooks/useColorPicker";
import { useFavorites } from "./hooks/useFavorites";
import {
  hexToRgb,
  hexToHsl,
  rgbToHex,
  hslToHex,
  parseRgb,
  parseHsl,
  getTextColor,
} from "./utils/colorUtils";
import type { ColorFormat, TabType } from "./utils/constants";

const getColorString = (
  format: ColorFormat,
  color: string
): string => {
  const { r, g, b } = hexToRgb(color);

  switch (format) {
    case "hex":
      return color;
    case "rgb":
      return `rgb(${r}, ${g}, ${b})`;
    case "rgba":
      return `rgba(${r}, ${g}, ${b}, 1)`;
    case "hsl":
      const { h, s, l } = hexToHsl(color);
      return `hsl(${h}, ${s}%, ${l}%)`;
    default:
      return color;
  }
};

function App() {
  const {
    color,
    setColor,
    isActive,
    copiedFormat,
    startPicker,
    stopPicker,
    copyColor: copyColorHandler,
  } = useColorPicker();

  const {
    favorites,
    isFavorite,
    toggleFavorite,
    removeFavorite,
  } = useFavorites();

  const [activeTab, setActiveTab] = useState<TabType>("picker");
  const [hexInput, setHexInput] = useState("");
  const [rgbInput, setRgbInput] = useState("");
  const [hslInput, setHslInput] = useState("");
  const [rgbaInput, setRgbaInput] = useState("");

  useEffect(() => {
    setHexInput(color);
    setRgbInput(getColorString("rgb", color));
    setHslInput(getColorString("hsl", color));
    setRgbaInput(getColorString("rgba", color));
  }, [color]);

  const copyColor = (format: ColorFormat) => {
    const text = getColorString(format, color);
    copyColorHandler(format, text);
  };

  const handleToggleFavorite = async () => {
    await toggleFavorite(color);
  };

  const selectColor = (selectedColor: string) => {
    setColor(selectedColor);
    setActiveTab("picker");
  };

  const handleHexInput = (value: string) => {
    setHexInput(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      setColor(value.toUpperCase());
    }
  };

  const handleRgbInput = (value: string) => {
    setRgbInput(value);
    const rgb = parseRgb(value);
    if (rgb) {
      setColor(rgbToHex(rgb.r, rgb.g, rgb.b));
    }
  };

  const handleHslInput = (value: string) => {
    setHslInput(value);
    const hsl = parseHsl(value);
    if (hsl) {
      setColor(hslToHex(hsl.h, hsl.s, hsl.l));
    }
  };

  const handleRgbaInput = (value: string) => {
    setRgbaInput(value);
    const rgb = parseRgb(value);
    if (rgb) {
      setColor(rgbToHex(rgb.r, rgb.g, rgb.b));
    }
  };

  const textColor = getTextColor(color);

  return (
    <div className="color-picker-app">
      {/* 标签页 */}
      <div className="tabs">
        <div
          className={`tab ${activeTab === "picker" ? "active" : ""}`}
          onClick={() => setActiveTab("picker")}
        >
          拾色器
        </div>
        <div
          className={`tab ${activeTab === "favorites" ? "active" : ""}`}
          onClick={() => setActiveTab("favorites")}
        >
          收藏 ({favorites.length})
        </div>
      </div>

      {/* 拾色器标签页 */}
      {activeTab === "picker" && (
        <div className="picker-tab">
          {/* 颜色预览 */}
          <div className="color-preview-section">
            <div
              className="color-preview-large"
              style={{ backgroundColor: color, color: textColor }}
            >
              <div className="preview-color-code">{color}</div>
            </div>
            <div className="color-actions">
              <button
                onClick={startPicker}
                className="pick-btn"
                disabled={isActive}
              >
                {isActive ? "拾色中..." : "🎨 拾取颜色"}
              </button>
              <button
                onClick={handleToggleFavorite}
                className="favorite-btn"
                title={isFavorite(color) ? "取消收藏" : "添加到收藏"}
              >
                {isFavorite(color) ? "★" : "☆"}
              </button>
            </div>
          </div>

          {/* 颜色格式 */}
          <div className="color-formats">
            <div className="format-item">
              <div className="format-label">HEX</div>
              <div className="format-value-row">
                <input
                  type="text"
                  value={hexInput}
                  onChange={(e) => handleHexInput(e.target.value)}
                  className="format-input"
                  placeholder="#000000"
                />
                <button
                  onClick={() => copyColor("hex")}
                  className="copy-btn-mini"
                  title="复制"
                >
                  {copiedFormat === "hex" ? "✓" : "📋"}
                </button>
              </div>
            </div>

            <div className="format-item">
              <div className="format-label">RGB</div>
              <div className="format-value-row">
                <input
                  type="text"
                  value={rgbInput}
                  onChange={(e) => handleRgbInput(e.target.value)}
                  className="format-input"
                  placeholder="rgb(0, 0, 0)"
                />
                <button
                  onClick={() => copyColor("rgb")}
                  className="copy-btn-mini"
                  title="复制"
                >
                  {copiedFormat === "rgb" ? "✓" : "📋"}
                </button>
              </div>
            </div>

            <div className="format-item">
              <div className="format-label">HSL</div>
              <div className="format-value-row">
                <input
                  type="text"
                  value={hslInput}
                  onChange={(e) => handleHslInput(e.target.value)}
                  className="format-input"
                  placeholder="hsl(0, 0%, 0%)"
                />
                <button
                  onClick={() => copyColor("hsl")}
                  className="copy-btn-mini"
                  title="复制"
                >
                  {copiedFormat === "hsl" ? "✓" : "📋"}
                </button>
              </div>
            </div>

            <div className="format-item">
              <div className="format-label">RGBA</div>
              <div className="format-value-row">
                <input
                  type="text"
                  value={rgbaInput}
                  onChange={(e) => handleRgbaInput(e.target.value)}
                  className="format-input"
                  placeholder="rgba(0, 0, 0, 1)"
                />
                <button
                  onClick={() => copyColor("rgba")}
                  className="copy-btn-mini"
                  title="复制"
                >
                  {copiedFormat === "rgba" ? "✓" : "📋"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 收藏标签页 */}
      {activeTab === "favorites" && (
        <div className="favorites-tab">
          {favorites.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">⭐</div>
              <div className="empty-text">暂无收藏颜色</div>
            </div>
          ) : (
            <div className="color-grid">
              {favorites.map((favColor) => (
                <div
                  key={favColor}
                  className="color-grid-item"
                  title={favColor}
                >
                  <div
                    className="color-swatch"
                    style={{ backgroundColor: favColor }}
                    onClick={() => selectColor(favColor)}
                  />
                  <div
                    className="color-code"
                    onClick={() => selectColor(favColor)}
                  >
                    {favColor}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFavorite(favColor);
                    }}
                    className="remove-btn"
                    title="移除"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
