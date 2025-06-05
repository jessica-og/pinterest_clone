import { create } from "zustand";

const useEditorStore = create((set) => ({
  selectedLayer: "canvas",
  textOptions: {
    text: "",
    fontSize: 48,
    color: "#000000",
    top: 48,
    left: 0,
  },
  canvasOptions: {
    height: 0,
    orientation: "",
    size: "original",
    backgroundColor: "#008080",
  },
  setSelectedLayer: (newLayer) => set({ selectedLayer: newLayer }),
 setTextOptions: (updater) =>
  set((state) => ({
    textOptions:
      typeof updater === "function" ? updater(state.textOptions) : updater,
  })),

  // setTextOptions: (newOptions) => set({ textOptions: newOptions }),
  addText: () =>
    set({
      textOptions: {
        text: "",
        fontSize: 48,
        color: "#000000",
        top: 48,
        left: 0,
      },
    }),
    setCanvasOptions: (updater) =>
      set((state) => ({
          canvasOptions:
          typeof updater === "function" ? updater(state.canvasOptions) : updater,
      })),
  //setCanvasOptions: (newOption) => set({ canvasOptions: newOption }),
  // FIXED: ADD RESET FUNCTION
  resetStore: () =>
    set({
      selectedLayer: "canvas",
      textOptions: {
        text: "",
        fontSize: 48,
        color: "#000000",
        top: 48,
        left: 0,
      },
      canvasOptions: {
        height: 0,
        orientation: "",
        size: "original",
        backgroundColor: "#008080",
      },
    }),  
}));

export default useEditorStore;
