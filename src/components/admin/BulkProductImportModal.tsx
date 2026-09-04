import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  Download,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { adminClient } from '../../services/adminClient';

interface BulkProductImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ImportReport {
  total: number;
  added: number;
  failed: number;
  errors?: Array<{ row: number; error: string }>;
  message: string;
}

const SAMPLE_CSV = `name,description,category,price,discount,stock,sizes,colors,image_urls,gender,department
"Aura Silk Blend Kimono","Handcrafted from fine mulberry silk with fluid draping.","Outerwear",14500,0,15,"S,M,L","Onyx Black:#111111,Champagne:#F4E8C1","https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80","women","clothing"
"Cashmere Minimalist Overshirt","Pure Mongolian cashmere button-down overshirt.","Shirts",18900,10,20,"M,L,XL","Slate Gray:#475569,Raw Ivory:#F8FAFC","https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80","men","clothing"
"Architectural Leather Chelsea Boots","Italian calfskin leather with durable stacked crepe soles.","Boots",22500,0,8,"40,41,42,43,44","Ebony:#18181B,Deep Tobacco:#78350F","https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=800&q=80","unisex","shoes"`;

export const BulkProductImportModal: React.FC<BulkProductImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.endsWith('.csv')) {
        setErrorMessage('Please select a valid CSV file (.csv).');
        return;
      }
      setFile(selected);
      setErrorMessage(null);
      setReport(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      if (!dropped.name.endsWith('.csv')) {
        setErrorMessage('Please upload a .csv spreadsheet file.');
        return;
      }
      setFile(dropped);
      setErrorMessage(null);
      setReport(null);
    }
  };

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'veloura_product_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmitImport = async () => {
    if (!file) {
      setErrorMessage('Please choose a CSV file to import.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setReport(null);

    try {
      const res = await adminClient.importProductsCsv(file);
      setReport({
        total: res.total,
        added: res.added,
        failed: res.failed,
        errors: res.errors,
        message: res.message,
      });

      if (res.added > 0) {
        onSuccess();
      }
    } catch (err: any) {
      if (err.response) {
        setReport(err.response);
      }
      setErrorMessage(err.message || 'Error occurred while processing bulk CSV upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setReport(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#121212] border border-stone-200 dark:border-white/10 rounded-xs shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-stone-100 dark:bg-zinc-800 rounded-xs text-stone-900 dark:text-white">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-950 dark:text-white">
                Bulk CSV Product Import
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-light">
                Batch ingest inventory directly into MongoDB atelier catalogue
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-white rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Instructions & Template Link */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-white/10 rounded-xs gap-3">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-900 dark:text-white">
                CSV Data Specifications
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                Columns: <code className="text-[11px] font-mono text-amber-700 dark:text-amber-400">name, description, category, price, discount, stock, sizes, colors, image_urls</code>
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-white dark:bg-zinc-800 border border-stone-300 dark:border-white/20 text-stone-900 dark:text-white rounded-xs hover:bg-stone-100 dark:hover:bg-zinc-700 transition-colors shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Template
            </button>
          </div>

          {/* Upload Zone */}
          {!report && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xs p-8 text-center cursor-pointer transition-colors ${
                file
                  ? 'border-stone-900 bg-stone-50 dark:border-white dark:bg-white/5'
                  : 'border-stone-300 dark:border-white/20 hover:border-stone-500 dark:hover:border-white/40 bg-stone-50/50 dark:bg-zinc-900/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
              />

              {file ? (
                <div className="space-y-2">
                  <FileText className="w-10 h-10 mx-auto text-emerald-600 dark:text-emerald-400" />
                  <p className="text-sm font-semibold text-stone-900 dark:text-white">
                    {file.name}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {(file.size / 1024).toFixed(1)} KB • Click or drop another to replace
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <UploadCloud className="w-10 h-10 mx-auto text-stone-400 dark:text-stone-500" />
                  <p className="text-sm font-medium text-stone-900 dark:text-white">
                    Drag and drop your product CSV here
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-light">
                    or click to browse your computer files
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && !report && (
            <div className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 rounded-xs text-xs text-rose-800 dark:text-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <div>
                <p className="font-semibold">Import Error</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Import Result Report */}
          {report && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-4 bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-white/10 rounded-xs">
                  <span className="block text-[10px] uppercase tracking-wider text-stone-500">Processed</span>
                  <span className="text-xl font-bold text-stone-950 dark:text-white">{report.total}</span>
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/30 rounded-xs">
                  <span className="block text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Added to DB</span>
                  <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{report.added}</span>
                </div>
                <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/30 rounded-xs">
                  <span className="block text-[10px] uppercase tracking-wider text-rose-600 dark:text-rose-400">Failed</span>
                  <span className="text-xl font-bold text-rose-700 dark:text-rose-300">{report.failed}</span>
                </div>
              </div>

              {report.added > 0 && report.failed === 0 && (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-xs text-xs text-emerald-900 dark:text-emerald-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-semibold">Bulk Import Completed Successfully!</p>
                    <p className="text-stone-600 dark:text-stone-400 mt-0.5">
                      All {report.added} items have been validated and inserted into the active inventory.
                    </p>
                  </div>
                </div>
              )}

              {report.errors && report.errors.length > 0 && (
                <div className="border border-rose-200 dark:border-rose-800/40 rounded-xs overflow-hidden">
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border-b border-rose-200 dark:border-rose-800/40 flex items-center justify-between text-xs text-rose-900 dark:text-rose-200 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      Validation Exceptions ({report.errors.length})
                    </span>
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y divide-rose-100 dark:divide-rose-950/30 p-2 text-xs">
                    {report.errors.map((err, i) => (
                      <div key={i} className="py-2 px-2 flex items-start gap-2 text-rose-800 dark:text-rose-300">
                        <span className="font-mono font-bold shrink-0">Row #{err.row}:</span>
                        <span>{err.error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-zinc-900/50 flex items-center justify-end gap-3">
          {report ? (
            <>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-stone-700 hover:text-stone-950 dark:text-stone-300 dark:hover:text-white transition-colors cursor-pointer"
              >
                Upload Another File
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-stone-950 text-white hover:bg-stone-800 dark:bg-white dark:text-black dark:hover:bg-[#EAEAEA] text-xs font-bold uppercase tracking-widest rounded-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={isUploading}
                className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-stone-600 hover:text-stone-950 dark:text-stone-400 dark:hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitImport}
                disabled={!file || isUploading}
                className="px-6 py-2.5 bg-stone-950 text-white hover:bg-stone-800 dark:bg-white dark:text-black dark:hover:bg-[#EAEAEA] text-xs font-bold uppercase tracking-widest rounded-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Parsing & Inserting...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Start Bulk Import</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
