'use client'
import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
}

export function Input({ label, error, helper, className = '', ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 
          focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200
          ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}
          ${className}`}
        {...props}
      />
      {helper && <p className="mt-1 text-xs text-gray-500">{helper}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options?: { value: string | number; label: string }[]
  children?: React.ReactNode
}

export function Select({ label, error, options, children, className = '', ...props }: SelectProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <select
        className={`w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900
          focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200
          ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}
          ${className}`}
        {...props}
      >
        {options ? (
          options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))
        ) : (
          children
        )}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helper?: string
}

export function Textarea({ label, error, helper, className = '', ...props }: TextareaProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        className={`w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 
          focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200 resize-none
          ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}
          ${className}`}
        {...props}
      />
      {helper && <p className="mt-1 text-xs text-gray-500">{helper}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
}

export function Checkbox({ label, className = '', ...props }: CheckboxProps) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <div className="relative">
        <input
          type="checkbox"
          className={`peer h-5 w-5 rounded-lg border-2 border-gray-300 text-primary 
            focus:ring-2 focus:ring-primary/20 focus:ring-offset-0 transition-all duration-200
            checked:border-primary checked:bg-primary
            ${className}`}
          {...props}
        />
      </div>
      <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
        {label}
      </span>
    </label>
  )
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  loading, 
  icon, 
  children, 
  className = '',
  disabled,
  ...props 
}: ButtonProps) {
  const variants = {
    primary: 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm',
    secondary: 'bg-slate-400 text-white hover:bg-slate-500 shadow-sm',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm shadow-red-500/25',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    dark: 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : icon}
      {children}
    </button>
  )
}

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      {action}
    </div>
  )
}

interface StatusBadgeProps {
  active: boolean
  activeText?: string
  inactiveText?: string
}

export function StatusBadge({ active, activeText = 'Идэвхтэй', inactiveText = 'Идэвхгүй' }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
      active 
        ? 'bg-emerald-50 text-emerald-700' 
        : 'bg-gray-100 text-gray-600'
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
      {active ? activeText : inactiveText}
    </span>
  )
}

interface FormActionsProps {
  onCancel: () => void
  submitText?: string
  loading?: boolean
}

export function FormActions({ onCancel, submitText = 'Хадгалах', loading }: FormActionsProps) {
  return (
    <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
      <Button type="button" variant="ghost" onClick={onCancel}>
        Цуцлах
      </Button>
      <Button type="submit" loading={loading}>
        {submitText}
      </Button>
    </div>
  )
}