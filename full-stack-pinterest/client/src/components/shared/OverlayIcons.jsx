
import Image from "../image/image";

const OverlayIcons = ({ onShare, onMoreClick, moreBtnRef }) => {
  return (
    <div className="overlayIcons">
      <button onClick={onShare}>
        <Image path="/general/share.svg" variant="icon" alt="Share" />
      </button>
      <button ref={moreBtnRef} onClick={onMoreClick}>
        <Image path="/general/more.svg" variant="icon" alt="More options" />
      </button>
    </div>
  );
};

export default OverlayIcons;
