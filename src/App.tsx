// import { useState } from "react";

import "./output.css";
import Banner from "./components/banner";
import Nav from "./components/nav/Nav";
import PlayButton from "./components/playButton";
import SettingsModal from "./components/settingsModal";
import StatusFrame from "./components/statusFrame";
import Spinner from "./components/Spinner";
import { LoadingProvider } from "./contexts/Loading";
import '@fortawesome/fontawesome-free/css/all.min.css';



function App() {

  return (
    <div className="flex flex-col text-center bg-[#191b28] h-screen w-full">
      <LoadingProvider>
        <Banner />
        <Nav />
        <PlayButton />
        <SettingsModal />
        <Spinner />
        <StatusFrame />
      </LoadingProvider>

    </div>
  );
}

export default App;
