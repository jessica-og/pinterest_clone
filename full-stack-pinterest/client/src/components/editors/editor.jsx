
import "./editor.css";
import Layers from "./Layers";
import Options from "./Options";
import Workspace from "./Workspace";

const Editor = ({ previewImg,     containerRef, workspaceRef, setIsDesigning, isDesigning}) => {
  return (
    <div className="editor"  >
      <Layers 
      previewImg={previewImg} 
      setIsDesigning={setIsDesigning}
      />
      <Workspace ref={workspaceRef}
       previewImg={previewImg}  
       isDesigning={isDesigning}   
       containerRef={containerRef}
       />
      <Options previewImg={previewImg} />
    </div>
  );
}; 
export default Editor;
