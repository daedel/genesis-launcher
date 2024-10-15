// import { useState } from "react";

import "./output.css";
import "./App.css";
import Banner from "./components/banner";
import Nav from "./components/nav/Nav";
import PlayButton from "./components/playButton";
import { LoadingProvider } from "./contexts/Loading";
import '@fortawesome/fontawesome-free/css/all.min.css';
import TopBar from "./components/TopBar";
// import { appWindow, LogicalSize } from '@tauri-apps/api/window';
// import { useEffect } from 'react';



function App() {

  // const handleScaleChange = async (width: number, height: number) => {
  //   // Zmiana rozmiaru okna na 715x505 po zmianie skali
  //   console.log('Zmieniam rozmiar na width: ', width, ' height: ', height);
  //   await appWindow.setSize(new LogicalSize(width, height));
  // };

  // const setCorrectWindowSize = async () => {
  //   const appContainer = document.getElementById('main-div');
  //   if (!appContainer) {
  //     return;
  //   }
  //   let dimensions = appContainer.getBoundingClientRect();
  //   let width = dimensions.width;
  //   let height = dimensions.height;

  //   const scaleFactor = await appWindow.scaleFactor();
  //   const currentSize = (await appWindow.innerSize()).toLogical(scaleFactor);
  //   console.log('current_size: ', currentSize);
  //   const w_diff = currentSize.width - width;
  //   const h_diff = currentSize.height - height;
  //   if (w_diff > 0 && width > 0 || h_diff > 0 && height > 0) {
  //     await handleScaleChange(currentSize.width + w_diff + 5, currentSize.height + h_diff - 10);
  //   }    
  // };
    // Function handling scale change (DPI)

    // useEffect(() => {

    //   setCorrectWindowSize();

    //   // Czyszczenie event listenera po odmontowaniu komponentu
    //   return () => {
    //   };
    // }, []);

    // appWindow.scaleFactor().then((factor) => {
    // console.log(`Skalowanie DPI: ${factor}`);
    // appWindow.setSize(new PhysicalSize(800 * factor, 600 * factor));
    return (
      <div id="main-div" className="bg-[#191b28] w-screen h-screen">
        {/* <div className="border-0 bg-contain bg-no-repeat bg-window_frame z-[9999] w-full"> */}
        <div className="flex flex-col text-center h-screen w-full">
          <TopBar />
          <LoadingProvider>
            <Banner />
            <Nav />
            <PlayButton />
          </LoadingProvider>
        </div>
      </div>
      // </div>
    );
  }

  export default App;
