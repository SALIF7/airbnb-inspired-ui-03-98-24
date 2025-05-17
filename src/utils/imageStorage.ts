
/**
 * Utilitaires de stockage et gestion d'images
 */

/**
 * Supprime les anciennes entrées du localStorage pour libérer de l'espace
 */
export const purgeOldImageEntries = (): void => {
  try {
    // Garder une liste des clés à supprimer pour éviter les problèmes de boucle
    const keysToRemove: string[] = [];
    
    // Identifier les clés à supprimer
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('job_featured_image_') || key.includes('job_images_'))) {
        // Ne supprimer que les anciennes entrées (pas les "latest")
        if (!key.includes('_latest')) {
          // Ne pas supprimer les clés qui contiennent un ID spécifique
          const matches = key.match(/_([\w-]+)$/);
          if (matches && matches[1] === 'latest') {
            keysToRemove.push(key);
          }
        }
      }
      
      // Gérer également les anciennes versions du logo (garder seulement la plus récente)
      if (key && key.startsWith('site_logo_') && key !== 'site_logo' && key !== 'site_logo_timestamp') {
        const currentTimestamp = localStorage.getItem('site_logo_timestamp');
        // Si ce n'est pas la version actuelle, ajouter à la liste de suppression
        if (currentTimestamp && key !== `site_logo_${currentTimestamp}`) {
          keysToRemove.push(key);
        }
      }
    }
    
    // Supprimer toutes les clés identifiées
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    if (keysToRemove.length > 0) {
      console.log(`${keysToRemove.length} anciennes entrées nettoyées du localStorage`);
    }
  } catch (error) {
    console.error('Erreur lors du nettoyage du localStorage:', error);
  }
};

/**
 * Vérifie si une clé fait référence à une entité avec un ID spécifique
 */
const isSpecificEntityKey = (key: string, entityType: string, entityId: string): boolean => {
  const pattern = new RegExp(`${entityType}_${entityId}$`);
  return pattern.test(key);
};

/**
 * Stocke des images dans localStorage avec un ID spécifique
 * et garantit qu'elles ne seront pas écrasées par d'autres entités
 */
export const storeImagesToLocalStorage = async (
  key: string, 
  images: string[], 
  compressFunction: (img: string, quality: number) => Promise<string>,
  entityId?: string
): Promise<string[]> => {
  try {
    // Purger les anciennes entrées pour libérer de l'espace
    purgeOldImageEntries();
    
    // Si nous avons un entityId, utiliser des clés spécifiques à cette entité
    const storageKey = entityId ? `${key}_${entityId}` : `${key}_latest`;
    
    // Limiter à max 3 images pour éviter de dépasser le quota
    const limitedImages = images.slice(0, 3);
    
    // Compresser les images
    const processedImages = await Promise.all(
      limitedImages.map(async (img) => {
        try {
          // Ajouter un timestamp unique à chaque image pour éviter les problèmes de cache
          const timestamp = new Date().getTime();
          const compressedImg = await compressFunction(img, 0.6);
          return `${compressedImg}#t=${timestamp}`;
        } catch (error) {
          console.error("Erreur lors du traitement de l'image:", error);
          return '';
        }
      })
    );
    
    // Filtrer les images vides ou invalides
    const validImages = processedImages.filter(img => img && img.length > 0);
    
    if (validImages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(validImages));
      console.log(`${validImages.length} images converties et stockées dans ${storageKey}`);
      
      // Ne pas écraser d'autres entités - stocker UNIQUEMENT avec l'ID spécifique
      if (entityId) {
        console.log(`Images associées spécifiquement à l'entité ${entityId}`);
      }
    }
    
    return validImages;
  } catch (error) {
    console.error('Erreur lors du stockage des images:', error);
    return [];
  }
};

/**
 * Stocke une image unique dans localStorage avec versionnement
 * et isolation complète entre différentes entités
 */
export const storeSingleImageToLocalStorage = async (
  key: string, 
  image: string,
  compressFunction: (img: string, quality: number) => Promise<string>,
  entityId?: string
): Promise<string> => {
  try {
    // Purger les anciennes entrées pour libérer de l'espace
    purgeOldImageEntries();
    
    // Si nous avons un entityId, utiliser des clés spécifiques à cette entité
    const storageKey = entityId ? `${key}_${entityId}` : `${key}_latest`;
    
    // Compresser l'image
    const compressedImage = await compressFunction(image, 0.7);
    
    // Pour des images importantes comme le logo, utiliser le versionnement
    if (key.includes('logo') || key.includes('favicon')) {
      const timestamp = new Date().getTime();
      localStorage.setItem(`${storageKey}_${timestamp}`, compressedImage);
      localStorage.setItem(`${key}_timestamp`, timestamp.toString());
      console.log(`Image versionnée stockée dans ${storageKey}_${timestamp}`);
    }
    
    // Toujours stocker la version standard
    localStorage.setItem(storageKey, compressedImage);
    console.log(`Image convertie et stockée dans ${storageKey}`);
    
    return compressedImage;
  } catch (error) {
    console.error('Erreur lors du stockage de l\'image:', error);
    return '';
  }
};

/**
 * Récupère des images depuis localStorage en respectant l'isolation des entités
 */
export const getImagesFromLocalStorage = (key: string, entityId?: string): string[] => {
  try {
    // Utiliser UNIQUEMENT la clé spécifique à l'entité demandée
    const storageKey = entityId ? `${key}_${entityId}` : `${key}_latest`;
    const imagesStr = localStorage.getItem(storageKey);
    
    if (!imagesStr) {
      console.log(`Aucune image trouvée pour la clé ${storageKey}`);
      return [];
    }
    
    try {
      const images = JSON.parse(imagesStr);
      if (Array.isArray(images)) {
        console.log(`${images.length} images récupérées depuis ${storageKey}`);
        return images;
      } else {
        console.error(`Format invalide pour ${storageKey}, attendu: tableau`);
        return [];
      }
    } catch (e) {
      console.error(`Erreur de parsing pour ${storageKey}:`, e);
      return [];
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des images:', error);
    return [];
  }
};

/**
 * Récupère une image unique depuis localStorage avec isolation par entité
 */
export const getSingleImageFromLocalStorage = (key: string, entityId?: string): string => {
  try {
    // Utiliser UNIQUEMENT la clé spécifique à l'entité demandée
    const storageKey = entityId ? `${key}_${entityId}` : `${key}_latest`;
    
    // Vérifier d'abord s'il existe une version avec timestamp
    const timestamp = localStorage.getItem(`${key}_timestamp`);
    let image;
    
    if (timestamp) {
      image = localStorage.getItem(`${storageKey}_${timestamp}`);
      if (image) {
        console.log(`Image récupérée avec timestamp pour ${storageKey}`);
      }
    }
    
    // Si pas trouvé avec timestamp, utiliser la version standard
    if (!image) {
      image = localStorage.getItem(storageKey);
      if (image) {
        console.log(`Image récupérée depuis la clé standard ${storageKey}`);
      }
    }
    
    if (!image) {
      console.log(`Aucune image trouvée pour ${storageKey}`);
      return '';
    }
    
    // Nettoyer l'image des guillemets si nécessaire
    if (image.startsWith('"') && image.endsWith('"')) {
      return image.substring(1, image.length - 1);
    }
    
    return image;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'image:', error);
    return '';
  }
};

/**
 * Supprime toutes les images temporaires (latest) sans toucher aux images spécifiques
 */
export const clearTemporaryImages = (): void => {
  try {
    localStorage.removeItem('job_images_latest');
    localStorage.removeItem('job_featured_image_latest');
    console.log('Images temporaires supprimées');
  } catch (error) {
    console.error('Erreur lors de la suppression des images temporaires:', error);
  }
};

/**
 * Renomme une clé temporaire en clé définitive avec un ID
 */
export const finalizeTemporaryImages = (key: string, tempKey: string, entityId: string): boolean => {
  try {
    const tempImages = localStorage.getItem(tempKey);
    if (tempImages) {
      localStorage.setItem(`${key}_${entityId}`, tempImages);
      localStorage.removeItem(tempKey);
      console.log(`Images temporaires finalisées pour ${entityId}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erreur lors de la finalisation des images:', error);
    return false;
  }
};
