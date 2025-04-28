import "./profilePage.css";
import Image from "../../components/image/image";
import { useState } from "react";
import Gallery from "../../components/gallery/gallery";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import apiRequest from "../../utils/apiRequest";
import Boards from "../../components/profile/boards/boards";
import FollowButton from "./FollowButton";
import Saved from "../../components/profile/Saved";

const ProfilePage = () => {
  const [type, setType] = useState("boards");

  const { username } = useParams();

  const { isPending, error, data } = useQuery({
    queryKey: ["profile", username],
    queryFn: () => apiRequest.get(`/users/${username}`).then((res) => res.data),
  });

  if (isPending) return "Loading...";

  if (error) return "An error has occurred: " + error.message;

  if (!data) return "User not found!";

  return (
    <div className="profilePage">
      <Image
        className="profileImg"
        w={100}
        h={100}
        path={data.img || "/general/noAvatar.png"}
        variant='icon'
        alt=""
      />
      <h1 className="profileName">{data.displayName}</h1>
      <span className="profileUsername">@{data.username}</span>
      <div className="followCounts">
        {data.followerCount} followers · {data.followingCount} followings
      </div>
      <div className="profileInteractions">
        <Image path="/general/share.svg" variant="icon" alt="" />
        <div className="profileButtons">
          <button>Message</button>
          <FollowButton
            isFollowing={data.isFollowing}
            username={data.username}
          />
        </div>
        <Image path="/general/more.svg" variant="icon" alt="" />
      </div>
      <div className="profileOptions">
        <span
          onClick={() => setType("created")}
          className={type === "created" ? "active" : ""}
        >
          Created
        </span>
        <span
          onClick={() => setType("saved")}
          className={type === "saved" ? "active" : ""}
        >
          Saved
        </span>
        <span
          onClick={() => setType("boards")}
          className={type === "boards" ? "active" : ""}
        >
          Boards
        </span>
      </div>
      {type === "created" && 
      <Gallery userId={data._id}
      showSaveButton = {false}
       />}
      {type === "saved" && <Saved
       userId={data._id} 
       showSaveButton = {true}
       />}
      {type === "boards" && 
      <Boards userId={data._id}
      showSaveButton = {false}
       />}
    </div>
  );
};

export default ProfilePage;
