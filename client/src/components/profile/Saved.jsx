

import { useQuery } from "@tanstack/react-query";
import { format } from "timeago.js";
import apiRequest from "../../utils/apiRequest";
import GalleryItem from "../galleryItem/galleryItem";

const Saved = ({ userId }) => {
  const { isPending, error, data } = useQuery({
    queryKey: ["savedPins", userId],
    queryFn: () => apiRequest.get(`/save/${userId}`).then((res) => res.data),
  });
  
  if (isPending) return "Loading...";
  if (error) return "An error occurred: " + error.message;

  return (
    <div className="gallery">
    {data?.filter((save) => save.pin).map((save) => (
     <div key={save._id} style={{
      gridRowEnd: `span ${Math.ceil(save.pin.height / 100)}`
    }}>
      <GalleryItem
        item={save.pin}
        showOverlayIcons={false}
        showDropdownMenu={false}
      />
      <div className="collectionInfo">
        <h1>{save.pin.title}</h1>
        <span>{format(save.pin.createdAt)}</span>
      </div>
    </div>
    
    ))}
  </div>
  );
};

export default Saved;
