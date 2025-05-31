import React from "react";
import Card from "../components/Card";
import image1 from "../assets/image1.png";
import image2 from "../assets/image2.jpg";
import image4 from "../assets/image4.png";
import image5 from "../assets/image5.png";
import authBg from "../assets/authBg.png";
import image7 from "../assets/image7.jpeg";
import { RiImageAddLine } from "react-icons/ri";
import { useRef, useContext } from "react";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { MdKeyboardBackspace } from "react-icons/md";

const Customize = () => {
  const images = [image1, image2, image4, authBg, image5, image7];
  const {
    frontendImage,
    setFrontendImage,
    setBackendImage,
    selectedImage,
    setSelectedImage,
  } = useContext(userDataContext);
  const navigate = useNavigate();
  const inputImage = useRef();

  const handleImage = (e) => {
    const file = e.target.files[0];
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  return (
    <div
      className="w-full h-[100vh] bg-gradient-to-t from-[black] to-[#030353] flex justify-center items-center 
    flex-col p-[20px] gap-[20px] relative"
    >
      <MdKeyboardBackspace
        className="absolute top-[30px] left-[30px] text-white w-[25px] h-[25px] cursor-pointer"
        onClick={() => navigate("/")}
      />
      <h1 className="text-white text-[30px] text-center mb-[10px]">
        Select your <span className="text-blue-200">Assistant Image</span>
      </h1>
      <div className="w-full max-w-[900px] flex justify-center items-center flex-wrap gap-[15px]">
        {images.map((img, index) => (
          <Card key={index} image={img} />
        ))}
        <div
          className={`w-[70px] h-[140px] lg:w-[150px] lg:h-[250px]  bg-[#020220] border-2 border-[#0000ff66] rounded-2xl 
        overflow-hidden hover:shadow-2xl hover:shadow-blue-950 cursor-pointer hover:border-4 
        hover:border-white flex items-center justify-center ${
          selectedImage === "input"
            ? "border-4 border-white shadow-2xl shadow-blue-950"
            : null
        }`}
          onClick={() => {
            inputImage.current.click();
            setSelectedImage("input");
          }}
        >
          {/* {!frontendImage && (
            <RiImageAddLine className="text-white w-[25px] h-[25px]" />
          )}
          {frontendImage && (
            <img src={frontendImage} className="h-full object-cover" />
          )} */}
          {frontendImage ? (
            <img src={frontendImage} className="h-full object-cover" />
          ) : (
            <RiImageAddLine className="text-white w-[25px] h-[25px]" />
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          hidden
          ref={inputImage}
          onChange={handleImage}
        />
        {selectedImage && (
          <button
            className="min-w-[150px] h-[50px] mt-[20px] text-black font-semibold bg-white rounded-full text-[19px] cursor-pointer"
            onClick={() => navigate("/customize2")}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default Customize;
