import React from 'react';

export default function ChartCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
          {description ? <p className="text-xs text-zinc-500 mt-1">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
