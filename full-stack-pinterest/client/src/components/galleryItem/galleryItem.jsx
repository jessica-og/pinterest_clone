import { useRef,  } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../utils/authStore";
import Image from "../image/image";
import "./galleryItem.css";
import apiRequest from "../../utils/apiRequest";
import { toast } from "react-toastify";
import { usePostInteraction } from "../../hooks/usePostInteraction";
import useDropdown from "../../hooks/useDropdown";
import OverlayIcons from "../shared/OverlayIcons";
import SaveButton from "../shared/SaveButton";
import DropdownMenuWrapper from "../shared/DropdownWrapper";
 
const GalleryItem = ({ item,
  showOverlayIcons = true,
  showDropdownMenu = true,
  showSaveButton = true,

 }) => {
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();
  const containerRef = useRef();
  const { interactionQuery, interactionMutation,  handleShare } = usePostInteraction(item._id);
  const { isPending, error, data } = interactionQuery;
  const {dropdownPos, open, closeDropdown, ref: moreBtnRef } = useDropdown();
  if (isPending || error) return null;

  const optimizedHeight = (372 * item.height) / item.width;

  const handleEdit = () => {
    closeDropdown();
    navigate(`/create?edit=${item._id}`);
  };  

  const handleDelete = async () => {
    try {
      await apiRequest.delete(`/pins/${item._id}`);
      toast.success("Pin deleted!. ...reloading");
      setTimeout(() => {
        window.location.reload();
      }, 1500);  
    } catch (err) {
      console.error(err); 
      console.log("Something went wrong");
    }
  };

  const handleOpen = () => {
    closeDropdown();
    navigate(`/pin/${item._id}`);
  };

  const pinUserId = item.user?._id || item.userId;
  const isOwner = currentUser?._id === String(pinUserId);



  return (
    <div
      ref={containerRef}
      className="galleryItem"
      style={{ gridRowEnd: `span ${Math.ceil(item.height / 100)}` }}
      onMouseLeave={closeDropdown}
    >
      <Image path={item.media} alt="" w={372} h={optimizedHeight}/>
     
      <Link to={`/pin/${item._id}`} className="overlay" />
      {showSaveButton && (
        <SaveButton
          isSaved={data?.isSaved}
          isPending={interactionMutation.isPending}
          onClick={() => interactionMutation.mutate({ id: item._id, type: "save" })}
        />
      )}

      {showOverlayIcons && (
        <OverlayIcons
          onShare={() => handleShare(item)}
          onMoreClick={open}
          moreBtnRef={moreBtnRef}
        />
      )}

      {showDropdownMenu && (
        <DropdownMenuWrapper
          dropdownPos={dropdownPos}
          onClose={closeDropdown}
          isOwner={isOwner}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onOpen={handleOpen}
        />
      )}
    </div>
  );
};

export default GalleryItem;
