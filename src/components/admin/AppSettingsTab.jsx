import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { useAuth } from '@/hooks/useAuth';
import { ImageDown as ImageUp, Save, KeyRound } from 'lucide-react';

const AppSettingsTab = () => {
  const { appName, setAppName, logoUrl, setLogoUrl } = useAppSettings();
  const { updateAdminCredentials, logout } = useAuth();

  const [currentAppName, setCurrentAppName] = useState(appName);
  const [currentLogoUrl, setCurrentLogoUrl] = useState(logoUrl);
  const [logoPreview, setLogoPreview] = useState(logoUrl);

  const [adminUsername, setAdminUsername] = useState('');
  const [currentAdminPassword, setCurrentAdminPassword] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmNewAdminPassword, setConfirmNewAdminPassword] = useState('');


  const handleAppNameChange = (e) => {
    setCurrentAppName(e.target.value);
  };

  const handleLogoUrlChange = (e) => {
    setCurrentLogoUrl(e.target.value);
    setLogoPreview(e.target.value);
  };
  
  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentLogoUrl(reader.result);
        setLogoPreview(reader.result); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAppSettings = () => {
    setAppName(currentAppName);
    setLogoUrl(currentLogoUrl);
    toast({
      title: "Paramètres sauvegardés",
      description: "Le nom de l'application et le logo ont été mis à jour.",
    });
  };

  const handleUpdateAdminCredentials = () => {
    if (newAdminPassword !== confirmNewAdminPassword) {
      toast({
        title: "Erreur",
        description: "Les nouveaux mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }
    if (!adminUsername.trim()) {
       toast({
        title: "Erreur",
        description: "Le nom d'utilisateur admin ne peut pas être vide.",
        variant: "destructive",
      });
      return;
    }


    const result = updateAdminCredentials(currentAdminPassword, adminUsername, newAdminPassword);
    if (result.success) {
      toast({
        title: "Succès",
        description: result.message,
      });
      setCurrentAdminPassword('');
      setNewAdminPassword('');
      setConfirmNewAdminPassword('');
      // Optional: force logout after credential change
      // logout(); 
    } else {
      toast({
        title: "Erreur de mise à jour",
        description: result.error,
        variant: "destructive",
      });
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <Card className="glass-effect border-white/20">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold gradient-text">Paramètres de l'Application</CardTitle>
          <CardDescription className="text-gray-400">
            Personnalisez le nom et le logo de votre application de pointage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="appName" className="text-gray-200">Nom de l'application</Label>
            <Input
              id="appName"
              type="text"
              value={currentAppName}
              onChange={handleAppNameChange}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              placeholder="Entrez le nom de l'application"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoUrl" className="text-gray-200">URL du Logo</Label>
            <Input
              id="logoUrl"
              type="text"
              value={currentLogoUrl}
              onChange={handleLogoUrlChange}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              placeholder="Entrez l'URL du logo ou téléchargez une image"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="logoUpload" className="text-gray-200">Télécharger un Logo</Label>
            <div className="flex items-center gap-4">
              <Input
                id="logoUpload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden" 
              />
              <Button asChild variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                 <label htmlFor="logoUpload" className="cursor-pointer flex items-center">
                    <ImageUp className="w-4 h-4 mr-2" />
                    Choisir un fichier
                 </label>
              </Button>
              {logoPreview && logoPreview !== "/default-logo.svg" && (
                <div className="w-16 h-16 rounded-md overflow-hidden border border-white/20 p-1 bg-white/5">
                  <img-replace src={logoPreview} alt="Aperçu du logo" className="w-full h-full object-contain" />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Si vous fournissez une URL et téléchargez un fichier, le fichier téléchargé sera prioritaire.
              Taille recommandée : 128x128px. Formats : SVG, PNG, JPG.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSaveAppSettings}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder les paramètres d'application
          </Button>
        </CardFooter>
      </Card>

      <Card className="glass-effect border-white/20">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold gradient-text">Identifiants Administrateur</CardTitle>
          <CardDescription className="text-gray-400">
            Modifiez le nom d'utilisateur et le mot de passe de l'administrateur.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="adminUsername" className="text-gray-200">Nouveau nom d'utilisateur Admin</Label>
            <Input
              id="adminUsername"
              type="text"
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              placeholder="Nouveau nom d'utilisateur"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentAdminPassword" className="text-gray-200">Mot de passe actuel</Label>
            <Input
              id="currentAdminPassword"
              type="password"
              value={currentAdminPassword}
              onChange={(e) => setCurrentAdminPassword(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              placeholder="Votre mot de passe actuel"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newAdminPassword" className="text-gray-200">Nouveau mot de passe</Label>
            <Input
              id="newAdminPassword"
              type="password"
              value={newAdminPassword}
              onChange={(e) => setNewAdminPassword(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              placeholder="Nouveau mot de passe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmNewAdminPassword" className="text-gray-200">Confirmer le nouveau mot de passe</Label>
            <Input
              id="confirmNewAdminPassword"
              type="password"
              value={confirmNewAdminPassword}
              onChange={(e) => setConfirmNewAdminPassword(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              placeholder="Confirmez le nouveau mot de passe"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleUpdateAdminCredentials}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            <KeyRound className="w-4 h-4 mr-2" />
            Mettre à jour les identifiants Admin
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default AppSettingsTab;