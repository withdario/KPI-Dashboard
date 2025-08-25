import React, { useState } from 'react';
import { Save, X, Check, AlertCircle } from 'lucide-react';
import { TOUCH_BUTTON, RESPONSIVE_SPACING, MOBILE_FIRST } from '../utils/responsive';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'date' | 'time';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    pattern?: RegExp;
    message?: string;
    min?: number;
    max?: number;
  };
  mobilePriority?: 'high' | 'medium' | 'low';
}

interface MobileFormProps {
  fields: FormField[];
  title?: string;
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
  initialData?: Record<string, any>;
  loading?: boolean;
  className?: string;
  showValidation?: boolean;
}

const MobileForm: React.FC<MobileFormProps> = ({
  fields,
  title,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  onSubmit,
  onCancel,
  initialData = {},
  loading = false,
  className = '',
  showValidation = true
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Get mobile priority fields
  const mobileFields = fields.filter(field => field.mobilePriority !== 'low');

  const validateField = (name: string, value: any): string => {
    const field = fields.find(f => f.name === name);
    if (!field) return '';

    // Required validation
    if (field.required && (!value || value === '')) {
      return `${field.label} is required`;
    }

    // Pattern validation
    if (field.validation?.pattern && value && !field.validation.pattern.test(value)) {
      return field.validation.message || `${field.label} format is invalid`;
    }

    // Min/Max validation
    if (field.validation?.min !== undefined && value && Number(value) < field.validation.min) {
      return `${field.label} must be at least ${field.validation.min}`;
    }

    if (field.validation?.max !== undefined && value && Number(value) > field.validation.max) {
      return `${field.label} must be at most ${field.validation.max}`;
    }

    return '';
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touched[name] && showValidation) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    if (showValidation) {
      const error = validateField(name, formData[name]);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const newTouched: Record<string, boolean> = {};
    fields.forEach(field => {
      newTouched[field.name] = true;
    });
    setTouched(newTouched);
    
    // Validate all fields
    const newErrors: Record<string, string> = {};
    fields.forEach(field => {
      const error = validateField(field.name, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });
    setErrors(newErrors);
    
    // Submit if no errors
    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  };

  const renderField = (field: FormField) => {
    const hasError = errors[field.name];
    const isTouched = touched[field.name];
    const showError = showValidation && isTouched && hasError;

    const baseInputClasses = `w-full px-3 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
      showError 
        ? 'border-red-300 focus:ring-red-500' 
        : 'border-gray-300 focus:border-blue-500'
    }`;

    const renderInput = () => {
      switch (field.type) {
        case 'textarea':
          return (
            <textarea
              name={field.name}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              onBlur={() => handleBlur(field.name)}
              placeholder={field.placeholder}
              required={field.required}
              rows={4}
              className={`${baseInputClasses} resize-none`}
            />
          );

        case 'select':
          return (
            <select
              name={field.name}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              onBlur={() => handleBlur(field.name)}
              required={field.required}
              className={baseInputClasses}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );

        case 'checkbox':
          return (
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name={field.name}
                checked={formData[field.name] || false}
                onChange={(e) => handleInputChange(field.name, e.target.checked)}
                onBlur={() => handleBlur(field.name)}
                required={field.required}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{field.label}</span>
            </div>
          );

        case 'radio':
          return (
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name={field.name}
                    value={option.value}
                    checked={formData[field.name] === option.value}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    onBlur={() => handleBlur(field.name)}
                    required={field.required}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </div>
              ))}
            </div>
          );

        default:
          return (
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              onBlur={() => handleBlur(field.name)}
              placeholder={field.placeholder}
              required={field.required}
              min={field.validation?.min}
              max={field.validation?.max}
              className={baseInputClasses}
            />
          );
      }
    };

    return (
      <div key={field.name} className="space-y-2">
        {field.type !== 'checkbox' && (
          <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        {renderInput()}
        
        {showError && (
          <div className="flex items-center space-x-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{hasError}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        {title && (
          <div className={`${RESPONSIVE_SPACING.md} border-b border-gray-200`}>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          </div>
        )}
        
        {/* Form Fields */}
        <div className={`${RESPONSIVE_SPACING.md} space-y-6`}>
          <div className={`grid grid-cols-1 ${mobileFields.length > 2 ? 'lg:grid-cols-2' : ''} gap-6`}>
            {mobileFields.map(renderField)}
          </div>
        </div>
        
        {/* Form Actions */}
        <div className={`${RESPONSIVE_SPACING.md} border-t border-gray-200 pt-6`}>
          <div className={`${MOBILE_FIRST.stack} items-center justify-end space-y-3 sm:space-y-0 sm:space-x-3`}>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className={`${TOUCH_BUTTON.secondary} space-x-2`}
                disabled={loading}
              >
                <X className="w-4 h-4" />
                <span>{cancelLabel}</span>
              </button>
            )}
            
            <button
              type="submit"
              className={`${TOUCH_BUTTON.primary} space-x-2`}
              disabled={loading}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{submitLabel}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MobileForm;
