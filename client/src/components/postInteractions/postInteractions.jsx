import { useNavigate } from "react-router";
import { usePostInteraction } from "../../hooks/usePostInteraction";
import apiRequest from "../../utils/apiRequest";
import useAuthStore from "../../utils/authStore";
import { toast } from "react-toastify";
import DropdownMenuWrapper from "../shared/DropdownWrapper";
import useDropdown from "../../hooks/useDropdown";
import Image from "../image/image";
import "./postInteractions.css";

const PostInteractions = ({ postId, userId  }) => {
  const { interactionQuery, interactionMutation, handleShare } = usePostInteraction(postId);
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();

  const { dropdownPos, open, closeDropdown, ref: moreBtnRef } = useDropdown();

  const { isPending, error, data } = interactionQuery;

  if (isPending || error) return null;

  const isOwner = String(currentUser?._id) === String(userId);

  const handleDelete = async () => {
    try {
      await apiRequest.delete(`/pins/${postId}`);
      toast.success("Post deleted! Redirecting...");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete post.");
    }
  };

  const handleEdit = () => {
    closeDropdown();
    navigate(`/create?edit=${postId}`);
  };

  
  const handleOpen = () => {
    closeDropdown();
    console.log("Open clicked");
    navigate(`/pin/${postId}`);
  };

  return (
    <div className="postInteractions" onMouseLeave={closeDropdown}>
      <div className="interactionIcons">
        {/* Like Icon */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          onClick={() =>
            interactionMutation.mutate({ id: postId, type: "like" })
          }
        >
          <path
            d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z"
            stroke={data.isLiked ? "#e50829" : "#000000"}
            strokeWidth="2"
            fill={data.isLiked ? "#e50829" : "none"}
          />
        </svg>
        {data.likeCount}

        {/* Share Icon */}
        <Image
          path="/general/share.svg"
          alt="Share"
          variant="icon"
          className="icon"
          onClick={() => handleShare(data)}
          style={{ cursor: "pointer" }}
        />

        {/* More / Dropdown Menu Icon */}
        {currentUser && isOwner && (
  <Image
    ref={moreBtnRef}
    path="/general/more.svg"
    variant="icon"
    alt="More"
    className="icon"
    onClick={open}
    style={{ cursor: "pointer" }}
  />
)}
      </div>

      {/* Save Button */}
      <button
        disabled={interactionMutation.isPending}
        onClick={() =>
          interactionMutation.mutate({ id: postId, type: "save" })
        }
      >
        {data.isSaved ? "Saved" : "Save"}
      </button>

      {/* Dropdown Menu */}
      {isOwner && open && (
  <DropdownMenuWrapper
    dropdownPos={dropdownPos}
    onClose={closeDropdown}
    isOwner={true}
    onEdit={handleEdit}
    onDelete={handleDelete}
    onOpen={handleOpen}
  />
)}

    </div>
  );
};

export default PostInteractions;