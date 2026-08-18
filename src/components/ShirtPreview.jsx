import { useCallback, useRef, useState } from 'react';
import DesignArt from './DesignArt.jsx';

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

/**
 * The shirt canvas: transparent mockup PNG + color tint + draggable design.
 *
 * Color tinting: a colored layer is masked to the shirt's silhouette using the
 * PNG's alpha channel, then the PNG itself is drawn on top with multiply
 * blending so its shading/texture shows through. Works best with mockup
 * photos of white or light-gray shirts on a transparent background.
 */
export default function ShirtPreview({ cut, color, design, position, onMove, designScale }) {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const area = cut?.printArea ?? { left: 25, top: 30, right: 75, bottom: 80 };

  const moveTo = useCallback(
    (clientX, clientY) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      onMove({
        x: clamp(((clientX - rect.left) / rect.width) * 100, area.left, area.right),
        y: clamp(((clientY - rect.top) / rect.height) * 100, area.top, area.bottom),
      });
    },
    [onMove, area.left, area.right, area.top, area.bottom]
  );

  const mask = cut?.image
    ? {
        WebkitMaskImage: `url("${cut.image}")`,
        maskImage: `url("${cut.image}")`,
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
      }
    : {};

  return (
    <div
      ref={canvasRef}
      className="relative aspect-square w-full max-w-md select-none overflow-hidden rounded-xl border-2 border-gray-200 bg-gradient-to-b from-gray-50 to-gray-200 shadow-inner"
    >
      {/* Color tint, clipped to the shirt silhouette */}
      <div className="absolute inset-0" style={{ backgroundColor: color, ...mask }} />
      {/* Mockup image: shading & texture via multiply blend */}
      {cut?.image && (
        <img
          src={cut.image}
          alt={`${cut.label} mockup`}
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full object-contain mix-blend-multiply"
        />
      )}

      {/* Print area guide */}
      {design && (
        <div
          className={`pointer-events-none absolute rounded border border-dashed transition-opacity ${
            isDragging ? 'border-blue-400 opacity-100' : 'border-gray-400 opacity-30'
          }`}
          style={{
            left: `${area.left - designScale / 2}%`,
            top: `${area.top - designScale / 2}%`,
            width: `${area.right - area.left + designScale}%`,
            height: `${area.bottom - area.top + designScale}%`,
          }}
        />
      )}

      {/* Draggable design */}
      {design && (
        <div
          role="img"
          aria-label={design.title}
          className={`absolute touch-none transition-transform duration-75 ${
            isDragging ? 'scale-105 cursor-grabbing' : 'cursor-grab hover:scale-105'
          }`}
          style={{
            width: `${designScale}%`,
            height: `${designScale}%`,
            left: `${position.x}%`,
            top: `${position.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            setIsDragging(true);
          }}
          onPointerMove={(e) => isDragging && moveTo(e.clientX, e.clientY)}
          onPointerUp={() => setIsDragging(false)}
          onPointerCancel={() => setIsDragging(false)}
        >
          <DesignArt
            design={design}
            className="pointer-events-none h-full w-full text-gray-900 drop-shadow-md"
          />
        </div>
      )}
    </div>
  );
}
