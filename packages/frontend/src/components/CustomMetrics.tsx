import React, { useState } from 'react';
import { CustomMetric } from '../types/businessOverview';
import { Plus, Edit, Trash2, Calculator, Database, Calendar, Eye, EyeOff } from 'lucide-react';

interface CustomMetricsProps {
  customMetrics: CustomMetric[];
  onAddMetric?: (metric: Omit<CustomMetric, 'id' | 'createdAt' | 'lastCalculated'>) => void;
  onUpdateMetric?: (id: string, metric: Partial<CustomMetric>) => void;
  onDeleteMetric?: (id: string) => void;
  onToggleActive?: (id: string, isActive: boolean) => void;
  className?: string;
}

const CustomMetrics: React.FC<CustomMetricsProps> = ({ 
  customMetrics, 
  onAddMetric,
  onUpdateMetric,
  onDeleteMetric,
  onToggleActive,
  className = '' 
}) => {
  const [isAddingMetric, setIsAddingMetric] = useState(false);
  const [editingMetric, setEditingMetric] = useState<string | null>(null);
  const [showFormulas, setShowFormulas] = useState(false);
  
  const [newMetric, setNewMetric] = useState({
    name: '',
    formula: '',
    description: '',
    category: '',
    unit: ''
  });

  const [editForm, setEditForm] = useState({
    name: '',
    formula: '',
    description: '',
    category: '',
    unit: ''
  });

  const categories = ['marketing', 'sales', 'finance', 'operations', 'customer', 'business'];

  const handleAddMetric = () => {
    if (newMetric.name && newMetric.formula && newMetric.category && newMetric.unit) {
      onAddMetric?.({
        ...newMetric,
        isActive: true
      });
      setNewMetric({ name: '', formula: '', description: '', category: '', unit: '' });
      setIsAddingMetric(false);
    }
  };

  const handleEditMetric = (metric: CustomMetric) => {
    setEditingMetric(metric.id);
    setEditForm({
      name: metric.name,
      formula: metric.formula,
      description: metric.description,
      category: metric.category,
      unit: metric.unit
    });
  };

  const handleUpdateMetric = (id: string) => {
    if (editForm.name && editForm.formula && editForm.category && editForm.unit) {
      onUpdateMetric?.(id, editForm);
      setEditingMetric(null);
      setEditForm({ name: '', formula: '', description: '', category: '', unit: '' });
    }
  };

  const handleCancelEdit = () => {
    setEditingMetric(null);
    setEditForm({ name: '', formula: '', description: '', category: '', unit: '' });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'marketing':
        return 'bg-blue-100 text-blue-800';
      case 'sales':
        return 'bg-green-100 text-green-800';
      case 'finance':
        return 'bg-purple-100 text-purple-800';
      case 'operations':
        return 'bg-orange-100 text-orange-800';
      case 'customer':
        return 'bg-pink-100 text-pink-800';
      case 'business':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === '%') {
      return `${value.toFixed(1)}%`;
    }
    if (unit === 'USD' || unit === '$') {
      return `$${value.toLocaleString()}`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M ${unit}`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K ${unit}`;
    }
    return `${value.toLocaleString()} ${unit}`;
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50';
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Custom Metrics</h3>
            <p className="text-sm text-gray-500">Create and manage your business-specific KPIs</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFormulas(!showFormulas)}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
            >
              {showFormulas ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showFormulas ? 'Hide' : 'Show'} Formulas</span>
            </button>
            <button
              onClick={() => setIsAddingMetric(!isAddingMetric)}
              className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Metric</span>
            </button>
          </div>
        </div>

        {/* Add New Metric Form */}
        {isAddingMetric && (
          <div className="mb-6 p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Add New Custom Metric</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Metric Name</label>
                <input
                  type="text"
                  value={newMetric.name}
                  onChange={(e) => setNewMetric({ ...newMetric, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Customer Acquisition Cost"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newMetric.category}
                  onChange={(e) => setNewMetric({ ...newMetric, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <input
                  type="text"
                  value={newMetric.unit}
                  onChange={(e) => setNewMetric({ ...newMetric, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., USD, %, count"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Formula</label>
                <input
                  type="text"
                  value={newMetric.formula}
                  onChange={(e) => setNewMetric({ ...newMetric, formula: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Marketing Spend / New Customers"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newMetric.description}
                  onChange={(e) => setNewMetric({ ...newMetric, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Describe what this metric measures and why it's important"
                />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2 mt-4">
              <button
                onClick={() => setIsAddingMetric(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMetric}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Add Metric
              </button>
            </div>
          </div>
        )}

        {/* Custom Metrics List */}
        <div className="space-y-4">
          {customMetrics.length === 0 ? (
            <div className="text-center py-8">
              <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No custom metrics created yet</p>
              <p className="text-sm text-gray-400">Create your first custom KPI to get started</p>
            </div>
          ) : (
            customMetrics.map((metric) => (
              <div
                key={metric.id}
                className={`p-4 rounded-lg border ${getStatusColor(metric.isActive)}`}
              >
                {editingMetric === metric.id ? (
                  // Edit Form
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                          value={editForm.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                        <input
                          type="text"
                          value={editForm.unit}
                          onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Formula</label>
                        <input
                          type="text"
                          value={editForm.formula}
                          onChange={(e) => setEditForm({ ...editForm, formula: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateMetric(metric.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display Mode
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900">{metric.name}</h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(metric.category)}`}>
                            {metric.category}
                          </span>
                          <span className={`inline-flex items-center px-1 py-1 rounded-full text-xs ${metric.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {metric.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{metric.description}</p>
                        {showFormulas && (
                          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                            <Calculator className="w-4 h-4" />
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded">{metric.formula}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Unit: {metric.unit}</span>
                          <span>Created: {new Date(metric.createdAt).toLocaleDateString()}</span>
                          <span>Last calculated: {new Date(metric.lastCalculated).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => onToggleActive?.(metric.id, !metric.isActive)}
                          className={`p-2 rounded-md ${metric.isActive ? 'text-green-600 hover:bg-green-100' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          {metric.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleEditMetric(metric)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-md"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteMetric?.(metric.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-md"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Current Value Display */}
                    {metric.value !== undefined && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <div className="text-sm text-gray-600 mb-1">Current Value</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatValue(metric.value, metric.unit)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Summary Stats */}
        {customMetrics.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{customMetrics.length}</div>
                <div className="text-xs text-gray-500">Total Metrics</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {customMetrics.filter(m => m.isActive).length}
                </div>
                <div className="text-xs text-gray-500">Active</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(customMetrics.map(m => m.category)).size}
                </div>
                <div className="text-xs text-gray-500">Categories</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {customMetrics.filter(m => m.value !== undefined).length}
                </div>
                <div className="text-xs text-gray-500">With Values</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomMetrics;
