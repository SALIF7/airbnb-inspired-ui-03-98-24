
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Listing } from "@/types/listing";
import { toast } from "sonner";
import { loadListings, saveListings } from "../../useListingStorage";
import { normalizeListing } from "@/utils/listingUtils";

/**
 * Hook for adding a new listing
 */
export const useAddListing = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newListing: Omit<Listing, "id">) => {
      const currentListings = loadListings();
      const id = Math.random().toString(36).substr(2, 9);
      
      const listing = normalizeListing({
        ...newListing,
        id,
        rating: 0,
        dates: new Date().toLocaleDateString(),
        host: newListing.host || { name: "Hôte", image: "/placeholder.svg" }
      });
      
      if (listing.images && listing.images.length > 0 && !listing.image) {
        listing.image = listing.images[0];
      }
      
      currentListings.push(listing);
      saveListings(currentListings);
      console.log("Nouveau listing ajouté:", listing);
      return listing;
    },
    onSuccess: (newListing) => {
      queryClient.setQueryData(["listings"], (old: Listing[] = []) => [...old, newListing]);
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      toast.success("Logement ajouté avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de l'ajout du logement");
    },
  });
};

/**
 * Hook for updating an existing listing
 */
export const useUpdateListing = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updatedListing: Listing) => {
      const currentListings = loadListings();
      const index = currentListings.findIndex(listing => listing.id === updatedListing.id);
      
      if (index !== -1) {
        const normalizedListing = normalizeListing(updatedListing);
        currentListings[index] = normalizedListing;
        saveListings(currentListings);
        console.log("Listing mis à jour:", normalizedListing);
        return normalizedListing;
      }
      return updatedListing;
    },
    onSuccess: (updatedListing) => {
      queryClient.setQueryData(["listings"], (old: Listing[] = []) =>
        old.map((listing) =>
          listing.id === updatedListing.id ? updatedListing : listing
        )
      );
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      toast.success("Logement mis à jour avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour du logement");
    },
  });
};

/**
 * Hook for deleting a listing
 */
export const useDeleteListing = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (listingId: string) => {
      const currentListings = loadListings();
      const index = currentListings.findIndex(listing => listing.id === listingId);
      if (index !== -1) {
        currentListings.splice(index, 1);
        saveListings(currentListings);
        console.log("Listing supprimé:", listingId);
      }
      return listingId;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData(["listings"], (old: Listing[] = []) =>
        old.filter((listing) => listing.id !== deletedId)
      );
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      toast.success("Logement supprimé avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression du logement");
    },
  });
};

