
/**
 * Fonctions pour gérer le stockage des images dans localStorage avec isolation
 */

/**
 * Sauvegarde les images d'une offre d'emploi avec isolation stricte
 */
export const saveJobImages = (jobId: string, images: string[]): void => {
  if (!jobId || !images || images.length === 0) return;
  
  try {
    const key = `job_images_${jobId}`;
    
    // Filtrer les images valides (base64 ou http/https)
    const validImages = images.filter(img => 
      img && 
      typeof img === 'string' && 
      (img.startsWith('data:image/') || 
       img.startsWith('http') || 
       img.startsWith('https'))
    );
    
    if (validImages.length > 0) {
      // Stocker avec un ID unique pour garantir l'isolation
      localStorage.setItem(key, JSON.stringify(validImages));
      console.log(`Images valides sauvegardées spécifiquement pour l'offre ${jobId}:`, validImages.length);
      
      // Sauvegarder également l'image principale
      if (validImages[0]) {
        localStorage.setItem(`job_featured_image_${jobId}`, validImages[0]);
        console.log(`Image principale sauvegardée spécifiquement pour l'offre ${jobId}`);
      }
      
      // Ne plus utiliser "latest" pour les offres avec un ID défini
    } else {
      console.log(`Aucune image valide à sauvegarder pour l'offre ${jobId}`);
    }
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde des images pour l'offre ${jobId}:`, error);
  }
};

/**
 * Supprime les images d'une offre d'emploi
 */
export const clearJobImages = (jobId: string): void => {
  if (!jobId) return;
  
  try {
    const key = `job_images_${jobId}`;
    localStorage.removeItem(key);
    localStorage.removeItem(`job_featured_image_${jobId}`);
    console.log(`Images supprimées pour l'offre ${jobId}`);
  } catch (error) {
    console.error(`Erreur lors de la suppression des images pour l'offre ${jobId}:`, error);
  }
};

/**
 * Supprime toutes les images d'offres du localStorage
 */
export const purgeAllJobImages = (): void => {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('job_images_') || key.includes('job_featured_image_'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log(`${keysToRemove.length} entrées d'images d'offres supprimées du localStorage`);
  } catch (error) {
    console.error('Erreur lors de la suppression de toutes les images:', error);
  }
};

/**
 * Récupère les images d'une offre spécifique
 */
export const getJobImages = (jobId: string): string[] => {
  if (!jobId) return [];
  
  try {
    const key = `job_images_${jobId}`;
    const imagesStr = localStorage.getItem(key);
    
    if (!imagesStr) {
      console.log(`Aucune image trouvée pour l'offre ${jobId}`);
      return [];
    }
    
    try {
      const images = JSON.parse(imagesStr);
      if (Array.isArray(images)) {
        console.log(`${images.length} images récupérées pour l'offre ${jobId}`);
        return images;
      }
    } catch (e) {
      console.error(`Erreur de parsing pour ${key}:`, e);
    }
    
    return [];
  } catch (error) {
    console.error(`Erreur lors de la récupération des images pour l'offre ${jobId}:`, error);
    return [];
  }
};

/**
 * Récupère l'image principale d'une offre spécifique
 */
export const getJobFeaturedImage = (jobId: string): string => {
  if (!jobId) return '';
  
  try {
    const key = `job_featured_image_${jobId}`;
    const image = localStorage.getItem(key);
    
    if (!image) {
      // Si pas d'image principale, essayer de récupérer la première image
      const images = getJobImages(jobId);
      if (images.length > 0) {
        return images[0];
      }
      return '';
    }
    
    return image;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'image principale pour l'offre ${jobId}:`, error);
    return '';
  }
};

/**
 * Met à jour les images temporaires avec un ID permanent
 */
export const finalizeJobImages = (jobId: string): void => {
  try {
    // Récupérer les images temporaires
    const tempImages = localStorage.getItem('job_images_latest');
    const tempFeaturedImage = localStorage.getItem('job_featured_image_latest');
    
    if (tempImages) {
      // Créer une entrée permanente avec l'ID
      localStorage.setItem(`job_images_${jobId}`, tempImages);
      console.log(`Images temporaires finalisées pour l'offre ${jobId}`);
    }
    
    if (tempFeaturedImage) {
      localStorage.setItem(`job_featured_image_${jobId}`, tempFeaturedImage);
      console.log(`Image principale temporaire finalisée pour l'offre ${jobId}`);
    }
    
    // Nettoyer les entrées temporaires
    localStorage.removeItem('job_images_latest');
    localStorage.removeItem('job_featured_image_latest');
  } catch (error) {
    console.error(`Erreur lors de la finalisation des images pour l'offre ${jobId}:`, error);
  }
};
