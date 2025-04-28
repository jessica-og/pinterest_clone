import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiRequest from "../utils/apiRequest";
import { toast } from "react-toastify";


export const usePostInteraction = (postId) => {
    const queryClient = useQueryClient();
  
    const interactionQuery = useQuery({
      queryKey: ["interactionCheck", postId],
      queryFn: () =>
        apiRequest.get(`/pins/interaction-check/${postId}`).then((res) => res.data),
      onError: () => {
        toast.error("Failed to check interaction status");
      },
    });
  
    const interactionMutation = useMutation({
      mutationFn: ({ id, type }) =>
        apiRequest.post(`/pins/interact/${id}`, { type }).then((res) => res.data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["interactionCheck", postId] });
  
        if (variables.type === "like") {
          toast.success("Like toggled successfully");
        }
  
        if (variables.type === "save") {
          const prevData = queryClient.getQueryData(["interactionCheck", postId]);
          const wasSaved = prevData?.isSaved;
          toast.success(wasSaved ? "Pin removed from saved" : "Pin saved");
        }
      },
      onError: (err) => {
        if (err.response?.status === 401) {
          toast.info("Please log in to interact with pins.");
        } else {
          toast.error("Failed to update interaction.");
        }
      },
    });
  
    const handleShare = async (item) => {
      try {
        const imageUrl = `${import.meta.env.VITE_API_ENDPOINT}/${item.media}`;
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], "pin.jpg", { type: blob.type });
    
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: item.title || "Check out this pin!",
            text: item.description || "",
            files: [file],
          });
          //toast.success("Image shared!");
        } else {
          throw new Error("Sharing image is not supported on this device.");
        }
      } catch (error) {
        console.error(error);
        toast.error("Image sharing not supported. Link copied instead.");
        const fallbackUrl = `${window.location.origin}/pin/${item._id}`;
        await navigator.clipboard.writeText(fallbackUrl);
      }
    };
    

    return {
      interactionQuery,
      interactionMutation,
      handleShare
    };
  };