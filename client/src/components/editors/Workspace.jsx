import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import useEditorStore from "../../utils/editorStore";
import Image from "../image/image";
import html2canvas from "html2canvas";

const Workspace = forwardRef(({ previewImg,     containerRef, isDesigning}, ref) => {
  const {
    setSelectedLayer,
    textOptions,
    setTextOptions,
    canvasOptions,
    setCanvasOptions,
  } = useEditorStore();

  useEffect(() => {
    if (canvasOptions.height === 0) {
      const canvasHeight = (375 * previewImg.height) / previewImg.width;

      setCanvasOptions({
        ...canvasOptions,
        height: canvasHeight,
        orientation: canvasHeight > 375 ? "portrait" : "landscape",
      });
    }
  }, [previewImg, canvasOptions, setCanvasOptions]);

  const itemRef = useRef(null);

  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  useImperativeHandle(ref, () => ({
    async exportAsImage() {
      if (!containerRef.current) return null;
  
      // Hide delete button before capturing
      const deleteBtn = containerRef.current.querySelector(".deleteTextButton");
      if (deleteBtn) {
        deleteBtn.style.display = "none";
      }
  
      const canvas = await html2canvas(containerRef.current);
  
      // Restore delete button after capturing
      if (deleteBtn) {
        deleteBtn.style.display = "";
      }
  
      return canvas.toDataURL("image/png");
    },
  }));
  
  const handleMouseMove = (e) => {
    if (!dragging.current) return;
    setTextOptions({
      ...textOptions,
      left: e.clientX - offset.current.x,
      top: e.clientY - offset.current.y,
    });
  };

  const handleMouseUp = () => {
    dragging.current = false;
  };

  const handleMouseLeave = () => {
    dragging.current = false;
  };

  const handleMouseDown = (e) => {
    setSelectedLayer("text");
    dragging.current = true;
    offset.current = {
      x: e.clientX - textOptions.left,
      y: e.clientY - textOptions.top,
    };
  };

  return (
    <div className="workspace">
      <div
        className="canvas"
        style={{
          height: canvasOptions.height,
          backgroundColor: canvasOptions.backgroundColor,
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        ref={containerRef}
      >
        <img src={previewImg.url} alt="" />
        {!canvasOptions.isCanvasBaked && textOptions.text && (
   
<div
  className="text"
  style={{
    position: "absolute",
    left: textOptions.left,
    top: textOptions.top,
    fontSize: `${textOptions.fontSize}px`,
    fontFamily: "inherit",
    userSelect: isDesigning ? "auto" : "none",
    pointerEvents: isDesigning ? "auto" : "none",
  }}
  onMouseDown={handleMouseDown}
  ref={itemRef}
>
<div
  className="text"
  style={{
    color: textOptions.color,
    lineHeight: "1",
    padding: 0,
    margin: 0,
    border: textOptions.showBorder ? "1px solid red" : "none",
    outline: "none",
    background: "transparent",
    display: "inline-block",
    whiteSpace: "nowrap",
    minWidth: "200px",
  }}
  contentEditable={isDesigning}
  suppressContentEditableWarning={true}
  ref={itemRef}
  onInput={(e) => { /* no setTextOptions */ }}
  onBlur={(e) => {
    const newText = e.currentTarget.textContent;
    setTextOptions((prev) => ({
      ...prev,
      text: newText,
      showBorder: newText.trim() === "",
    }));
  }}
/>
{isDesigning && textOptions.showBorder &&(
  <div
  className="deleteTextButton"

  onClick={(e) => {
    e.stopPropagation();
    setTextOptions({ ...textOptions, text: ""
     });
  }}
>
  <Image path="/general/delete.svg" variant="icon" alt="" />
</div>
)}
  

</div>


  
)}

      </div>
    </div>
  );
});
Workspace.displayName = "Workspace";
export default Workspace;
