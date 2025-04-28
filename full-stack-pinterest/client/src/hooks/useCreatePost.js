
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import apiRequest from "../utils/apiRequest";
import useEditorStore from "../utils/editorStore";
import useAuthStore from "../utils/authStore";

const addPost = async (post) => {
  const res = await apiRequest.post("/pins", post);
  return res.data;
};

const updatePost = async ({ id, post }) => {
  const res = await apiRequest.put(`/pins/${id}`, post);
  return res.data;
};  

export const useCreatePost = () => {
  const [searchParams] = useSearchParams();  
  const editId = searchParams.get("edit");
  const isEditMode = !!editId;
  const { currentUser } = useAuthStore(); 
  const navigate = useNavigate();
 // const formRef = useRef();

   const workspaceRef = useRef();
   const containerRef = useRef(null);
  const { textOptions, canvasOptions,  setSelectedLayer,
    selectedLayer, resetStore } = useEditorStore();

  const [isDesigning, setIsDesigning] = useState(false);
  const [newBoard, setNewBoard] = useState("");
  const [isNewBoardOpen, setIsNewBoardOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [tags, setTags] = useState("");
  const [boardId, setBoardId] = useState("");
  const [file, setFile] = useState(null);
  const [originalImg, setOriginalImg] = useState(null);
  const [previewImg, setPreviewImg] = useState({ url: "", width: 0, height: 0 });
  
  
  const boardsQuery = useQuery({
    queryKey: ["formBoards", currentUser._id],
    queryFn: () =>
      apiRequest.get(`/boards/${currentUser._id}`).then((res) => res.data),
  });

  const pinQuery = useQuery({
    queryKey: ["editPin", editId],
    queryFn: () => apiRequest.get(`/pins/${editId}`).then((res) => res.data),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (pinQuery.data && !file && !removeExistingImage) {
      const { title, description, link, tags, boardId, media, width, height } = pinQuery.data;
  
      setTitle(title || "");
      setDescription(description || "");
      setLink(link || "");
      setTags(tags?.join(", ") || "");
      setBoardId(boardId || "");

     const imgUrl = media.startsWith("http")
     ? media
     : `${import.meta.env.VITE_URL_IK_ENDPOINT}/${media}`;

      const imgData = {
        url: imgUrl,
        width,
        height,
      };
  
      setPreviewImg(imgData);
      setOriginalImg(imgData); 
    }
  }, [file, pinQuery.data, removeExistingImage]);
 


  const mutation = useMutation({
    mutationFn: isEditMode
      ? ({ id, post }) => updatePost({ id, post })
      : (post) => addPost(post),
    onMutate: () => setIsSubmitting(true),
    onSuccess: (data) => {
      resetStore();
      toast.success(isEditMode ? "Post updated!" : "Post created!");
      setTimeout(() => {
        navigate(`/pin/${data._id}`);
        window.location.reload(); 
      }, 300);
    },
    onError: (err) => {
      setIsSubmitting(false);
      console.error("Error in mutation:", err.response);
      toast.error("Something went wrong.");
    },
    onSettled: () => setIsSubmitting(false),
  });


  const handleSubmit = async () => {
    let canvasExported = false;
  
    if (isDesigning) {
    const imgDataUrl = await workspaceRef.current.exportAsImage();
    if (imgDataUrl) {
      setPreviewImg({
         url: imgDataUrl, 
         width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
         });

      //  setPreviewImg({ url: imgDataUrl, width: 375, height: canvasOptions.height }); 
    }
    setIsDesigning(false);

    return;
  }
  
  if (!title.trim() || !description.trim() || (!file && !previewImg.url)) {
    toast.error("Please fill in all required fields.");
    return;
  }

  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  formData.append("link", link);
  formData.append("tags", tags);
  formData.append("board", boardId);


    if (file) {
      formData.append("media", file);
      formData.append("width", previewImg.width);
      formData.append("height", previewImg.height);
    }
  
    if (!canvasExported) {
      // only append textOptions if text is NOT baked into image
      formData.append("textOptions", JSON.stringify(textOptions));
    }
  
    formData.append("canvasOptions", JSON.stringify(canvasOptions));
    formData.append("newBoard", newBoard);
    formData.append("removeExistingImage", removeExistingImage.toString());
  
    if (isEditMode) {
      mutation.mutate({ id: editId, post: formData });
    } else {
      mutation.mutate(formData);
    }

    
  };
  
  // const handleNewBoard = () => {
  //   setIsNewBoardOpen((prev) => !prev);
  //   if (isNewBoardOpen) {
  //     setNewBoard("");
  //   }
  // }

  return {
   // formRef,
    title,
    setTitle,
    description,
    setDescription,
    link,
    setLink,
    tags,
    setTags,
    boardId,
    setBoardId,
    file,
    setFile,
    previewImg,
    isDesigning,
    setIsDesigning, 
    setPreviewImg,
    newBoard,
    setNewBoard,
    isEditMode,
    isNewBoardOpen,
    setIsNewBoardOpen,
    isSubmitting,
    handleSubmit,
    handleNewBoard: () => setIsNewBoardOpen((prev) => !prev),
    boardsQuery,
    setRemoveExistingImage,
    setSelectedLayer,
    selectedLayer,
    workspaceRef, 
    containerRef,
    originalImg,   
     setOriginalImg
  };
};
