// import { useState } from "react";

import "./output.css";
import Banner from "./components/banner";
import Nav from "./components/nav/Nav";
import ProgressBar from "./components/progressBar";

function App() {


  // const [completed, setCompleted] = useState(0);
  // setCompleted(50);

  return (
    <div className="flex flex-col text-center bg-[#191b28] h-screen">

      <Banner/>
      <Nav/>
      <ProgressBar completed={50}/>

    </div>
  );
}

export default App;
