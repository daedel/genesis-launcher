// import { useState } from "react";

import "./output.css";
import "./App.css";
import Banner from "./components/banner";
import Nav from "./components/nav/Nav";
import PlayButton from "./components/playButton";
import { LoadingProvider } from "./contexts/Loading";
import '@fortawesome/fontawesome-free/css/all.min.css';
import TopBar from "./components/TopBar";
import { appWindow, LogicalSize } from '@tauri-apps/api/window';
import { useEffect, useRef, useState } from 'react';



function App() {
  const divRef = useRef(null);
  const [width, setWidth] = useState(0); // Stan do przechowywania szerokości
  const [height, setHeight] = useState(0); // Stan do przechowywania szerokości


  useEffect(() => {
    if (divRef.current) {
      const element = divRef.current as HTMLDivElement;
      setWidth(element.offsetWidth);
      setHeight(element.offsetHeight);
    }
    
    // Funkcja obsługująca zmianę skali (DPI)
    const handleScaleChange = async (width: number, height: number) => {
      // Zmiana rozmiaru okna na 715x505 po zmianie skali
      console.log('Zmieniam rozmiar na width: ', width, ' height: ', height);
      await appWindow.setSize(new LogicalSize(width,  height ));
    };

    const fixWindowSize = async () => {
      console.log('Sprawdzam rozmiar diva');
      const currentSize = await appWindow.innerSize();
      console.log('currentSize: ', currentSize);
      console.log('width: ',width, ' height: ', height);

      const w_diff = currentSize.width - width;
      const h_diff = currentSize.height - height;
      if (w_diff > 0 && width > 0 || h_diff > 0 && height > 0) {
        await handleScaleChange(currentSize.width + w_diff, currentSize.height + h_diff);
      }
    }
    fixWindowSize();
    // Nasłuchiwanie na zdarzenie zmiany skali
    // const unlisten = appWindow.onScaleChanged(({ payload }) => {
    //   console.log('Skala zmieniona na: ', payload);
    //   handleScaleChange();
    // });

    // Czyszczenie event listenera po odmontowaniu komponentu
    return () => {
    };
  }, []);

  appWindow.setSize(new LogicalSize(715, 505)).then(() => {
    console.log('resized!');
  });
  // appWindow.scaleFactor().then((factor) => {
  // console.log(`Skalowanie DPI: ${factor}`);
  // appWindow.setSize(new PhysicalSize(800 * factor, 600 * factor));
  return (
    <div ref={divRef} className="bg-[#191b28] w-screen h-screen">
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
