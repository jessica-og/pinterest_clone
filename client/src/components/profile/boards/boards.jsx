import "./boards.css";
import apiRequest from "../../../utils/apiRequest";
import { format } from "timeago.js";
import { Link } from "react-router";
import GalleryItem from "../../galleryItem/galleryItem";
import { useQuery } from "@tanstack/react-query";

const Boards = ({ userId }) => {
  const { isPending, error, data } = useQuery({
    queryKey: ["boards", userId],
    queryFn: () => apiRequest.get(`/boards/${userId}`).then((res) => res.data),
  });

  if (isPending) return "Loading...";

  if (error) return "An error has occurred: " + error.message;

  if (!data || data.length === 0) {
    return <div>No boards yet.</div>; 
  }

  return (
    <div className="gallery">
      {/* COLLECTION */}
      {data?.map((board) => (
        <Link
          to={`/search?boardId=${board._id}`}
          className="collection"
          key={board._id}
          style={{
            gridRowEnd: `span ${Math.ceil(board.firstPin.height / 100)}`
          }}
        >
            <GalleryItem
        item={board.firstPin}
        showOverlayIcons={false}
        showDropdownMenu={false}
      />
          {/* <Image path={board.firstPin.media} alt="" /> */}
          <div className="collectionInfo">
            <h1>{board.title}</h1>
            <span>
              {board.pinCount} Pins · {format(board.createdAt)}
            </span>
          </div>
        </Link>
      ))}     
    </div>
  );
};

export default Boards;
