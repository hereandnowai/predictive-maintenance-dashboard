
import React, { useState, Fragment } from 'react';
import { HashRouter, Routes, Route, NavLink, Link } from 'react-router-dom';
import { DashboardPage } from './components/DashboardPage';
import { EquipmentPage } from './components/EquipmentPage';
import { SchedulePage } from './components/SchedulePage';
import { AlertsPage } from './components/AlertsPage';
import { LogsPage } from './components/LogsPage';
import { InventoryPage } from './components/InventoryPage';
import { ReportsPage } from './components/ReportsPage';
import { 
  DashboardIcon, EquipmentIcon, ScheduleIcon, AlertIcon, LogIcon, InventoryIcon, ReportIcon, UserIcon, ChevronDownIcon,
  BlogIcon, LinkedInIcon, InstagramIcon, GithubIcon, XIcon, YouTubeIcon, LinkIcon
} from './components/icons';
import { APP_NAME, CURRENT_USER, MOCK_USERS, BRAND_CONFIG } from './constants';
import { User, UserRole } from './types';

const navItems = [
  { name: 'Dashboard', path: '/', icon: DashboardIcon, roles: [UserRole.TECHNICIAN, UserRole.SUPERVISOR, UserRole.MANAGER] },
  { name: 'Equipment', path: '/equipment', icon: EquipmentIcon, roles: [UserRole.TECHNICIAN, UserRole.SUPERVISOR, UserRole.MANAGER] },
  { name: 'Schedule', path: '/schedule', icon: ScheduleIcon, roles: [UserRole.TECHNICIAN, UserRole.SUPERVISOR, UserRole.MANAGER] },
  { name: 'Alerts', path: '/alerts', icon: AlertIcon, roles: [UserRole.TECHNICIAN, UserRole.SUPERVISOR, UserRole.MANAGER] },
  { name: 'Logs', path: '/logs', icon: LogIcon, roles: [UserRole.TECHNICIAN, UserRole.SUPERVISOR, UserRole.MANAGER] },
  { name: 'Inventory', path: '/inventory', icon: InventoryIcon, roles: [UserRole.SUPERVISOR, UserRole.MANAGER] },
  { name: 'Reports', path: '/reports', icon: ReportIcon, roles: [UserRole.MANAGER] },
];

const MainLayout: React.FC<{ children: React.ReactNode, currentUser: User, onUserChange: (user: User) => void }> = ({ children, currentUser, onUserChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const availableNavItems = navItems.filter(item => item.roles.includes(currentUser.role));
  const brandColors = BRAND_CONFIG.brand.colors;
  const brandSocial = BRAND_CONFIG.brand.socialMedia;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 text-gray-100 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                   transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex md:flex-col`}
        style={{ backgroundColor: brandColors.secondary }}
      >
        <div className="flex items-center justify-center h-20 border-b" style={{ borderColor: brandColors.primary + '40' /* 25% opacity */ }}>
          <Link to="/" className="flex items-center" title={BRAND_CONFIG.brand.longName}>
            <img src={BRAND_CONFIG.brand.logo.title} alt={`${APP_NAME} Logo`} className="h-10 w-auto mr-2"/>
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {availableNavItems.map(item => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 rounded-lg transition-colors duration-200 
                 ${isActive 
                    ? `text-[${brandColors.secondary}] shadow-lg` 
                    : `text-[${brandColors.primary}] hover:bg-[${brandColors.primary}] hover:text-[${brandColors.secondary}]`
                 }`
              }
              style={({isActive}) => isActive ? {backgroundColor: brandColors.primary} : {}}
              onClick={() => sidebarOpen && setSidebarOpen(false)}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t" style={{ borderColor: brandColors.primary + '40' }}>
            <p className="text-xs text-center mb-2" style={{color: brandColors.primary + 'A0'}}>{BRAND_CONFIG.brand.slogan}</p>
            <div className="flex justify-center space-x-3 mb-3">
              {brandSocial.blog && <a href={brandSocial.blog} target="_blank" rel="noopener noreferrer" className={`text-[${brandColors.primary}] hover:text-white`} title="Blog"><BlogIcon className="w-5 h-5" /></a>}
              {brandSocial.linkedin && <a href={brandSocial.linkedin} target="_blank" rel="noopener noreferrer" className={`text-[${brandColors.primary}] hover:text-white`} title="LinkedIn"><LinkedInIcon className="w-5 h-5" /></a>}
              {brandSocial.instagram && <a href={brandSocial.instagram} target="_blank" rel="noopener noreferrer" className={`text-[${brandColors.primary}] hover:text-white`} title="Instagram"><InstagramIcon className="w-5 h-5" /></a>}
              {brandSocial.github && <a href={brandSocial.github} target="_blank" rel="noopener noreferrer" className={`text-[${brandColors.primary}] hover:text-white`} title="GitHub"><GithubIcon className="w-5 h-5" /></a>}
              {brandSocial.x && <a href={brandSocial.x} target="_blank" rel="noopener noreferrer" className={`text-[${brandColors.primary}] hover:text-white`} title="X"><XIcon className="w-5 h-5" /></a>}
              {brandSocial.youtube && <a href={brandSocial.youtube} target="_blank" rel="noopener noreferrer" className={`text-[${brandColors.primary}] hover:text-white`} title="YouTube"><YouTubeIcon className="w-5 h-5" /></a>}
            </div>
            <p className="text-xs" style={{color: brandColors.primary + 'A0'}}>Role-based access demo.</p>
            <select 
              value={currentUser.id} 
              onChange={(e) => {
                const selectedUser = MOCK_USERS.find(u => u.id === e.target.value);
                if (selectedUser) onUserChange(selectedUser);
              }}
              className="mt-1 block w-full border rounded-md shadow-sm p-2 text-sm focus:ring-opacity-50"
              style={{ 
                backgroundColor: brandColors.secondary, 
                borderColor: brandColors.primary+'70', 
                color: brandColors.primary,
              }}
            >
              {MOCK_USERS.map(user => (
                <option key={user.id} value={user.id} style={{backgroundColor: brandColors.secondary, color: brandColors.primary}}>{user.name} ({user.role})</option>
              ))}
            </select>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-500 focus:outline-none focus:text-gray-700 md:hidden">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6H20M4 12H20M4 18H11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="text-xl font-semibold text-[${brandColors.secondary}] md:hidden">{APP_NAME}</div>
          <div className="flex items-center ml-auto">
            <div className="relative">
              <button onClick={() => setProfileDropdownOpen(!profileDropdownOpen)} className={`flex items-center text-sm text-[${brandColors.secondary}] hover:text-[${brandColors.primary}] focus:outline-none p-2 rounded-lg hover:bg-gray-100`}>
                <UserIcon className="w-6 h-6 mr-2 rounded-full" />
                <span>{currentUser.name}</span>
                <ChevronDownIcon className={`w-4 h-4 ml-1 transition-transform duration-200 ${profileDropdownOpen ? 'transform rotate-180' : ''}`} />
              </button>
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-20 py-1">
                  <a href="#" className={`block px-4 py-2 text-sm text-[${brandColors.secondary}] hover:bg-[${brandColors.primary}] hover:text-[${brandColors.secondary}]`}>Profile</a>
                  <a href="#" className={`block px-4 py-2 text-sm text-[${brandColors.secondary}] hover:bg-[${brandColors.primary}] hover:text-[${brandColors.secondary}]`}>Settings</a>
                  <hr className="my-1 border-gray-200" />
                  <a href="#" className={`block px-4 py-2 text-sm text-[${brandColors.secondary}] hover:bg-[${brandColors.primary}] hover:text-[${brandColors.secondary}]`}>Logout</a>
                </div>
              )}
            </div>
          </div>
        </header>
        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);

  const handleUserChange = (user: User) => {
    setCurrentUser(user);
  };
  
  const brandColors = BRAND_CONFIG.brand.colors;

  return (
    <HashRouter>
      <MainLayout currentUser={currentUser} onUserChange={handleUserChange}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/equipment" element={<EquipmentPage />} />
          <Route path="/equipment/:equipmentId" element={<EquipmentPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/logs" element={<LogsPage />} />
          
          {(currentUser.role === UserRole.SUPERVISOR || currentUser.role === UserRole.MANAGER) && (
            <Route path="/inventory" element={<InventoryPage />} />
          )}
          {currentUser.role === UserRole.MANAGER && (
            <Route path="/reports" element={<ReportsPage />} />
          )}
          {/* Fallback for restricted routes or unknown paths */}
          <Route path="*" element={
            <div className="p-6 text-center">
              <h1 className="text-2xl font-bold text-red-600">Access Denied or Page Not Found</h1>
              <p className="text-gray-600">You do not have permission to view this page, or the page does not exist.</p>
              <Link to="/" className={`mt-4 inline-block text-[${brandColors.secondary}] hover:underline`}>Go to Dashboard</Link>
            </div>
          } />
        </Routes>
      </MainLayout>
    </HashRouter>
  );
};

export default App;
