
import DropdownMenuPortal from "./dropdownPortal/DropdownPortal";

const DropdownMenuWrapper = ({
  dropdownPos,
  onClose,
  isOwner,
  onEdit,
  onDelete,
  onOpen,
}) => {
  if (!dropdownPos) return null;

  return (
    <DropdownMenuPortal x={dropdownPos.x} y={dropdownPos.y} onClose={onClose}>
      {isOwner ? (
        <>
          <div onClick={onEdit}>Edit</div>
          <div onClick={onDelete}>Delete</div>
        </>
      ) : (
        <div onClick={onOpen}>Open</div>
      )}
    </DropdownMenuPortal>
  );
};

export default DropdownMenuWrapper;
