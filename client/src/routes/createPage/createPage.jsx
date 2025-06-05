import "./createPage.css";
import IKImage from "../../components/image/image";
import BoardForm from "./BoardForm";
import { useCreatePost } from "../../hooks/useCreatePost";
import { TfiReload } from "react-icons/tfi";
import Editor from "../../components/editors/editor";


const CreatePage = () => {
  const {
    title,
    setTitle,
    description,
    setDescription,
    link,
    setLink,
    tags,
    setTags,
    boardId,
    setBoardId,
    file,
    setFile,
    previewImg,
    isDesigning,
    setIsDesigning,
    newBoard,
    setNewBoard,
    isEditMode,
    isNewBoardOpen,
    setIsNewBoardOpen,
    setPreviewImg,
    isSubmitting,
    handleSubmit,
    handleNewBoard,
    boardsQuery,
    setRemoveExistingImage,
    workspaceRef,
    originalImg,
     setOriginalImg,
     containerRef
  } = useCreatePost();
  const { data, isPending } = boardsQuery;
 

  return (
    <div className="createPage">
      <div className="createTop">
        <h1>{isDesigning ? "Design your Pin" : "Create Pin"}</h1>
        <button
          onClick={ handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : isDesigning ? "Done" : "Publish"}
        </button>
      </div>
      {isDesigning ? (
        <Editor
        workspaceRef={workspaceRef}
          previewImg={previewImg}
          isDesigning={isDesigning}
          setIsDesigning={setIsDesigning}
          containerRef={containerRef}
        />
      ) : (
        <div className="createBottom">
          <div className="createBottom">
            {previewImg.url && previewImg.width && previewImg.height ? (
              <div className="preview" >
                <img src={previewImg.url} alt="" />
             {!isEditMode && (
                 <div className="editIcon" 
                 onClick={() => {
                  if (originalImg) {
                     setPreviewImg(originalImg);
                  }
                  setIsDesigning(true);  
                }}
             // onClick={() => setIsDesigning(true)}
              >
                <IKImage path="/general/edit.svg" variant="icon"alt="Edit Icon" />
              </div>
             )}

                <div className="imageActions">
                  <label htmlFor="file" className="changeImageBtn">
                    <i className="iconStyle">
                      <TfiReload />
                    </i>{" "}
                    Change Image
                  </label>
                </div>
              </div>
            ) : (
              <>
                <label htmlFor="file" className="upload">
                  <div className="uploadTitle">
                    <IKImage path="/general/upload.svg" variant="icon" alt="Upload Icon" />
                    <span>Choose a file <span style={{ color: "red", marginLeft: '5px' }}>*</span>

                    </span>
                  </div>
                  <div className="uploadInfo">
                    We recommend using high quality .jpg files less than 20 MB
                    or .mp4 files less than 200 MB.
                  </div>
                </label>
              </>
            )}

            {/* ✅ Always mounted file input */}
            <input
              type="file"
              id="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const selectedFile = e.target.files[0];
                if (selectedFile) {
                  setFile(selectedFile);
                  setRemoveExistingImage(true);
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const img = new window.Image();
                    img.onload = () => {
                      const imgData = {
                        url: event.target.result,
                        width: img.width,
                        height: img.height,
                      };
                      setPreviewImg(imgData);
                      setOriginalImg(imgData);
                    };
                    img.src = event.target.result;
                  };
                  reader.readAsDataURL(selectedFile);
                }
              }}
            />
          </div>

          <form className="createForm">
            <div className="createFormItem">
              <label htmlFor="title">Title
              <span style={{ color: "red", marginLeft: '5px' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Add a title"
                value={title}
                id="title"
                onChange={(e) => setTitle(e.target.value)} 
                required  
              />
            </div>
            <div className="createFormItem">
              <label htmlFor="description">Description
              <span style={{ color: "red", marginLeft: '5px' }}>*</span>
              </label>
              <textarea
                rows={6}
                type="text"
                placeholder="Add a detailed description"
                value={description}
                id="description"
                required
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="createFormItem">
              <label htmlFor="link">Link</label>
              <input
                type="text"
                placeholder="Add a link"
                value={link}
                id="link"
                onChange={(e) => setLink(e.target.value)}
              />
            </div>

            {/* FIXED: SELECT OR ADD BOARD */}
            {!isPending  && (
  <div className="createFormItem">
    <label htmlFor="board">Board</label>
    <select value={boardId} onChange={(e) => setBoardId(e.target.value)} id="board">
      <option value="">Choose a board</option>
      {data.map((board) => (
        <option value={board._id} key={board._id}>
          {board.title}
        </option>
      ))}
    </select>
    <div className="newBoard">
      {newBoard && (
        <div className="newBoardContainer">
          <div className="newBoardItem">{newBoard}</div>
        </div>
      )}
      <div className="createBoardButton" onClick={handleNewBoard}>
        {isNewBoardOpen ? "Cancel New Board" : "Add New Board"}
      </div>
    </div>
  </div>
)}

            <div className="createFormItem ">
              <label htmlFor="tags">Tagged topics</label>
              <input type="text" placeholder="Add tags" 
              value={tags} onChange={(e) => setTags(e.target.value)} 
              id="tags" />
              <small>Don&apos;t worry, people won&apos;t see your tags</small>
            </div>
          </form>
          {isNewBoardOpen && (
            <BoardForm
              setIsNewBoardOpen={setIsNewBoardOpen}
              setNewBoard={setNewBoard}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CreatePage;
