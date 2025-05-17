
import { useState, useEffect } from 'react';
import { SiteSettings } from '@/types/siteSettings';
import { defaultSettings } from './useSettingsDefaults';

export const useSettingsStorage = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings as SiteSettings);

  // Charger les paramètres au démarrage
  useEffect(() => {
    try {
      // Récupérer les paramètres principaux
      const storedSettings = localStorage.getItem('siteSettings');
      let parsedSettings = storedSettings ? JSON.parse(storedSettings) : defaultSettings;
      
      // Vérifier si les images sont stockées séparément et les récupérer
      if (parsedSettings.logo === 'stored_separately') {
        try {
          // Récupérer uniquement le logo actuel avec le timestamp le plus récent
          const storedTimestamp = localStorage.getItem('site_logo_timestamp');
          let storedLogo = null;
          
          if (storedTimestamp) {
            // Récupérer la version versionnée spécifique
            storedLogo = localStorage.getItem(`site_logo_${storedTimestamp}`);
            console.log("Logo chargé depuis la version horodatée:", storedTimestamp);
          }
          
          // Si pas trouvé, essayer avec la clé standard
          if (!storedLogo) {
            storedLogo = localStorage.getItem('site_logo');
            console.log("Logo chargé depuis le stockage standard");
          }
          
          if (storedLogo) {
            console.log("Logo chargé, longueur:", storedLogo.length);
            
            // Pour une meilleure persistance, vérifier que le logo est une URL de données valide
            if (storedLogo.startsWith('data:image/')) {
              parsedSettings.logo = storedLogo;
            } else {
              console.log("Format de logo invalide, utilisation du logo par défaut");
              parsedSettings.logo = "/lovable-uploads/840dfb44-1c4f-4475-9321-7f361be73327.png";
            }
          } else {
            console.log("Aucun logo trouvé dans le stockage séparé");
            parsedSettings.logo = "/lovable-uploads/840dfb44-1c4f-4475-9321-7f361be73327.png";
          }
        } catch (logoError) {
          console.error("Erreur lors du chargement du logo séparé:", logoError);
          parsedSettings.logo = "/lovable-uploads/840dfb44-1c4f-4475-9321-7f361be73327.png";
        }
      }
      
      // Vérifier également pour le favicon
      if (parsedSettings.favicon === 'stored_separately') {
        try {
          const storedTimestamp = localStorage.getItem('site_favicon_timestamp');
          let storedFavicon = null;
          
          if (storedTimestamp) {
            storedFavicon = localStorage.getItem(`site_favicon_${storedTimestamp}`);
          }
          
          if (!storedFavicon) {
            storedFavicon = localStorage.getItem('site_favicon');
          }
          
          if (storedFavicon) {
            parsedSettings.favicon = storedFavicon;
            console.log("Favicon chargé depuis le stockage séparé");
          }
        } catch (faviconError) {
          console.error("Erreur lors du chargement du favicon:", faviconError);
        }
      }
      
      // S'assurer que le mode sombre est toujours désactivé
      parsedSettings.darkMode = false;
      
      setSettings(parsedSettings as SiteSettings);
      console.log("Paramètres chargés avec succès");
    } catch (error) {
      console.error("Erreur lors du chargement des paramètres:", error);
      setSettings({...defaultSettings, darkMode: false} as SiteSettings);
    }
  }, []);

  // Sauvegarder les paramètres à chaque modification de manière plus robuste
  useEffect(() => {
    try {
      // Vérifier et sauvegarder le logo et favicon avec isolation
      if (settings.logo) {
        // Vérifier si c'est une URL de données
        if (settings.logo.startsWith('data:')) {
          try {
            // Générer un timestamp unique pour cette version
            const timestamp = new Date().getTime();
            
            // Sauvegarder avec le timestamp pour garantir la persistance
            localStorage.setItem(`site_logo_${timestamp}`, settings.logo);
            localStorage.setItem('site_logo', settings.logo);
            localStorage.setItem('site_logo_timestamp', timestamp.toString());
            console.log("Logo sauvegardé avec horodatage:", timestamp);
          } catch (logoError) {
            console.error("Erreur lors de la sauvegarde du logo:", logoError);
            
            // Essayer une version compressée si possible (fallback)
            try {
              const compressedLogo = settings.logo.substring(0, 1000000); // Limiter la taille
              localStorage.setItem('site_logo', compressedLogo);
              console.log("Logo sauvegardé en version compressée");
            } catch (compressError) {
              console.error("Impossible de sauvegarder même le logo compressé:", compressError);
            }
          }
        }
      }
      
      if (settings.favicon && settings.favicon.startsWith('data:')) {
        try {
          const timestamp = new Date().getTime();
          localStorage.setItem(`site_favicon_${timestamp}`, settings.favicon);
          localStorage.setItem('site_favicon', settings.favicon);
          localStorage.setItem('site_favicon_timestamp', timestamp.toString());
          console.log("Favicon sauvegardé avec horodatage");
        } catch (faviconError) {
          console.error("Erreur lors de la sauvegarde du favicon:", faviconError);
        }
      }
      
      // Créer une copie des paramètres pour éviter de stocker les grandes data URLs directement
      const settingsToStore = { ...settings, darkMode: false };
      
      // Ne pas stocker les grandes data URLs dans l'objet principal
      if (settingsToStore.logo && settingsToStore.logo.startsWith('data:')) {
        // Remplacer par un indicateur dans l'objet principal
        settingsToStore.logo = 'stored_separately';
      }
      
      if (settingsToStore.favicon && settingsToStore.favicon.startsWith('data:')) {
        // Remplacer par un indicateur dans l'objet principal
        settingsToStore.favicon = 'stored_separately';
      }
      
      localStorage.setItem('siteSettings', JSON.stringify(settingsToStore));
      console.log("Paramètres sauvegardés avec succès");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des paramètres:", error);
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    setSettings((prevSettings) => {
      // S'assurer que le mode sombre reste désactivé
      const updatedSettings = {
        ...prevSettings,
        ...newSettings,
        darkMode: false
      };
      console.log("Paramètres mis à jour:", updatedSettings);
      return updatedSettings;
    });
  };

  const resetSettings = () => {
    // Supprimer également les images stockées séparément
    localStorage.removeItem('site_logo');
    localStorage.removeItem('site_logo_timestamp');
    
    // Supprimer toutes les versions horodatées
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('site_logo_')) {
        localStorage.removeItem(key);
      }
    }
    
    // Supprimer également le favicon
    localStorage.removeItem('site_favicon');
    localStorage.removeItem('site_favicon_timestamp');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('site_favicon_')) {
        localStorage.removeItem(key);
      }
    }
    
    setSettings({...defaultSettings, darkMode: false} as SiteSettings);
    console.log("Paramètres réinitialisés");
  };

  return {
    settings,
    updateSettings,
    resetSettings
  };
};
