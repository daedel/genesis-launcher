// import { useState } from "react";

import "./output.css";
import Banner from "./components/banner";
import Nav from "./components/nav/Nav";
import PlayButton from "./components/playButton";
import SettingsModal from "./components/settingsModal";
import StatusFrame from "./components/statusFrame";



function App() {

  return (
    <div className="flex flex-col text-center bg-[#191b28] h-screen w-full">

      <Banner/>
      <Nav/>
      <PlayButton />
      {/* <ProgressBar completed={completed} status={status}/> */}
      <SettingsModal />
      <StatusFrame />
    </div>
  );
}

export default App;
