import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth to check user role

const AppSettingsContext = createContext();

export const useAppSettings = () => useContext(AppSettingsContext);

const DEFAULT_APP_NAME = "JadiTime";
const DEFAULT_LOGO_URL = "/default-logo.svg"; 

export const AppSettingsProvider = ({ children }) => {
  const [appName, setAppNameState] = useState(DEFAULT_APP_NAME);
  const [logoUrl, setLogoUrlState] = useState(DEFAULT_LOGO_URL);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // Get current user from useAuth

  const fetchAndInitializeSetting = useCallback(async (key, defaultValue, setter) => {
    try {
      let { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('setting_key', key)
        .maybeSingle(); // Use maybeSingle() to avoid error if no row is found

      if (error && error.code !== 'PGRST116') { // PGRST116 is "Searched for a single row, but found 0 rows"
        console.error(`Error fetching ${key}:`, error);
        setter(localStorage.getItem(key) || defaultValue); // Fallback to localStorage or default
      } else if (data) {
        setter(data.value);
      } else {
        // No setting found in DB, attempt to insert default if user is admin
        setter(defaultValue); // Set default optimistically
        if (user && user.role === 'admin') { // Check if user is admin
          const { error: insertError } = await supabase
            .from('app_settings')
            .insert({ setting_key: key, value: defaultValue });
          if (insertError) {
            console.error(`Error inserting default ${key}:`, insertError);
            // If insert fails (e.g. RLS), it will remain the defaultValue in state.
            // localStorage will be the fallback if DB operations fail.
            localStorage.setItem(key, JSON.stringify(defaultValue));
          }
        } else {
          // Not an admin, or no user, rely on default and localStorage
           localStorage.setItem(key, JSON.stringify(defaultValue));
        }
      }
    } catch (e) {
      console.error(`General error with ${key}:`, e);
      setter(localStorage.getItem(key) || defaultValue);
    }
  }, [user]); // Add user to dependencies

  useEffect(() => {
    const initializeAppSettings = async () => {
      setLoading(true);
      // Wait for user to be potentially loaded by useAuth before fetching settings
      // This is important if RLS depends on the user's role.
      // A simple way is to ensure user object is available from useAuth.
      // However, useAuth itself has a loading state. A better approach might be
      // to trigger fetchAppSettings once the auth state is confirmed.
      // For now, adding `user` to fetchAndInitializeSetting's dependencies helps.
      
      await fetchAndInitializeSetting('appName', DEFAULT_APP_NAME, setAppNameState);
      await fetchAndInitializeSetting('logoUrl', DEFAULT_LOGO_URL, setLogoUrlState);
      setLoading(false);
    };

    // Only run initialization if user state is determined (not loading from useAuth)
    // or if user object is available. This check might need refinement based on useAuth's behavior.
    // if (!authLoading) { // Assuming useAuth exposes its loading state as authLoading
       initializeAppSettings();
    // }
  }, [fetchAndInitializeSetting]);


  const setAppSetting = async (key, newValue, setter) => {
    setter(newValue); // Optimistic update
    localStorage.setItem(key, JSON.stringify(newValue)); 
    
    if (user && user.role === 'admin') { // Ensure only admins can update
      try {
        const { error } = await supabase
          .from('app_settings')
          .update({ value: newValue })
          .eq('setting_key', key);
        if (error) {
          console.error(`Error updating ${key} in Supabase:`, error);
          // Potentially revert optimistic update or show error to user
        }
      } catch (e) {
        console.error(`Supabase error updating ${key}:`, e);
      }
    } else {
        console.warn(`User without admin role attempted to update ${key}. Update only local.`);
    }
  };

  const setAppName = (newName) => setAppSetting('appName', newName, setAppNameState);
  const setLogoUrl = (newUrl) => setAppSetting('logoUrl', newUrl, setLogoUrlState);
  
  if (loading) {
    // This loading state is for app settings context itself.
    // App.jsx handles a combined loading state (authLoading || loadingSettings)
    // return null; // Or a minimal loader if this context is used independently before App.jsx loader
  }

  return (
    <AppSettingsContext.Provider value={{ appName, setAppName, logoUrl, setLogoUrl, loadingSettings: loading }}>
      {children}
    </AppSettingsContext.Provider>
  );
};