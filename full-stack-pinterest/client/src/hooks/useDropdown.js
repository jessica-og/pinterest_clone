import { useState, useEffect, useRef } from "react";

const useDropdown = () => {
  const [dropdownPos, setDropdownPos] = useState(null);
  const ref = useRef();
  
  const open = (e) => {
    e.stopPropagation();
    const rect = ref.current.getBoundingClientRect();
    setDropdownPos({ x: rect.right - 160, y: rect.bottom + 8 });
  };

  const closeDropdown = () => setDropdownPos(null);

  useEffect(() => {
    const handleScroll = () => closeDropdown();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { dropdownPos, open, closeDropdown,  ref };
};

export default useDropdown;
