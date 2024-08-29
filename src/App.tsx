// import { useState } from "react";

import "./output.css";
import Banner from "./components/banner";
import Nav from "./components/nav/Nav";
import ProgressBar from "./components/progressBar";
import PlayButton from "./components/playButton";
import { useState } from "react";



function App() {


  const [completed, setCompleted] = useState(0);
  const [status, setStatus] = useState("");

  return (
    <div className="flex flex-col text-center bg-[#191b28] h-screen w-full">

      <Banner/>
      <Nav/>
      <PlayButton updateProgress={setCompleted} updateStatus={setStatus}/>
      <ProgressBar completed={completed} status={status}/>

    </div>
  );
}

export default App;
