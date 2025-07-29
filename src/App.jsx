import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';
import LoginForm from '@/components/LoginForm';
import Dashboard from '@/components/Dashboard';
import AdminPanel from '@/components/AdminPanel';
import Footer from '@/components/Footer';
import { AppSettingsProvider, useAppSettings } from '@/contexts/AppSettingsContext';
import { supabase } from './lib/supabaseClient'; // Import supabase client

function AppContent() {
  const { user, loading: authLoading, logout } = useAuth(); 
  const { loadingSettings } = useAppSettings();
  const [appUser, setAppUser] = useState(user);

  useEffect(() => {
    setAppUser(user);
  }, [user]);

  // This effect syncs appUser state with Supabase auth changes or localStorage changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user;
        if (currentUser) {
           // Fetch profile to get role, name, etc.
           const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
          
          setAppUser({
            id: currentUser.id,
            email: currentUser.email,
            role: profile?.role || 'employee', // Default to employee if profile/role not found
            name: profile?.full_name || currentUser.email,
            department: profile?.department || 'Non défini'
          });
        } else {
          setAppUser(null);
        }
      }
    );
    
    // Also handle local storage changes for non-Supabase users (admin/master)
    // or if direct localStorage manipulation occurs.
    const handleStorageChange = async (event) => {
      if (event.key === 'currentUser') {
        if (!event.newValue) {
          // If local current user is removed, re-check Supabase session
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user) setAppUser(null);
        } else {
          try {
            const parsedUser = JSON.parse(event.newValue);
            // This might be a local user (master/admin) or a stale Supabase user object
            // Prefer Supabase auth state if available, otherwise trust local if valid
            const { data: { session } } = await supabase.auth.getSession();
            if(!session?.user) setAppUser(parsedUser);

          } catch (error) {
            setAppUser(null);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      authListener?.subscription.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  const handleLoginSuccess = async (loggedInUser) => {
     // loggedInUser could be from local auth (master/admin) or Supabase auth
    if(loggedInUser.id && loggedInUser.email) { // Likely from Supabase or already structured
        setAppUser(loggedInUser);
    } else if (loggedInUser.username) { // Likely local master/admin
         setAppUser({
            id: loggedInUser.id, // 'master' or 'admin'
            username: loggedInUser.username,
            name: loggedInUser.name,
            role: loggedInUser.role,
            department: loggedInUser.department,
            email: loggedInUser.email || `${loggedInUser.username}@local.host` // placeholder
        });
    }
  };

  const handleLogout = () => {
    logout(); // This now calls supabase.auth.signOut()
    setAppUser(null);
  };

  if (authLoading || loadingSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {!appUser ? <LoginForm onLoginSuccess={handleLoginSuccess} /> : (appUser.role === 'admin' ? <AdminPanel onLogout={handleLogout} /> : <Dashboard onLogout={handleLogout} />)}
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <AppSettingsProvider>
      <AppContent />
    </AppSettingsProvider>
  );
}

export default App;
