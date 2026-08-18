import { useEffect, useState } from 'react';
import { useConfig } from './lib/useConfig.js';
import { isSvgMarkup, sanitizeSvg } from './lib/media.js';
import ShirtPreview from './components/ShirtPreview.jsx';
import DesignArt from './components/DesignArt.jsx';
import Modal from './components/Modal.jsx';

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

function SectionTitle({ children }) {
  return (
    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-700">{children}</h3>
  );
}

function PillButton({ active, onClick, children, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`rounded-lg border-2 px-4 py-2 text-sm font-semibold capitalize transition-all duration-200 ${
        active
          ? 'border-blue-600 bg-blue-600 text-white shadow-md'
          : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
      }`}
    >
      {children}
    </button>
  );
}

export default function App() {
  const { config, error } = useConfig();

  // Selections
  const [selectedCutId, setSelectedCutId] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [designPosition, setDesignPosition] = useState({ x: 50, y: 50 });

  // Session-only additions made by the visitor (permanent options live in config.json)
  const [customColors, setCustomColors] = useState([]);
  const [customSizes, setCustomSizes] = useState([]);
  const [customDesigns, setCustomDesigns] = useState([]);

  // Inputs
  const [newColorInput, setNewColorInput] = useState('#ff0000');
  const [newSizeInput, setNewSizeInput] = useState('');
  const [newDesignSourceInput, setNewDesignSourceInput] = useState('');
  const [newDesignTitleInput, setNewDesignTitleInput] = useState('');

  const [modal, setModal] = useState(null);

  // Initialize defaults once config arrives
  useEffect(() => {
    if (!config) return;
    setSelectedCutId((v) => v ?? config.cuts[0]?.id ?? null);
    setSelectedColor((v) => v ?? config.colors[0] ?? '#ffffff');
    setSelectedSize((v) => v ?? (config.sizes.includes('M') ? 'M' : config.sizes[0]));
  }, [config]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6 text-center text-gray-700">
        Failed to load shop configuration: {error}
      </div>
    );
  }
  if (!config) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 text-gray-500">
        Loading…
      </div>
    );
  }

  const cuts = config.cuts ?? [];
  const colors = [...(config.colors ?? []), ...customColors];
  const sizes = [...(config.sizes ?? []), ...customSizes];
  const designs = [...(config.designs ?? []), ...customDesigns];
  const designScale = config.designScale ?? 20;
  const selectedCut = cuts.find((c) => c.id === selectedCutId) ?? cuts[0];

  const showError = (body) => setModal({ title: 'Hold on', body });

  const selectDesign = (design) => {
    setSelectedDesign(design);
    if (design && selectedCut?.printArea) {
      const a = selectedCut.printArea;
      setDesignPosition({ x: (a.left + a.right) / 2, y: (a.top + a.bottom) / 2 });
    }
  };

  const handleAddColor = () => {
    const color = newColorInput.trim().toLowerCase();
    if (!HEX_RE.test(color)) return showError('Please enter a valid hex color, e.g. #ff6600.');
    if (colors.includes(color)) return showError('That color is already in the palette.');
    setCustomColors((prev) => [...prev, color]);
    setSelectedColor(color);
  };

  const handleAddSize = () => {
    const size = newSizeInput.trim().toUpperCase();
    if (!size) return;
    if (sizes.includes(size)) return showError('That size already exists.');
    setCustomSizes((prev) => [...prev, size]);
    setSelectedSize(size);
    setNewSizeInput('');
  };

  const handleAddDesign = () => {
    const source = newDesignSourceInput.trim();
    const title = newDesignTitleInput.trim();
    if (!source || !title) {
      return showError('Please provide a design (image URL or SVG code) and a title.');
    }
    let design;
    if (isSvgMarkup(source)) {
      const clean = sanitizeSvg(source);
      if (!clean) return showError('That SVG code is not valid.');
      design = { id: `custom-${Date.now()}`, title, svg: clean };
    } else if (/^(https?:\/\/|\/)/i.test(source)) {
      design = { id: `custom-${Date.now()}`, title, src: source };
    } else {
      return showError('Paste either an image URL (PNG, JPG or SVG) or SVG code starting with <svg.');
    }
    setCustomDesigns((prev) => [...prev, design]);
    selectDesign(design);
    setNewDesignSourceInput('');
    setNewDesignTitleInput('');
  };

  const handleOrder = () => {
    const lines = [
      `Cut:       ${selectedCut?.label ?? '-'}`,
      `Color:     ${selectedColor}`,
      `Size:      ${selectedSize}`,
      `Design:    ${selectedDesign ? selectedDesign.title : 'None'}`,
      selectedDesign
        ? `Placement: ${designPosition.x.toFixed(0)}% across, ${designPosition.y.toFixed(0)}% down`
        : null,
    ].filter(Boolean);
    setModal({ title: 'Order Summary', body: lines.join('\n') });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-100 p-4 font-sans lg:flex-row lg:items-start">
      {/* Controls */}
      <div className="w-full rounded-xl bg-white p-6 shadow-lg lg:w-1/3">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Customize Your T-Shirt
        </h2>

        {/* Cut */}
        <section className="mb-6">
          <SectionTitle>1. Choose Cut</SectionTitle>
          <div className="flex flex-wrap gap-3">
            {cuts.map((cut) => (
              <PillButton
                key={cut.id}
                active={selectedCutId === cut.id}
                onClick={() => setSelectedCutId(cut.id)}
              >
                {cut.label}
              </PillButton>
            ))}
          </div>
        </section>

        {/* Color */}
        <section className="mb-6">
          <SectionTitle>2. Choose Color</SectionTitle>
          <div className="mb-4 flex flex-wrap gap-3">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                aria-label={`Color ${color}`}
                title={color}
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                  selectedColor === color
                    ? 'ring-4 ring-blue-500 ring-offset-2'
                    : 'hover:ring-2 hover:ring-blue-300'
                }`}
                style={{ backgroundColor: color, borderColor: color === '#ffffff' ? '#d1d5db' : color }}
              >
                {selectedColor === color && (
                  <svg className="h-6 w-6 text-white mix-blend-difference" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={HEX_RE.test(newColorInput) ? newColorInput : '#ff0000'}
              onChange={(e) => setNewColorInput(e.target.value)}
              className="h-10 w-10 cursor-pointer rounded-md border border-gray-300 shadow-sm"
              title="Pick custom color"
            />
            <input
              type="text"
              placeholder="#FF0000"
              value={newColorInput}
              onChange={(e) => setNewColorInput(e.target.value)}
              className="min-w-0 flex-grow rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleAddColor}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
            >
              Add
            </button>
          </div>
        </section>

        {/* Size */}
        <section className="mb-6">
          <SectionTitle>3. Choose Size</SectionTitle>
          <div className="mb-4 flex flex-wrap gap-2">
            {sizes.map((size) => (
              <PillButton key={size} active={selectedSize === size} onClick={() => setSelectedSize(size)}>
                {size}
              </PillButton>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g. 3XL"
              maxLength={6}
              value={newSizeInput}
              onChange={(e) => setNewSizeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSize()}
              className="min-w-0 flex-grow rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleAddSize}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
            >
              Add
            </button>
          </div>
        </section>

        {/* Designs */}
        <section>
          <SectionTitle>4. Select Design</SectionTitle>
          <div className="mb-4 grid grid-cols-4 gap-3 sm:grid-cols-5 lg:grid-cols-4">
            {designs.map((design) => (
              <button
                key={design.id}
                type="button"
                onClick={() => selectDesign(design)}
                title={design.title}
                className={`flex items-center justify-center rounded-lg border-2 p-3 transition-all duration-200 ${
                  selectedDesign?.id === design.id
                    ? 'border-blue-600 bg-blue-50 shadow-md ring-2 ring-blue-500'
                    : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
                }`}
              >
                <DesignArt design={design} className="h-10 w-10 text-gray-800" />
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSelectedDesign(null)}
              className={`flex items-center justify-center rounded-lg border-2 p-3 text-xs font-semibold transition-all ${
                selectedDesign === null
                  ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-blue-400'
              }`}
            >
              None
            </button>
          </div>

          {config.allowCustomerUploads !== false && (
            <div className="flex flex-col gap-2">
              <textarea
                placeholder="Image URL (PNG / JPG / SVG) or SVG code (<svg>…</svg>)"
                value={newDesignSourceInput}
                onChange={(e) => setNewDesignSourceInput(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Design title (e.g. Logo)"
                value={newDesignTitleInput}
                onChange={(e) => setNewDesignTitleInput(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddDesign}
                className="w-full rounded-md bg-emerald-600 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
              >
                Add Custom Design
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Preview */}
      <div className="flex w-full flex-col items-center rounded-xl bg-white p-6 shadow-lg lg:w-2/3">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">Your Custom T-Shirt</h2>

        <ShirtPreview
          cut={selectedCut}
          color={selectedColor}
          design={selectedDesign}
          position={designPosition}
          onMove={setDesignPosition}
          designScale={designScale}
        />

        <p className="mt-3 text-sm text-gray-500">
          {selectedDesign
            ? 'Drag the design to position it on the shirt.'
            : 'Select a design to place it on the shirt.'}
        </p>

        <button
          type="button"
          onClick={handleOrder}
          className="mt-6 rounded-xl bg-blue-600 px-10 py-4 text-lg font-bold uppercase tracking-wider text-white shadow-xl transition-all hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-400"
        >
          Order Your Custom T-Shirt
        </button>
      </div>

      {modal && <Modal title={modal.title} body={modal.body} onClose={() => setModal(null)} />}
    </div>
  );
}
