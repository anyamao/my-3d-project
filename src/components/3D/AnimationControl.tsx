import React from "react";
import { Search, Sun, Wind, CloudRain, Droplet } from "lucide-react";

interface AnimationControlsProps {
  onPlayToFrame50: () => void;
  onPlayFromFrame50ToEnd: () => void;
  canPlayToFrame50: boolean;
  canPlayFromFrame50ToEnd: boolean;
  currentFrame: number;
  isAnimationComplete: boolean;
  isAnimationPlaying: boolean;
}

const AnimationControls: React.FC<AnimationControlsProps> = ({
  onPlayToFrame50,
  onPlayFromFrame50ToEnd,
  canPlayToFrame50,
  canPlayFromFrame50ToEnd,
  currentFrame,
  isAnimationComplete,
  isAnimationPlaying,
}) => {
  return (
    <div className="relative top-0 mt-[-30px]  ml-[20px] flex  z-10 ">
      <a
        className="text-[14px] fixed text-white z-30 top-0 right-0 mt-[20px] mr-[40px]"
        href="https://t.me/anyamaoo"
      >
        anyamao's weather app
      </a>

      <img
        alt="Dashboard"
        src="./Dashboard_w_shadow.png"
        className="w-[560px] fixed top-0 mt-[-30px]  ml-[-40px] flex  z-10 "
      ></img>
      <div className=" fixed top-0 mt-[155px]  ml-[95px] w-[280px] flex  flex-col z-20 ">
        <div className="w-full h-[40px] flex  items-center shadow-md rounded-full p-[10px] mt-[5px]">
          <Search className="text-lime-700 mr-[10px] w-[20px]"></Search>
          <input
            type="text"
            placeholder="Type your city here..."
            className="outline-none bg-transparent text-[13px] text-gray-600"
          ></input>
        </div>
        <div className="w-full flex  mt-[15px] justify-between border-b-[1px] border-b-gray-300  p-[10px] pb-[20px]">
          <div className="flex flex-col">
            <div className="text-[30px]">London</div>

            <div className="text-gray-600 text-[30px] mt-[-10px]"> 15°C</div>
            <div className="text-gray-500 text-[15px]">Sunny</div>
          </div>
          <Sun className="text-yellow-400 w-[100px] h-[100px] mr-[10px]"></Sun>
        </div>
        <div className="flex flex-row justify-between mt-[25px] px-[5px]  pb-[30px]  border-b-[1px] border-b-gray-300 ">
          <div className="flex flex-col items-start">
            <div className="text-[14px] text-gray-500">Wind Speed</div>
            <Wind className="w-[40px] h-[40px] text-lime-600 "></Wind>
            <div className="text-[20px]">12 m/s</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-[14px] text-gray-500">Humidity</div>
            <Droplet className="w-[40px] h-[40px] text-lime-600 "></Droplet>
            <div className="text-[20px]">40%</div>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-[14px] text-gray-500">Rain Chance</div>
            <CloudRain className="w-[40px] h-[40px] text-lime-600 "></CloudRain>
            <div className="text-[20px]">30%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimationControls;
