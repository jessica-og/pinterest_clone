import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import './dropdownPortal.css'


const DropdownMenuPortal = ({ x, y, onClose, children }) => {
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return createPortal(
    <div
      ref={menuRef}
      className="dropdownMenu"
      style={{
        position: "fixed",
        width: "150px",
        left: x,
        top: y,
        zIndex: 999999,
      }}
    >
      {children}
    </div>,
    document.body
  );
};

export default DropdownMenuPortal;
