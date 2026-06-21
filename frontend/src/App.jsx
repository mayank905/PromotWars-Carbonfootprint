import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Leaf, Globe2, Activity, Users, BarChart3 } from 'lucide-react';

// Placeholders for Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Track from './pages/Track';
import World from './pages/World';
import Community from './pages/Community';
import Insights from './pages/Insights';

function Layout({ children }) {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  if (isLanding) return children;

  return (
    <div className="flex h-screen overflow-hidden bg-forest-dark text-white font-body">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-white/10 flex flex-col z-20">
        <div className="p-6 flex items-center gap-3">
          <Leaf className="text-emerald w-8 h-8" />
          <h1 className="text-2xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald to-sage">EcoSphere</h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <NavItem to="/dashboard" icon={<Home />} label="Dashboard" />
          <NavItem to="/track" icon={<Activity />} label="Track Activity" />
          <NavItem to="/world" icon={<Globe2 />} label="My World" />
          <NavItem to="/community" icon={<Users />} label="Community" />
          <NavItem to="/insights" icon={<BarChart3 />} label="Insights" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute inset-0 bg-gradient-to-br from-forest-dark via-[#111A15] to-[#0D1510] -z-10 pointer-events-none" />
        <div className="p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ to, icon, label }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
        isActive 
          ? 'bg-emerald/20 text-emerald shadow-[inset_0_0_10px_rgba(64,145,108,0.2)]' 
          : 'text-white/70 hover:bg-white/5 hover:text-white'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/track" element={<Track />} />
        <Route path="/world" element={<World />} />
        <Route path="/community" element={<Community />} />
        <Route path="/insights" element={<Insights />} />
      </Routes>
    </Layout>
  );
}

export default App;
