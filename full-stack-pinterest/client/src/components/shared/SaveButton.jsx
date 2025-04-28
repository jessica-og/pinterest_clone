

const SaveButton = ({ isSaved, isPending, onClick }) => {
  return (
    <button className="saveButton" disabled={isPending} onClick={onClick}>
      {isSaved ? "Saved" : "Save"}
    </button>
  );
};

export default SaveButton;
