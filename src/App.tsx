// import { useState } from "react";

import "./output.css";
import "./App.css";
import Banner from "./components/banner";
import Nav from "./components/nav/Nav";
import PlayButton from "./components/playButton";
import { LoadingProvider } from "./contexts/Loading";
import '@fortawesome/fontawesome-free/css/all.min.css';
import TopBar from "./components/TopBar";



function App() {

  return (
    <div className="bg-[#191b28]">
      <div className="border-0 bg-cover bg-no-repeat bg-window_frame z-[9999]">
        <div className="flex flex-col text-center h-screen w-full border-0 px-[0.18rem]">
          <TopBar />
          <LoadingProvider>
            <Banner />
            <Nav />
            <PlayButton />
          </LoadingProvider>
        </div>
      </div>
    </div>
  );
}

export default App;
