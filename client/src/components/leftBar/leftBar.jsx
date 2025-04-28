import Image from "../image/image";
import {Link, useNavigate} from "react-router";
import "./leftBar.css";
import useAuthStore from "../../utils/authStore";

const LeftBar = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();

  const handleCreateClick = () => {
    if (!currentUser) {
      navigate("/auth");
    } else {
      window.location.href = "/create";
    }
  };

  return (
    <div className="leftBar"> 
      <div className="menuIcons">
        <Link to="/" className="menuIcon">
        <div className="logo">M</div>
        </Link>
        <Link to="/" className="menuIcon"> 
          <Image path="/general/home.svg" variant="icon" alt="" />
        </Link>  
        <div onClick={handleCreateClick} className="menuIcon">
          <Image path="/general/create.svg" variant="icon" alt="Create" />
        </div>
        <Link to="/" className="menuIcon">
          <Image path="/general/updates.svg" variant="icon" alt="" />
        </Link>
        <Link to="/" className="menuIcon">
          <Image path="/general/messages.svg" variant="icon" alt="" />
        </Link>
      </div>
      <Link to="/" className="menuIcon">
        <Image path="/general/settings.svg" variant="icon" alt="" />
      </Link>
    </div>
  );
};

export default LeftBar;
