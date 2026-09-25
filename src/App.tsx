import React from 'react';
import { CafeProvider, useCafe } from './context/CafeContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { PosView } from './components/views/PosView';
import { DashboardView } from './components/views/DashboardView';
import { PlayStationView } from './components/views/PlayStationView';
import { InventoryView } from './components/views/InventoryView';
import { TablesView } from './components/views/TablesView';
import { ExpensesView } from './components/views/ExpensesView';
import { ShiftsView } from './components/views/ShiftsView';
import { DayReportView } from './components/views/DayReportView';
import { OrdersView } from './components/views/OrdersView';
import { TestingView } from './components/views/TestingView';
import { LoginView } from './components/views/LoginView';
import { AdminHubView } from './components/views/AdminHubView';
import { ReceiptModal } from './components/modals/ReceiptModal';
import { AuthModal } from './components/modals/AuthModal';
import { ProductEditModal } from './components/modals/ProductEditModal';
import { NotificationPanel } from './components/notifications/NotificationPanel';
import { NotificationToast } from './components/notifications/NotificationToast';

const AppContent: React.FC = () => {
  const { activeView, isAuthenticated } = useCafe();

  // If user is not authenticated or explicitly at login view, show Login View
  if (!isAuthenticated || activeView === 'login') {
    return (
      <div className="min-h-screen bg-[#f5efe6] text-[#231f1e] flex flex-col justify-center items-center font-sans p-3">
        <LoginView />
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'pos':
        return <PosView />;
      case 'dashboard':
        return <DashboardView />;
      case 'admin_hub':
      case 'admin_products':
        return <AdminHubView />;
      case 'playstation':
        return <PlayStationView />;
      case 'tables':
        return <TablesView />;
      case 'inventory':
      case 'audit':
      case 'purchases':
        return <InventoryView />;
      case 'expenses':
        return <ExpensesView />;
      case 'shifts':
        return <ShiftsView />;
      case 'day_report':
        return <DayReportView />;
      case 'orders':
        return <OrdersView />;
      case 'qa_tests':
        return <TestingView />;
      default:
        return <PosView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f5efe6] text-[#231f1e] flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area with bottom padding for mobile navigation */}
        <main className="flex-1 p-3 sm:p-5 md:p-6 pb-24 lg:pb-6 overflow-y-auto">
          {renderActiveView()}
        </main>

        {/* Sidebar matching images navigation */}
        <div className="no-print">
          <Sidebar />
        </div>
      </div>

      {/* Global Receipt Modal */}
      <ReceiptModal />

      {/* Global User Authentication & Switching Modal */}
      <AuthModal />

      {/* Global Product Add/Edit Modal (Admin CMS) */}
      <ProductEditModal />

      {/* Global Notification Panel Drawer & Floating Alert Toast */}
      <NotificationPanel />
      <NotificationToast />
    </div>
  );
};

export default function App() {
  return (
    <CafeProvider>
      <AppContent />
    </CafeProvider>
  );
}
