import { useContext, useState } from "react";
import { userDataContext } from "../context/UserContext";
import axios from "axios";
import { MdKeyboardBackspace } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const Customize2 = () => {
  const navigate = useNavigate();
  const { userData, backendImage, selectedImage, serverUrl, setUserData } =
    useContext(userDataContext);
  const [assistantName, setAssistantName] = useState(
    userData?.AssistantName || ""
  );
  const [loading, setLoading] = useState(false);

  const handleUpdateAssistant = async () => {
    setLoading(true);
    try {
      let formData = new FormData();
      formData.append("assistantName", assistantName);
      if (backendImage) {
        formData.append("assistantImage", backendImage);
      } else {
        formData.append("imageUrl", selectedImage);
      }
      const result = await axios.post(
        `${serverUrl}/api/user/update`,
        formData,
        { withCredentials: true }
      );
      setLoading(false);
      setUserData(result.data);
      navigate("/");
    } catch (error) {
      console.error("Error updating assistant:", error);
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full h-[100vh] bg-gradient-to-t from-[black] to-[#030353] flex justify-center items-center 
    flex-col p-[20px] gap-[20px] relative"
    >
      <MdKeyboardBackspace
        className="absolute top-[30px] left-[30px] text-white w-[25px] h-[25px] cursor-pointer"
        onClick={() => navigate("/customize")}
      />
      <h1 className="text-white text-[30px] text-center mb-[10px]">
        Enter your <span className="text-blue-200">Assistant Image</span>
      </h1>
      <input
        type="text"
        placeholder="eg: gemini"
        className="w-full max-w-[600px] h-[60px] outline-none border-2 border-white bg-transparent text-white 
        placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]"
        required
        onChange={(e) => setAssistantName(e.target.value)}
        value={assistantName}
      />
      {assistantName && (
        <button
          className="min-w-[200px] h-[50px] mt-[20px] text-black font-semibold bg-white rounded-full 
      text-[19px] cursor-pointer"
          disabled={loading}
          onClick={handleUpdateAssistant}
        >
          {!loading ? "Create Assistant" : "Loading..."}
        </button>
      )}
    </div>
  );
};

export default Customize2;
