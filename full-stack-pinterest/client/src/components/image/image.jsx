import { IKImage } from "imagekitio-react";
import React from "react";

const Image = React.forwardRef(({ path, alt = "", className = "", w, h, variant, ...rest }, ref) => {
  const isExternal = path.startsWith("http") || path.startsWith("data:") || path.startsWith("blob:");

  const wrapperStyles = variant === "icon" ? {
    width: `${w}px` ,
    height:  `${h}px`,
    overflow: "hidden",
    display: "flex",  
  } : {
    width: '100%',
    height: '100%',
    overflow: "hidden",
    display: "flex",
  };

  const imageStyles ={
    objectFit: "cover",
    display: "block",
    width: "100%",
    height: "auto", 
  };

  if (isExternal) {
    return (
      <div style={wrapperStyles} ref={ref}>
        <img
          src={path}
          alt={alt}
          loading="lazy"
          style={imageStyles}
          {...rest}
        />
      </div>
    );
  }

  return (
    <div style={wrapperStyles} ref={ref}>
      <IKImage
        urlEndpoint={import.meta.env.VITE_URL_IK_ENDPOINT}
        path={path}
        transformation={[
          {
            height: h,
            width: w,
            crop: "maintain_ratio",
          },
        ]}
        style={imageStyles}
        alt={alt}
        loading="lazy"
        lqip={{ active: true, quality: 20 }}
        className={className}
        {...rest}
      />
    </div>
  );
});

Image.displayName = "Image";
export default Image;
