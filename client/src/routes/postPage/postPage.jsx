import "./postPage.css";
import Image from "../../components/image/image";
import PostInteractions from "../../components/postInteractions/postInteractions";
import { Link, useParams } from "react-router";
import Comments from "../../components/comments/comments";
import { useQuery } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";
import { useRef, useState } from "react";

const PostPage = () => {
  const { id } = useParams();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const postDetailsRef = useRef(null);

  const handleToggleDescription = (e) => {
    // Prevent the click from causing a page navigation
    e.preventDefault();
    setShowFullDescription((prev) => !prev);

    // Scroll into view when expanding
    if (!showFullDescription && postDetailsRef.current) {
      postDetailsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };


  const { isPending, error, data } = useQuery({
    queryKey: ["pin", id],
    queryFn: () => apiRequest.get(`/pins/${id}`).then((res) => res.data),
  });

  if (isPending) return "Loading...";

  if (error) return "An error has occurred: " + error.message;

  if (!data) return "Pin not found!";

  console.log(data)

  return (
    <div className="postPage">
    <Link to="/" className="hide">
    <svg
        height="20" 
        viewBox="0 0 24 24"
        width="20"
        style={{ cursor: "pointer" }}
      >
        <path d="M8.41 4.59a2 2 0 1 1 2.83 2.82L8.66 10H21a2 2 0 0 1 0 4H8.66l2.58 2.59a2 2 0 1 1-2.82 2.82L1 12z"></path>
      </svg>
    </Link>
      <div className="postContainer">
        <div className="postImg">
          <Image path={data.media} alt="" w={375} variant='icon'/>
        </div>
        <div className="postDetails" ref={postDetailsRef}>
          <PostInteractions postId={id} userId={data.user._id} />

          <div className="postUser">
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
                <Image
                  path={data.user.img || "/general/noAvatar.png"}
                  variant="icon"
                  w={35}
                  h={35}
                />
                <span>{data.user.displayName}</span>
              </div>

              <div style={{ marginTop: "15px", position: "relative" }}>
                <p 
                  style={{
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: showFullDescription ? "none" : 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {data.description}
                </p>
                <button
                  onClick={handleToggleDescription} 
                  style={{
                    background: "none",
                    border: "none",
                    color: "#eb0729",
                    cursor: "pointer",
                    marginTop: "5px",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  {showFullDescription ? "Show less" : "Show more"}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    style={{
                      transform: showFullDescription ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.3s",
                    }}
                  >
                    <path d="M7 10l5 5 5-5z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <Comments id={data._id}/>
        </div>
      </div>
    </div>
  );
};

export default PostPage;
