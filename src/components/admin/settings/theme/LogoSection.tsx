
import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImageIcon, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import "../../../../styles/components/logo.css";

interface LogoSectionProps {
  logoUrl: string;
  logoUploading: boolean;
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const LogoSection = ({ 
  logoUrl, 
  logoUploading, 
  handleLogoUpload 
}: LogoSectionProps) => {
  const { settings } = useSiteSettings();
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [logoError, setLogoError] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  
  useEffect(() => {
    try {
      // Reset error state at the beginning
      setLogoError(false);
      setLogoLoaded(false);
      
      // Use a default logo if none is provided
      const defaultLogo = "/lovable-uploads/840dfb44-1c4f-4475-9321-7f361be73327.png";
      
      if (logoUrl) {
        // Si un logoUrl est fourni directement, l'utiliser prioritairement
        console.log("Utilisation du logoUrl fourni directement");
        setPreviewUrl(logoUrl);
      } else if (settings.logo && settings.logo !== 'stored_separately') {
        // Si le logo est stocké directement dans les paramètres
        console.log("Logo chargé directement depuis les paramètres");
        setPreviewUrl(settings.logo);
      } else if (settings.logo === 'stored_separately') {
        // Le logo est stocké séparément, essayer de le récupérer
        const timestamp = localStorage.getItem('site_logo_timestamp');
        let storedLogo = null;
        
        if (timestamp) {
          storedLogo = localStorage.getItem(`site_logo_${timestamp}`);
        }
        
        if (!storedLogo) {
          storedLogo = localStorage.getItem('site_logo');
        }
        
        if (storedLogo) {
          console.log("Logo chargé depuis le stockage local (LogoSection)");
          setPreviewUrl(storedLogo);
        } else {
          console.log("Aucun logo trouvé dans le stockage local, utilisation du logo par défaut");
          setPreviewUrl(defaultLogo);
        }
      } else {
        console.log("Aucun logo trouvé, utilisation du logo par défaut");
        setPreviewUrl(defaultLogo);
      }
    } catch (error) {
      console.error("Error loading logo:", error);
      setLogoError(true);
      toast.error("Erreur lors du chargement du logo");
    }
  }, [settings.logo, logoUrl]);
  
  const handleLogoError = () => {
    console.error("Error loading logo preview");
    setLogoError(true);
  };
  
  const handleRetryLoad = () => {
    setLogoError(false);
    setLogoLoaded(false);
    
    // Force reload by setting a temporary empty value
    setPreviewUrl("");
    setTimeout(() => {
      setPreviewUrl(logoUrl || settings.logo || "/lovable-uploads/840dfb44-1c4f-4475-9321-7f361be73327.png");
    }, 100);
  };
  
  return (
    <div className="mb-6">
      <div className="flex flex-col space-y-1.5 mb-4">
        <Label htmlFor="logo">Logo du site</Label>
        <p className="text-sm text-muted-foreground">
          Téléchargez votre logo pour le site. Formats recommandés: PNG, SVG (transparent).
        </p>
      </div>
      
      <div className="flex flex-col gap-4 sm:flex-row">
        <Card className="w-full sm:w-1/3">
          <CardContent className="p-4 flex items-center justify-center">
            <div className="w-32 h-32 mx-auto bg-black border-2 border-yellow-500 rounded-full flex items-center justify-center overflow-hidden logo-container" style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}>
              {logoUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
                  <span className="text-xs text-yellow-500">Chargement...</span>
                </div>
              ) : previewUrl && !logoError ? (
                <img 
                  src={previewUrl} 
                  alt="Logo du site" 
                  className={`w-full h-full object-cover logo ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onError={handleLogoError}
                  onLoad={() => setLogoLoaded(true)}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 logo-fallback rounded-full h-full w-full bg-black border-2 border-yellow-500 flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-yellow-500" />
                  <span className="text-yellow-500 font-bold text-xl">
                    {settings.siteName ? settings.siteName.substring(0, 2).toUpperCase() : 'SJ'}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-col justify-center space-y-4 w-full sm:w-2/3">
          {logoError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Erreur lors du chargement du logo. Veuillez essayer de télécharger à nouveau.
              </AlertDescription>
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-auto" 
                onClick={handleRetryLoad}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </Alert>
          )}
          
          <div className="flex items-center gap-4">
            <Button variant="outline" className="relative w-40" disabled={logoUploading}>
              {logoUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {previewUrl ? "Changer le logo" : "Ajouter un logo"}
              <input
                id="logo"
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleLogoUpload}
                accept="image/*"
                disabled={logoUploading}
              />
            </Button>
            
            <div className="text-sm text-muted-foreground">
              Formats supportés: JPG, PNG, GIF, SVG. Taille max: 2MB
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
