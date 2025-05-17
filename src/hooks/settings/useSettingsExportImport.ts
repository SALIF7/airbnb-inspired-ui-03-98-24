
import { SiteSettings } from '@/types/siteSettings';

export const useSettingsExportImport = (
  settings: SiteSettings,
  updateSettings: (newSettings: Partial<SiteSettings>) => void
) => {
  /**
   * Exporte les paramètres sous forme de fichier JSON
   */
  const exportSettings = (): boolean => {
    try {
      // Créer une copie des paramètres sans les grands blobs d'images
      const exportableSettings = { ...settings };
      
      // Ne pas exporter les grandes data URLs
      if (exportableSettings.logo && exportableSettings.logo.startsWith('data:')) {
        exportableSettings.logo = 'stored_separately';
      }
      
      if (exportableSettings.favicon && exportableSettings.favicon.startsWith('data:')) {
        exportableSettings.favicon = 'stored_separately';
      }
      
      // Convertir en JSON
      const settingsJson = JSON.stringify(exportableSettings, null, 2);
      
      // Créer un blob et un lien de téléchargement
      const blob = new Blob([settingsJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      
      a.href = url;
      a.download = `site-settings-${date}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Nettoyer
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      return true;
    } catch (error) {
      console.error("Erreur lors de l'exportation des paramètres:", error);
      return false;
    }
  };

  /**
   * Importe les paramètres depuis un fichier JSON
   */
  const importSettings = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      try {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            if (!e.target || typeof e.target.result !== 'string') {
              console.error("Erreur de lecture du fichier");
              resolve(false);
              return;
            }
            
            // Analyser le JSON
            const importedSettings = JSON.parse(e.target.result) as SiteSettings;
            
            // Vérifier que la structure semble correcte
            if (!importedSettings || typeof importedSettings !== 'object') {
              console.error("Format de fichier invalide");
              resolve(false);
              return;
            }
            
            // Récupérer les images stockées actuellement
            let currentLogo = null;
            let currentFavicon = null;
            
            // Si les importations indiquent 'stored_separately', conserver les images actuelles
            if (importedSettings.logo === 'stored_separately') {
              if (settings.logo && settings.logo !== 'stored_separately') {
                currentLogo = settings.logo;
              } else {
                // Essayer de récupérer depuis le stockage local
                currentLogo = localStorage.getItem('site_logo');
                
                // Essayer de récupérer depuis la session
                if (!currentLogo) {
                  currentLogo = sessionStorage.getItem('current_logo');
                }
              }
              
              if (currentLogo) {
                importedSettings.logo = currentLogo;
              }
            }
            
            if (importedSettings.favicon === 'stored_separately') {
              if (settings.favicon && settings.favicon !== 'stored_separately') {
                currentFavicon = settings.favicon;
              } else {
                // Essayer de récupérer depuis le stockage local
                currentFavicon = localStorage.getItem('site_favicon');
              }
              
              if (currentFavicon) {
                importedSettings.favicon = currentFavicon;
              }
            }
            
            // Mettre à jour les paramètres
            updateSettings(importedSettings);
            
            // Si nous avons restauré des images, les sauvegarder explicitement
            if (currentLogo) {
              localStorage.setItem('site_logo', currentLogo);
              sessionStorage.setItem('current_logo', currentLogo);
            }
            
            if (currentFavicon) {
              localStorage.setItem('site_favicon', currentFavicon);
            }
            
            console.log("Paramètres importés avec succès");
            resolve(true);
          } catch (error) {
            console.error("Erreur lors de l'analyse du fichier importé:", error);
            resolve(false);
          }
        };
        
        reader.onerror = () => {
          console.error("Erreur lors de la lecture du fichier");
          resolve(false);
        };
        
        // Commencer la lecture du fichier
        reader.readAsText(file);
      } catch (error) {
        console.error("Erreur lors de l'importation des paramètres:", error);
        resolve(false);
      }
    });
  };

  return { exportSettings, importSettings };
};
