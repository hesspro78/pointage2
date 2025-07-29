import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

const MASTER_USERNAME = 'hespro78@gmail.com';
const MASTER_PASSWORD = '0613805503tT@';

// Default local admin credentials are removed as admin login will now be via Supabase Auth

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Auth loading state

  const fetchUserProfile = async (supabaseUser) => {
    if (!supabaseUser) return null;
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116: 0 rows
      console.error('Error fetching profile:', error);
      return {
        id: supabaseUser.id,
        email: supabaseUser.email,
        role: supabaseUser.email === MASTER_USERNAME ? 'admin' : 'employee', 
        name: supabaseUser.email,
        department: 'Non défini',
      };
    }
    
    return profile ? {
      id: supabaseUser.id,
      email: supabaseUser.email,
      role: profile.role || (supabaseUser.email === MASTER_USERNAME ? 'admin' : 'employee'),
      name: profile.full_name || supabaseUser.email,
      department: profile.department || 'Non défini',
    } : { 
        id: supabaseUser.id,
        email: supabaseUser.email,
        role: supabaseUser.email === MASTER_USERNAME ? 'admin' : 'employee',
        name: supabaseUser.email,
        department: 'Non défini',
    };
  };

  const loadUserSession = useCallback(async () => {
    setLoading(true);
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Error getting session:', sessionError);
      setUser(null);
      localStorage.removeItem('currentUser');
      setLoading(false);
      return;
    }

    if (session?.user) {
      const userProfile = await fetchUserProfile(session.user);
      setUser(userProfile);
      if (userProfile) localStorage.setItem('currentUser', JSON.stringify(userProfile));
      else localStorage.removeItem('currentUser');
    } else {
      // Check for locally stored master user if no Supabase session
      const localUserStr = localStorage.getItem('currentUser');
      if (localUserStr) {
          try {
              const localUser = JSON.parse(localUserStr);
              if (localUser.username === MASTER_USERNAME && localUser.role === 'admin') {
                  setUser(localUser);
              } else {
                   localStorage.removeItem('currentUser');
                   setUser(null);
              }
          } catch(e) {
              localStorage.removeItem('currentUser');
              setUser(null);
          }
      } else {
          setUser(null);
      }
    }
    setLoading(false);
  }, []); 

  useEffect(() => {
    loadUserSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setLoading(true); 
      if (session?.user) {
        const userProfile = await fetchUserProfile(session.user);
        setUser(userProfile);
        if (userProfile) localStorage.setItem('currentUser', JSON.stringify(userProfile));
        else localStorage.removeItem('currentUser');
      } else {
        setUser(null);
        localStorage.removeItem('currentUser');
      }
      setLoading(false);
    });
    
    const handleStorageChange = (event) => {
      if (event.key === 'currentUser' && !event.newValue) {
            if (!user) loadUserSession(); 
        }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      authListener?.subscription.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadUserSession, user]); 

  const login = async (username, password) => {
    setLoading(true);
    // Master User Login (Local)
    if (username === MASTER_USERNAME && password === MASTER_PASSWORD) {
      const masterUser = {
        id: 'master', 
        username: MASTER_USERNAME,
        name: 'Développeur Master',
        role: 'admin',
        department: 'Développement',
        email: MASTER_USERNAME,
      };
      setUser(masterUser);
      localStorage.setItem('currentUser', JSON.stringify(masterUser));
      setLoading(false);
      return { success: true, user: masterUser };
    }
    
    // Try Supabase login for any other case if username looks like an email
    // This will now handle admin logins as well, provided they are set up in Supabase Auth
    // and their profile has role 'admin'
    if (username.includes('@')) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: username,
            password: password,
        });

        if (error) {
            setLoading(false);
            return { success: false, error: error.message || 'Identifiants incorrects via Supabase' };
        }

        if (data.user) {
            const userProfile = await fetchUserProfile(data.user);
            setUser(userProfile);
            if(userProfile) localStorage.setItem('currentUser', JSON.stringify(userProfile));
            else localStorage.removeItem('currentUser');
            setLoading(false);
            return { success: true, user: userProfile };
        }
    }

    // Fallback for non-email usernames that are not master (legacy local employee check)
    // This part should ideally be removed once all employees use Supabase Auth.
    const employees = JSON.parse(localStorage.getItem('employees') || '[]');
    const employee = employees.find(emp => emp.username === username && emp.password === password);

    if (employee) {
      const userData = {
        id: employee.id, 
        username: employee.username,
        name: employee.name,
        role: 'employee',
        department: employee.department,
        email: employee.email 
      };
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      setLoading(false);
      return { success: true, user: userData };
    }

    setLoading(false);
    return { success: false, error: 'Identifiants incorrects. Les administrateurs doivent utiliser leur e-mail.' };
  };

  const logout = useCallback(async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error during Supabase sign out:', error);
    }
    setUser(null);
    localStorage.removeItem('currentUser');
    // Clear master user specific local storage if any
    if (user?.id === 'master') {
        // any master specific cleanup
    }
    setLoading(false);
  }, [user]); // Added user dependency to logout, in case of user-specific cleanup

  // updateAdminCredentials is removed as local admin management is deprecated.
  // Admin password changes should be handled via Supabase Auth (e.g., "Forgot Password" flow or admin interface in Supabase)
  // Admin role assignment is handled in the 'profiles' table.

  return {
    user,
    loading, 
    login,
    logout,
    // updateAdminCredentials function is removed
    isAdmin: user?.role === 'admin',
    isEmployee: user?.role === 'employee'
  };
};