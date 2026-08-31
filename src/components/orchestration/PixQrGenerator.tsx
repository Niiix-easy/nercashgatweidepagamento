import React, { useState, useRef, useEffect } from 'react';
import { QrCode, Download, Share2, Copy, Check } from 'lucide-react';
import { usePayment } from '../../context/PaymentContext';

export const PixQrGenerator: React.FC = () => {
  const { addToast } = usePayment();
  const [amount, setAmount] = useState('150.00');
  const [description, setDescription] = useState('POS Checkout');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // A simulated PIX copy-paste string
  const pixString = `00020101021126580014br.gov.bcb.pix0136${Math.random().toString(36).substring(2, 15)}520400005303986540${amount.length.toString().padStart(2, '0')}${amount}5802BR5913Nercash Store6009Sao Paulo62070503***6304${Math.floor(Math.random()*10000).toString().padStart(4, '0')}`;

  const drawQRCode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw a fake QR code for demonstration purposes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#0f172a';
    const size = 10;
    const padding = 20;
    const grid = (canvas.width - padding * 2) / size;

    for (let i = 0; i < grid; i++) {
      for (let j = 0; j < grid; j++) {
        if (Math.random() > 0.45) {
          ctx.fillRect(padding + i * size, padding + j * size, size, size);
        }
      }
    }

    // Position finders (corners)
    const drawFinder = (x: number, y: number) => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x, y, size * 7, size * 7);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + size, y + size, size * 5, size * 5);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + size * 2, y + size * 2, size * 3, size * 3);
    };

    drawFinder(padding, padding);
    drawFinder(canvas.width - padding - size * 7, padding);
    drawFinder(padding, canvas.height - padding - size * 7);
  };

  useEffect(() => {
    drawQRCode();
  }, [amount, description]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `pix-qrcode-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addToast('Pix QR Generator', 'High-resolution PNG exported successfully for offline POS.', 'success');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(pixString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast('Pix Copia e Cola', 'Código copiado para a área de transferência.', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pix QR Code Generator</h2>
            <p className="text-sm text-slate-500">Export dynamic Pix QR codes for offline POS integrations.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Amount (BRL)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-emerald-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description / Order ID</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-emerald-500"
            />
          </div>
          
          <div className="pt-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Pix Copia e Cola</h4>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={pixString}
                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-500 dark:border-slate-800 dark:bg-slate-900/50"
              />
              <button
                onClick={handleCopy}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center space-y-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100 dark:border-slate-700">
            <canvas
              ref={canvasRef}
              width={240}
              height={240}
              className="rounded-lg"
            />
          </div>
          <div className="flex items-center gap-3 w-full">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-500"
            >
              <Download className="h-4 w-4" />
              Download PNG
            </button>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
