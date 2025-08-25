import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import MobileChart from '@/components/MobileChart';
import MobileDataTable from '@/components/MobileDataTable';
import MobileForm from '@/components/MobileForm';
import MobileModal from '@/components/MobileModal';
import MobileNotification, { useNotifications } from '@/components/MobileNotification';
import MobileLoading, { MobileSkeleton } from '@/components/MobileLoading';
import SimpleLineChart from '@/components/SimpleLineChart';
import { useResponsive } from '@/utils/responsive';
import { TOUCH_BUTTON, RESPONSIVE_SPACING, MOBILE_FIRST } from '@/utils/responsive';

const MobileDashboard: React.FC = () => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [showModal, setShowModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  
  const {
    notifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    dismissNotification
  } = useNotifications();

  // Sample data for the data table
  const sampleData = [
    { id: 1, name: 'Revenue', value: '$125,000', change: '+12%', status: 'positive' },
    { id: 2, name: 'Orders', value: '1,250', change: '+8%', status: 'positive' },
    { id: 3, name: 'Customers', value: '850', change: '+5%', status: 'positive' },
    { id: 4, name: 'Returns', value: '45', change: '-2%', status: 'negative' },
    { id: 5, name: 'Conversion', value: '3.2%', change: '+0.5%', status: 'positive' },
  ];

  const tableColumns = [
    { key: 'name', label: 'Metric', sortable: true, mobilePriority: 'high' },
    { key: 'value', label: 'Value', sortable: true, mobilePriority: 'high' },
    { key: 'change', label: 'Change', sortable: true, mobilePriority: 'medium' },
    { key: 'status', label: 'Status', sortable: true, mobilePriority: 'low' },
  ];

  // Sample form fields
  const formFields = [
    { name: 'name', label: 'Name', type: 'text' as const, required: true, mobilePriority: 'high' },
    { name: 'email', label: 'Email', type: 'email' as const, required: true, mobilePriority: 'high' },
    { name: 'phone', label: 'Phone', type: 'text' as const, mobilePriority: 'medium' },
    { name: 'company', label: 'Company', type: 'text' as const, mobilePriority: 'medium' },
    { name: 'role', label: 'Role', type: 'select' as const, options: [
      { value: 'admin', label: 'Administrator' },
      { value: 'user', label: 'User' },
      { value: 'viewer', label: 'Viewer' }
    ], mobilePriority: 'high' },
    { name: 'notifications', label: 'Enable Notifications', type: 'checkbox' as const, mobilePriority: 'low' },
  ];

  // Sample chart data
  const chartData = [
    { x: 'Jan', y: 100 },
    { x: 'Feb', y: 120 },
    { x: 'Mar', y: 140 },
    { x: 'Apr', y: 160 },
    { x: 'May', y: 180 },
    { x: 'Jun', y: 200 },
  ];

  const handleFormSubmit = (data: Record<string, any>) => {
    console.log('Form submitted:', data);
    showSuccess('Form Submitted', 'Your information has been saved successfully!');
    setShowForm(false);
  };

  const handleExport = () => {
    showInfo('Export Started', 'Your data export is being prepared...');
  };

  const handleRefresh = () => {
    setLoadingState('loading');
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setLoadingState('success');
          showSuccess('Refresh Complete', 'Data has been refreshed successfully!');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleError = () => {
    setLoadingState('error');
    showError('Operation Failed', 'Something went wrong. Please try again.');
  };

  const handleRetry = () => {
    setLoadingState('loading');
    setProgress(0);
    handleRefresh();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className={`${RESPONSIVE_SPACING.md} bg-white rounded-lg shadow-sm border border-gray-200`}>
          <div className={`${MOBILE_FIRST.stack} items-center justify-between`}>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mobile Dashboard</h1>
              <p className="text-gray-600 mt-2">Optimized for mobile devices with touch-friendly interactions</p>
            </div>
            
            <div className={`${MOBILE_FIRST.stack} items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-4 sm:mt-0`}>
              <button
                onClick={() => setShowModal(true)}
                className={`${TOUCH_BUTTON.primary} space-x-2`}
              >
                <span>Open Modal</span>
              </button>
              
              <button
                onClick={() => setShowForm(true)}
                className={`${TOUCH_BUTTON.secondary} space-x-2`}
              >
                <span>Show Form</span>
              </button>
            </div>
          </div>
          
          {/* Device Info */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Current device: <span className="font-medium">{isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}</span>
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MobileChart
            title="Revenue Trend"
            variant="mobile"
            showControls={true}
            onRefresh={handleRefresh}
            onExport={handleExport}
            isLoading={loadingState === 'loading'}
          >
            <SimpleLineChart data={chartData} width={400} height={300} />
          </MobileChart>
          
          <MobileChart
            title="Performance Metrics"
            variant="tablet"
            showControls={true}
            onRefresh={handleRefresh}
            onExport={handleExport}
          >
            <SimpleLineChart data={chartData} width={400} height={300} />
          </MobileChart>
        </div>

        {/* Data Table */}
        <MobileDataTable
          data={sampleData}
          columns={tableColumns}
          title="Business Metrics"
          searchable={true}
          filterable={true}
          exportable={true}
          onExport={handleExport}
          onRowClick={(row) => showInfo('Row Clicked', `Selected: ${row.name}`)}
        />

        {/* Loading States */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Loading Spinner</h3>
            <MobileLoading state="loading" size="md" />
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Loading Dots</h3>
            <MobileLoading state="loading" variant="dots" size="md" />
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Success State</h3>
            <MobileLoading state="success" size="md" />
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Error State</h3>
            <MobileLoading 
              state="error" 
              size="md" 
              onRetry={handleRetry}
            />
          </div>
        </div>

        {/* Progress Loading */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Progress Loading</h3>
          <div className="space-y-4">
            <MobileLoading
              state={loadingState}
              message="Processing data..."
              showProgress={true}
              progress={progress}
              onRetry={handleRetry}
            />
            
            <div className="flex space-x-4">
              <button
                onClick={handleRefresh}
                className={`${TOUCH_BUTTON.primary} space-x-2`}
                disabled={loadingState === 'loading'}
              >
                <span>Start Progress</span>
              </button>
              
              <button
                onClick={handleError}
                className={`${TOUCH_BUTTON.secondary} space-x-2`}
                disabled={loadingState === 'loading'}
              >
                <span>Simulate Error</span>
              </button>
            </div>
          </div>
        </div>

        {/* Skeleton Loading */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Skeleton Loading</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Text Skeleton</h4>
              <MobileSkeleton type="text" lines={3} />
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Card Skeleton</h4>
              <MobileSkeleton type="card" />
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Table Skeleton</h4>
              <MobileSkeleton type="table" lines={4} />
            </div>
          </div>
        </div>

        {/* Notification Examples */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Examples</h3>
          <div className={`${MOBILE_FIRST.stack} items-center space-y-2 sm:space-y-0 sm:space-x-2`}>
            <button
              onClick={() => showSuccess('Success!', 'Operation completed successfully')}
              className={`${TOUCH_BUTTON.primary} space-x-2`}
            >
              <span>Show Success</span>
            </button>
            
            <button
              onClick={() => showError('Error!', 'Something went wrong')}
              className={`${TOUCH_BUTTON.secondary} space-x-2`}
            >
              <span>Show Error</span>
            </button>
            
            <button
              onClick={() => showWarning('Warning!', 'Please check your input')}
              className={`${TOUCH_BUTTON.secondary} space-x-2`}
            >
              <span>Show Warning</span>
            </button>
            
            <button
              onClick={() => showInfo('Info', 'Here is some information')}
              className={`${TOUCH_BUTTON.secondary} space-x-2`}
            >
              <span>Show Info</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <MobileModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Mobile Modal Example"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            This is an example of a mobile-optimized modal with touch-friendly interactions.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Feature 1</h4>
              <p className="text-sm text-gray-600">Touch-friendly buttons and responsive layout</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Feature 2</h4>
              <p className="text-sm text-gray-600">Swipe gestures and mobile interactions</p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowModal(false)}
              className={`${TOUCH_BUTTON.secondary} space-x-2`}
            >
              <span>Close</span>
            </button>
          </div>
        </div>
      </MobileModal>

      {/* Form Modal */}
      <MobileModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Contact Form"
        size="xl"
      >
        <MobileForm
          fields={formFields}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
          submitLabel="Submit Form"
          cancelLabel="Cancel"
        />
      </MobileModal>

      {/* Notifications */}
      <MobileNotification
        notifications={notifications}
        onDismiss={dismissNotification}
        position="top"
        maxNotifications={3}
      />
    </DashboardLayout>
  );
};

export default MobileDashboard;
