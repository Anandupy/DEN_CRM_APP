'use client';
import React from 'react';
import { Trash2, Mail, MessageSquare, X, Download } from 'lucide-react';
import { toast } from 'sonner';

interface BulkActionBarProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onClearSelection: () => void;
}

export default function BulkActionBar({ selectedCount, onBulkDelete, onClearSelection }: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="slide-up flex items-center gap-3 bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-3">
      <span className="text-sm font-semibold text-amber-400">
        {selectedCount} member{selectedCount !== 1 ? 's' : ''} selected
      </span>
      <div className="flex-1 h-px bg-amber-500/15" />
      <div className="flex items-center gap-2">
        <button
          onClick={() => toast.success(`Sending SMS to ${selectedCount} members...`)}
          className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors border border-zinc-700"
        >
          <MessageSquare size={13} />
          Send SMS
        </button>
        <button
          onClick={() => toast.success(`Sending email to ${selectedCount} members...`)}
          className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors border border-zinc-700"
        >
          <Mail size={13} />
          Email
        </button>
        <button
          onClick={() => toast.success(`Exporting ${selectedCount} member records...`)}
          className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors border border-zinc-700"
        >
          <Download size={13} />
          Export
        </button>
        <button
          onClick={() => {
            if (window.confirm(`Delete ${selectedCount} member${selectedCount !== 1 ? 's' : ''}? This cannot be undone.`)) {
              onBulkDelete();
              toast.success(`${selectedCount} members deleted`);
            }
          }}
          className="flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors border border-red-500/20"
        >
          <Trash2 size={13} />
          Delete
        </button>
        <button
          onClick={onClearSelection}
          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          title="Clear selection"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}