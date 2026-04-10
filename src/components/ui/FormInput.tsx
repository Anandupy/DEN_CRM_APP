import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

export default function FormInput({ label, hint, error, className = '', ...props }: FormInputProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="form-label">{label}</span>
      {hint ? <span className="text-[11px] text-zinc-600 -mt-1">{hint}</span> : null}
      <input {...props} className={`form-input text-sm ${className}`.trim()} />
      {error ? <span className="text-xs text-red-400">{error}</span> : null}
    </label>
  );
}
