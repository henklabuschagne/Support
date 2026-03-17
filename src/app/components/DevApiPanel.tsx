import { useState } from 'react';
import { Database, RotateCcw, ChevronDown, ChevronUp, HardDrive, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { appStore } from '../lib/appStore';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DevApiPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const stats = appStore.getPersistenceStats();

  const handleReset = () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }
    appStore.resetAllData();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-brand-main text-white rounded-full shadow-lg hover:bg-brand-main-light transition-colors text-sm"
        >
          <Database className="w-4 h-4" />
          <span>Dev Panel</span>
        </button>
      )}

      {/* Panel */}
      {isOpen && (
        <div className="w-80 bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <button
            onClick={() => { setIsOpen(false); setShowConfirm(false); }}
            className="w-full flex items-center justify-between px-4 py-3 bg-brand-main text-white hover:bg-brand-main-light transition-colors"
          >
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span className="text-sm font-medium">Dev API Panel</span>
            </div>
            <ChevronDown className="w-4 h-4" />
          </button>

          <div className="p-4 space-y-4">
            {/* Data Persistence Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <HardDrive className="w-4 h-4 text-brand-primary" />
                <h3 className="text-sm font-medium text-foreground">Data Persistence</h3>
              </div>

              {/* Stats */}
              <div className="bg-muted/50 rounded-lg p-3 space-y-2 mb-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className="bg-brand-success-light text-brand-success text-xs">
                    {stats.keyCount > 0 ? 'Active' : 'No saved data'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Stored keys</span>
                  <span className="text-gray-900 font-medium">{stats.keyCount} / 18</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Storage used</span>
                  <span className="text-gray-900 font-medium">{formatBytes(stats.totalBytes)}</span>
                </div>
              </div>

              {/* Info text */}
              <p className="text-xs text-gray-500 mb-3">
                All data auto-persists to localStorage on every change.
                State is restored from saved data on page reload.
              </p>

              {/* Reset button */}
              {!showConfirm ? (
                <Button
                  variant="outline"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={handleReset}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset All Data to Defaults
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-red-600 font-medium">
                    This will clear all localStorage and reload with demo data. Are you sure?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 text-sm"
                      onClick={() => setShowConfirm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm"
                      onClick={handleReset}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      Confirm Reset
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Stored keys detail (collapsible) */}
            {stats.keyCount > 0 && (
              <StoredKeysDetail keys={stats.keys} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StoredKeysDetail({ keys }: { keys: string[] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-t border-gray-100 pt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
      >
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        <span>{expanded ? 'Hide' : 'Show'} stored keys</span>
      </button>
      {expanded && (
        <div className="mt-2 max-h-32 overflow-y-auto space-y-0.5">
          {keys.map(key => (
            <div key={key} className="text-xs font-mono text-gray-500 px-2 py-0.5 bg-gray-50 rounded">
              {key.replace('helpdesk_pro_', '')}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}