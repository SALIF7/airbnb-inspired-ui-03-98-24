
import { Job } from "@/types/job";
import { isBase64Image, isValidHttpUrl, isBlobUrl } from "./imageValidation";
import { getJobImages, getJobFeaturedImage } from "./imageStorage";

/**
 * Traite les images stockées pour une offre d'emploi avec isolation stricte
 */
export const processStoredImages = (job: Job): Job => {
  if (!job.id) return job;
  
  try {
    // Vérifier si l'image principale existe déjà et est valide
    const hasValidMainImage = job.image && (isBase64Image(job.image) || isValidHttpUrl(job.image));
    
    // Vérifier si les images supplémentaires existent déjà et sont valides
    const hasValidImages = job.images && 
                          Array.isArray(job.images) && 
                          job.images.length > 0 && 
                          job.images.every(img => isBase64Image(img) || isValidHttpUrl(img));
    
    // Si l'offre a déjà des images valides, ne rien faire
    if (hasValidMainImage && hasValidImages) {
      console.log(`L'offre ${job.id} a déjà des images valides, aucune récupération nécessaire`);
      return job;
    }
    
    // Récupérer les images depuis localStorage UNIQUEMENT pour ce job spécifique
    // Ne plus jamais mélanger avec les images "latest" ou d'autres jobs
    const savedImages = getJobImages(job.id);
    
    if (savedImages.length > 0) {
      console.log(`${savedImages.length} images récupérées depuis localStorage pour l'offre ${job.id}`);
      job.images = savedImages;
      
      // Définir l'image principale si nécessaire
      if (!job.image) {
        // Récupérer l'image principale ou utiliser la première image
        const featuredImage = getJobFeaturedImage(job.id);
        job.image = featuredImage || savedImages[0];
        console.log(`Image principale définie pour l'offre ${job.id}`);
      }
    }
    
    // S'assurer que nous n'avons pas de blob URLs (qui ne persisteront pas)
    if (job.image && isBlobUrl(job.image)) {
      console.warn(`Image principale en format blob trouvée pour l'offre ${job.id}, remplacement par défaut`);
      job.image = "https://source.unsplash.com/random/800x600/?work";
    }
    
    if (job.images) {
      const hasBlobs = job.images.some(img => isBlobUrl(img));
      if (hasBlobs) {
        console.warn(`Images blob trouvées pour l'offre ${job.id}, filtrage`);
        job.images = job.images.filter(img => !isBlobUrl(img));
        if (job.images.length === 0) {
          job.images = ["https://source.unsplash.com/random/800x600/?work"];
        }
      }
    }
    
  } catch (error) {
    console.error(`Erreur lors de la récupération des images de l'offre ${job.id}:`, error);
  }
  
  return job;
};
