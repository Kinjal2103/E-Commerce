import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import ChatAssistant from '../components/ChatAssistant';

export default function MainLayout() {
  return (
    <div className="relative min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col pt-24 font-sans select-none antialiased">
      {/* Universal navigation top header glass overlay */}
      <Navbar />

      {/* Main interactive application content container */}
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-1 md:px-0">
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
