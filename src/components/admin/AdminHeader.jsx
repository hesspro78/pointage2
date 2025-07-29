import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Settings, Briefcase } from 'lucide-react';
import { useAppSettings } from '@/contexts/AppSettingsContext';

const AdminHeader = ({ onLogout }) => {
  const { appName, logoUrl } = useAppSettings();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-between items-center mb-8"
    >
      <div className="flex items-center gap-4">
        {logoUrl === "/default-logo.svg" ? (
          <Briefcase className="w-10 h-10 text-blue-400" />
        ) : (
          <img-replace src={logoUrl} alt={`${appName} logo`} className="w-10 h-10 object-contain" />
        )}
        <div>
          <h1 className="text-4xl font-bold gradient-text">
            {appName}
          </h1>
          <p className="text-gray-300 mt-1">
            Panneau d'Administration
          </p>
        </div>
      </div>
      
      <Button
        onClick={onLogout}
        variant="outline"
        className="border-white/20 text-white hover:bg-white/10"
      >
        <Settings className="w-4 h-4 mr-2" />
        Déconnexion
      </Button>
    </motion.div>
  );
};

export default AdminHeader;