import React, { useState, useRef, useEffect, useCallback } from 'react';

function App() {
  // T-Shirt attributes selection state
  const [selectedCut, setSelectedCut] = useState('crew-neck');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [designPosition, setDesignPosition] = useState({ x: 0, y: 0 });

  // Modal dialog state
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState('');

  // Dragging and canvas references
  const tShirtRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const predefinedTShirtDesigns = [
    {
      id: 'design1',
      src: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.84-1.84C6.5 16.29 2 12.25 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.75-4.5 7.79-8.16 10.96L12 21.35z"/></svg>',
      alt: 'Heart Design',
    },
    {
      id: 'design2',
      src: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63L2 9.24l5.46 4.73L5.82 21z"/></svg>',
      alt: 'Star Design',
    },
    {
      id: 'design3',
      src: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2h-4v2h4V4zm6 16H4V8h16v12zM9 13H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/></svg>',
      alt: 'Rocket Design',
    },
    {
      id: 'design4',
      src: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8.01 10 17z"/></svg>',
      alt: 'Checkmark Design',
    },
    {
      id: 'design5',
      src: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L0 12l12 12 12-12L12 0zm0 17.9L5.1 12 12 5.1l6.9 6.9L12 17.9z"/></svg>',
      alt: 'Diamond Design',
    },
  ];

  const [customColors, setCustomColors] = useState([]);
  const [customSizes, setCustomSizes] = useState([]);
  const [customDesigns, setCustomDesigns] = useState([]);

  const [newColorInput, setNewColorInput] = useState('');
  const [newSizeInput, setNewSizeInput] = useState('');
  const [newDesignSvgInput, setNewDesignSvgInput] = useState('');
  const [newDesignAltInput, setNewDesignAltInput] = useState('');

  const availableColors = ['#ffffff', '#000000', '#ef4444', '#3b82f6', '#22c55e', '#facc15', '#a855f7', ...customColors];
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', ...customSizes];
  const availableDesigns = [...predefinedTShirtDesigns, ...customDesigns];

  const handleMouseDown = useCallback((e) => {
    if (!selectedDesign) return;
    setIsDragging(true);
    const designRect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - designRect.left,
      y: e.clientY - designRect.top,
    });
    e.preventDefault();
  }, [selectedDesign]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !tShirtRef.current) return;

    const tShirtRect = tShirtRef.current.getBoundingClientRect();
    const designWidth = 96;
    const designHeight = 96;

    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    let newX = clientX - tShirtRect.left - dragOffset.x;
    let newY = clientY - tShirtRect.top - dragOffset.y;

    newX = Math.max(0, Math.min(newX, tShirtRect.width - designWidth));
    newY = Math.max(0, Math.min(newY, tShirtRect.height - designHeight));

    setDesignPosition({
      x: newX - (tShirtRect.width / 2 - designWidth / 2),
      y: newY - (tShirtRect.height / 2 - designHeight / 2),
    });
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove);
      document.addEventListener('touchend', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleAddColor = () => {
    if (newColorInput && !availableColors.includes(newColorInput)) {
      setCustomColors((prevColors) => [...prevColors, newColorInput]);
      setNewColorInput('');
    }
  };

  const handleAddSize = () => {
    const trimmedSize = newSizeInput.trim().toUpperCase();
    if (trimmedSize && !availableSizes.includes(trimmedSize)) {
      setCustomSizes((prevSizes) => [...prevSizes, trimmedSize]);
      setNewSizeInput('');
    }
  };

  const handleAddDesign = () => {
    if (newDesignSvgInput && newDesignAltInput) {
      const newId = `customDesign${customDesigns.length + 1}`;
      setCustomDesigns((prevDesigns) => [
        ...prevDesigns,
        { id: newId, src: newDesignSvgInput, alt: newDesignAltInput },
      ]);
      setNewDesignSvgInput('');
      setNewDesignAltInput('');
    } else {
      setModalContent('Please provide both SVG code and an alt text for the new design.');
      setShowModal(true);
    }
  };

  const handleOrder = () => {
    const orderSummary = {
      cut: selectedCut,
      color: selectedColor,
      size: selectedSize,
      design: selectedDesign ? selectedDesign.alt : 'No design selected',
      designPosition: selectedDesign ? `X: ${designPosition.x.toFixed(2)}px, Y: ${designPosition.y.toFixed(2)}px` : 'N/A',
    };
    setModalContent(JSON.stringify(orderSummary, null, 2));
    setShowModal(true);
  };

  return (
    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center p-4 min-h-screen bg-gray-100 font-sans">
      {/* Controls Section */}
      <div className="w-full lg:w-1/3 p-6 bg-white rounded-xl shadow-lg mb-6 lg:mb-0 lg:mr-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Customize Your T-Shirt</h2>

        {/* Cut Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">1. Choose Cut</h3>
          <div className="flex flex-wrap gap-3">
            {['crew-neck', 'v-neck'].map((cut) => (
              <button
                key={cut}
                onClick={() => setSelectedCut(cut)}
                className={`px-4 py-2 rounded-lg border-2 font-medium capitalize transition-all duration-200 ${
                  selectedCut === cut
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-400'
                }`}
              >
                {cut.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Color Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">2. Choose Color</h3>
          <div className="flex flex-wrap gap-3 mb-4">
            {availableColors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-10 h-10 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                  selectedColor === color ? 'ring-4 ring-blue-500 ring-offset-2' : 'hover:ring-2 hover:ring-blue-300'
                }`}
                style={{ backgroundColor: color, borderColor: color === '#ffffff' ? '#d1d5db' : color }}
                title={color}
              >
                {selectedColor === color && (
                  <svg className="w-6 h-6 text-white drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={newColorInput}
              onChange={(e) => setNewColorInput(e.target.value)}
              className="w-10 h-10 rounded-md border border-gray-300 cursor-pointer shadow-sm"
              title="Pick custom color"
            />
            <input
              type="text"
              placeholder="#FF0000"
              value={newColorInput}
              onChange={(e) => setNewColorInput(e.target.value)}
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddColor}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              Add Color
            </button>
          </div>
        </div>

        {/* Size Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">3. Choose Size</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {availableSizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 rounded-lg border-2 font-semibold text-sm transition-all duration-200 ${
                  selectedSize === size
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-400'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g. 3XL"
              value={newSizeInput}
              onChange={(e) => setNewSizeInput(e.target.value)}
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddSize}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              Add Size
            </button>
          </div>
        </div>

        {/* Design Library */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">4. Select Design</h3>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {availableDesigns.map((design) => (
              <button
                key={design.id}
                onClick={() => setSelectedDesign(design)}
                className={`p-3 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  selectedDesign?.id === design.id
                    ? 'border-blue-600 ring-2 ring-blue-500 shadow-md bg-blue-50'
                    : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
                }`}
                title={design.alt}
              >
                <div
                  dangerouslySetInnerHTML={{ __html: design.src }}
                  className="w-10 h-10 text-gray-800"
                />
              </button>
            ))}
            <button
              onClick={() => setSelectedDesign(null)}
              className={`p-3 border-2 rounded-lg flex items-center justify-center transition-all text-xs font-semibold ${
                selectedDesign === null
                  ? 'border-blue-600 ring-2 ring-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-blue-400 bg-gray-50 text-gray-600'
              }`}
            >
              None
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <textarea
              placeholder="Paste custom SVG (<svg>...</svg>)"
              value={newDesignSvgInput}
              onChange={(e) => setNewDesignSvgInput(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
            <input
              type="text"
              placeholder="Design Title (e.g. Logo)"
              value={newDesignAltInput}
              onChange={(e) => setNewDesignAltInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddDesign}
              className="w-full py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              Add Custom Design
            </button>
          </div>
        </div>
      </div>

      {/* T-Shirt Mockup Display Section */}
      <div className="w-full lg:w-2/3 p-6 bg-white rounded-xl shadow-lg flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Your Custom T-Shirt</h2>
        
        <div
          ref={tShirtRef}
          className="relative w-full max-w-md aspect-square rounded-xl flex items-center justify-center overflow-hidden border-2 border-gray-200 transition-colors duration-300 shadow-inner"
          style={{ backgroundColor: selectedColor }}
        >
          {/* T-Shirt Overlay Mockup Image */}
          <img
            src="/CNSM_W.png"
            alt="T-Shirt Mockup"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            onError={(e) => {
              // Graceful fallback for local preview environments
              e.target.onerror = null;
              e.target.src = "https://content-fetcher.web.app/?id=uploaded:CNSM_W.jpg-a338ce16-ee57-4c97-bb50-46fa842647ee";
            }}
          />

          {/* Render Selected Artwork Design */}
          {selectedDesign && (
            <div
              className={`absolute w-24 h-24 flex items-center justify-center transition-transform duration-75 ${
                isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab hover:scale-105'
              }`}
              style={{
                left: `calc(50% + ${designPosition.x}px)`,
                top: `calc(50% + ${designPosition.y}px)`,
                transform: 'translate(-50%, -50%)',
              }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleMouseDown}
            >
              {selectedDesign.src.startsWith('<svg') ? (
                <div dangerouslySetInnerHTML={{ __html: selectedDesign.src }} className="w-full h-full text-gray-900 drop-shadow-md" />
              ) : (
                <img src={selectedDesign.src} alt={selectedDesign.alt} className="w-full h-full object-contain drop-shadow-md" />
              )}
            </div>
          )}
        </div>

        <button
          onClick={handleOrder}
          className="mt-8 px-10 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all text-lg uppercase tracking-wider"
        >
          Order Your Custom T-Shirt
        </button>
      </div>

      {/* Order Summary Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h3>
            <pre className="bg-gray-100 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap break-words border border-gray-200">
              {modalContent}
            </pre>
            <button
              onClick={() => setShowModal(false)}
              className="mt-6 w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
