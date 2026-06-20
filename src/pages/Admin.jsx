import { useState } from 'react';
import { LayoutDashboard, ShoppingBag, CreditCard, Users, LineChart, Settings, ArrowUpRight, TrendingUp, Cpu, Award } from 'lucide-react';

export default function Admin() {
  const [activeMenu, setActiveMenu] = useState('Dashboard');

  const stats = [
    { label: 'Revenue', value: '$54,248.00', change: '+12.5%', icon: CreditCard, color: 'text-blue-400' },
    { label: 'Active Orders', value: '184', change: '+8.3%', icon: ShoppingBag, color: 'text-purple-400' },
    { label: 'Active Users', value: '1,420', change: '+22%', icon: Users, color: 'text-green-400' },
    { label: 'Conversion Rate', value: '3.42%', change: '+1.5%', icon: LineChart, color: 'text-orange-400' }
  ];

  const salesData = [
    { month: 'Jan', amount: 32000, height: '55%' },
    { month: 'Feb', amount: 38000, height: '65%' },
    { month: 'Mar', amount: 45000, height: '78%' },
    { month: 'Apr', amount: 42000, height: '72%' },
    { month: 'May', amount: 49000, height: '85%' },
    { month: 'Jun', amount: 54248, height: '95%' }
  ];

  const categoriesShare = [
    { name: 'Graphics Cards (GPUs)', share: 45, color: 'bg-blue-500' },
    { name: 'Processors (CPUs)', share: 25, color: 'bg-purple-500' },
    { name: 'Motherboards', share: 15, color: 'bg-green-500' },
    { name: 'Memory & Storage', share: 15, color: 'bg-orange-500' }
  ];

  const topProducts = [
    { name: 'ROG Strix RTX 4090 OC', brand: 'ASUS', sales: 48, revenue: '$95,952.00' },
    { name: 'Intel Core i9-14900K', brand: 'Intel', sales: 120, revenue: '$70,680.00' },
    { name: 'AMD Ryzen 7 7800X3D', brand: 'AMD', sales: 145, revenue: '$53,505.00' }
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-10 font-sans mt-8 min-h-screen">
      {/* Title */}
      <div className="mb-8 border-b border-white/5 pb-6 text-left">
        <span className="text-[10px] tracking-widest text-purple-400 font-bold uppercase">Operations Center</span>
        <h1 className="text-3xl font-black text-white mt-1">Admin Dashboard</h1>
        <p className="text-slate-400 text-xs mt-2">Manage inventory sales, catalog configurations, and checkout orders.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left admin sidebar */}
        <aside className="lg:col-span-3 glass-panel p-4 rounded-2xl space-y-2 text-left h-fit">
          {[
            { name: 'Dashboard', icon: LayoutDashboard },
            { name: 'Products Catalog', icon: Cpu },
            { name: 'Orders Log', icon: ShoppingBag },
            { name: 'Users Database', icon: Users },
            { name: 'Reports', icon: LineChart },
            { name: 'Global Settings', icon: Settings }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveMenu(item.name)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-500 text-white shadow-[0_4px_12px_rgba(59,130,246,0.2)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </button>
            );
          })}
        </aside>

        {/* Right workspace details */}
        <main className="lg:col-span-9 space-y-8">
          {activeMenu === 'Dashboard' ? (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, idx) => {
                  const Icon = s.icon;
                  return (
                    <div key={idx} className="glass-panel p-5 rounded-2xl text-left space-y-4 relative overflow-hidden">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">{s.label}</span>
                          <h4 className="text-xl font-black text-white font-mono">{s.value}</h4>
                        </div>
                        <div className={`p-2.5 bg-white/5 rounded-xl ${s.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[10px]">
                        <span className="text-green-400 font-bold flex items-center">{s.change}</span>
                        <span className="text-slate-500">vs last month</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Charts grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Sales Chart */}
                <div className="md:col-span-8 glass-panel p-6 rounded-3xl text-left">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="font-bold text-white text-base">Monthly Revenue Trend</h3>
                      <p className="text-[10px] text-slate-500 font-mono">Gross monthly sales in USD</p>
                    </div>
                    <span className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> High Performance
                    </span>
                  </div>

                  {/* Custom CSS Chart */}
                  <div className="h-64 flex items-end justify-between gap-3 pt-6 px-4">
                    {salesData.map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                        <div className="w-full bg-blue-500/10 group-hover:bg-blue-500/20 rounded-t-lg h-full flex items-end justify-center relative">
                          {/* Animated fills */}
                          <div
                            style={{ height: d.height }}
                            className="w-full bg-gradient-to-t from-blue-500 to-purple-600 rounded-t-lg transition-all duration-700"
                          >
                            {/* Hover amount tooltip */}
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1E293B] text-[9px] text-blue-300 px-2 py-1 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-mono">
                              ${d.amount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">{d.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Popular Categories */}
                <div className="md:col-span-4 glass-panel p-6 rounded-3xl text-left">
                  <h3 className="font-bold text-white text-base mb-6">Market Share</h3>
                  <div className="space-y-4">
                    {categoriesShare.map((cat, i) => (
                      <div key={i} className="space-y-1 text-xs">
                        <div className="flex justify-between text-slate-300">
                          <span className="font-bold">{cat.name}</span>
                          <span className="font-mono text-white">{cat.share}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#0F172A] rounded-full overflow-hidden">
                          <div className={`h-full ${cat.color}`} style={{ width: `${cat.share}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Products Log */}
              <div className="glass-panel rounded-3xl p-6 text-left">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-white text-base">Top Selling Hardware</h3>
                  <Award className="w-5 h-5 text-blue-400" />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                        <th className="pb-3">Component Name</th>
                        <th className="pb-3 text-center">Units Sold</th>
                        <th className="pb-3 text-right">Revenue Generated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-350 font-sans">
                      {topProducts.map((p, idx) => (
                        <tr key={idx} className="hover:bg-white/5">
                          <td className="py-3 font-bold text-white">{p.name} <span className="text-[10px] text-slate-500 font-normal">({p.brand})</span></td>
                          <td className="py-3 text-center font-mono">{p.sales} units</td>
                          <td className="py-3 text-right font-mono text-blue-400 font-bold">{p.revenue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="glass-panel rounded-3xl py-24 px-6 text-center">
              <p className="text-slate-405 text-sm">{activeMenu} management console is only available in production mode.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
