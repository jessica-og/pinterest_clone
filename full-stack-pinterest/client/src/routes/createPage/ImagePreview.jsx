import IKImage from "../../components/image/image";

export const ImagePreview = ({ image, textLayers, onEdit, hasEditedImage }) => {
    return (
      <div className="imagePreviewWrapper" style={{ position: "relative" }}>
        <img src={image.url} alt="Preview" style={{ width: "100%" }} />
  
        {!hasEditedImage &&
          Array.isArray(textLayers) &&
          textLayers.map((layer, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${layer.left}px`,
                top: `${layer.top}px`,
                fontSize: `${layer.fontSize}px`,
                color: layer.color,
                pointerEvents: "none",
              }}
            >
              {layer.text}
            </div>
          ))}
  
        <div className="editIcon" onClick={onEdit}>
          <IKImage path="/general/edit.svg" variant="icon"alt="Edit" />
        </div>
      </div>
    );
  };
  