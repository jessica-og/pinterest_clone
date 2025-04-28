

import { useQuery } from "@tanstack/react-query";
import apiRequest from "../../../utils/apiRequest";
import { format } from "timeago.js";
import GalleryItem from "../../galleryItem/galleryItem";

const Created = ({ userId }) => {
  const { isPending, error, data } = useQuery({
    queryKey: ["savedPins", userId],
    queryFn: () => apiRequest.get(`/save/${userId}`).then((res) => res.data),
  });
  
  if (isPending) return "Loading...";
  if (error) return "An error occurred: " + error.message;

  return (
    <div className="gallery">
    {data?.filter((save) => save.pin).map((save) => (
     <div key={save._id} className="galleryItemWrapper" style={{
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

export default Created;
