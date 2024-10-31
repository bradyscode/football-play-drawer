// pages/index.tsx
import type { NextPage } from "next";
import PlayDrawingCanvas from "./Components/PlayDrawingCanvas";

const Home: NextPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">Football Play Drawer</h1>
      <PlayDrawingCanvas />
    </div>
  );
};

export default Home;
