import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import ChatAssistant from '../components/ChatAssistant';

export default function MainLayout() {
  return (
    <div className="relative min-h-screen bg-[#0F172A] text-[#F8FAFC] flex flex-col pt-16 font-sans select-none antialiased">
      {/* Universal navigation top header glass overlay */}
      <Navbar />

      {/* Main interactive application content container */}
      <main className="flex-grow w-full">
        <Outlet />
      </main>

      {/* Slide-out Cart Panel overlaid universally */}
      <CartDrawer />

      {/* AI Chatbot Assistant widget */}
      <ChatAssistant />

      {/* Universal footer */}
      <Footer />
    </div>
  );
}
