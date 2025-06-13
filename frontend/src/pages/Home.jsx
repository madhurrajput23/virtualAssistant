import { useContext, useEffect, useRef, useState } from "react";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import aiImg from "../assets/ai.gif";
import userImg from "../assets/user.gif";
import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";

const Home = () => {
  const { userData, serverUrl, setUserData, getGeminiResponse } =
    useContext(userDataContext);
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [hamburger, setHamburger] = useState(false);
  const isSpeakingRef = useRef(false);
  const recognitionRef = useRef(null);
  const isRecognizingRef = useRef(false);
  const synth = window.speechSynthesis;

  const startRecognition = () => {
    if (!isRecognizingRef.current || !isSpeakingRef.current) {
      try {
        recognitionRef.current?.start();
      } catch (error) {
        if (error.name !== "InvalidStateError") {
          console.error("Recognition start error:", error);
        }
      }
    }
  };

  const speak = (text) => {
    const utterence = new SpeechSynthesisUtterance(text);
    utterence.lang = "en-US";
    // const voices = window.speechSynthesis.getVoices();
    // const hindiVoice = voices.find((v) => v.lang === "hi-IN");
    // if (hindiVoice) {
    //   utterence.voice = hindiVoice;
    // }
    isSpeakingRef.current = true;
    utterence.onend = () => {
      setAiText("")
      isSpeakingRef.current = false;
      setTimeout(() => {
        startRecognition();
      }, 800); // Delay before starting recognition again
    };
    synth.cancel(); // Cancel any ongoing speech
    synth.speak(utterence);
  };

 const handleCommand=(data)=>{
    const {type,userInput,response}=data
      speak(response);
    
    if (type === 'google-search') {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.google.com/search?q=${query}`, '_blank');
    }
     if (type === 'calculator-open') {
  
      window.open(`https://www.google.com/search?q=calculator`, '_blank');
    }
     if (type === "instagram-open") {
      window.open(`https://www.instagram.com/`, '_blank');
    }
    if (type ==="facebook-open") {
      window.open(`https://www.facebook.com/`, '_blank');
    }
     if (type ==="weather-show") {
      window.open(`https://www.google.com/search?q=weather`, '_blank');
    }

    if (type === 'youtube-search' || type === 'youtube-play') {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
    }

  }
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognitionRef.current = recognition;

    let isMounted = true;

    const startTimeout = setTimeout(() => {
      if (isMounted && !isSpeakingRef.current && !isRecognizingRef.current) {
        try {
          recognition.start();
          console.log("Speech recognition started");
        } catch (error) {
          if (error.name !== "InvalidStateError") {
            console.error("Start error:", error);
          }
        }
      }
    }, 1000);

    recognition.onstart = () => {
      isRecognizingRef.current = true;
      setListening(true);
    };
    recognition.onend = () => {
      isRecognizingRef.current = false;
      setListening(false);

      if (isMounted && !isSpeakingRef.current) {
        setTimeout(() => {
          if (isMounted) {
            try {
              recognition.start();
              console.log("Speech recognition restarted");
            } catch (error) {
              if (error.name !== "InvalidStateError") {
                console.error("Restart error:", error);
              }
            }
          }
        }, 1000);
      }
    };

    recognition.onerror = (event) => {
      console.warn("Recognition error:", event.error);
      isRecognizingRef.current = false;
      setListening(false);
      if (event.error !== "aborted" && isMounted && !isSpeakingRef.current) {
        setTimeout(() => {
          if (isMounted) {
            try {
              recognition.start();
              console.log("Speech recognition restarted after error");
            } catch (error) {
              if (error.name !== "InvalidStateError") {
                console.error("Restart after error:", error);
              }
            }
          }
        }, 1000);
      }
    };

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim();
      if (
        transcript.toLowerCase().includes(userData?.assistantName.toLowerCase())
      ) {
        setAiText("");
        setUserText(transcript);
        recognition.stop();
        isRecognizingRef.current = false;
        setListening(false);
        const data = await getGeminiResponse(transcript);
        handleCommand(data);
        setAiText(data.response);
        setUserText("");
      }

      const greeting = new SpeechSynthesisUtterance(
        `Hello, I am ${userData?.name}. How can I assist you today?`
      );
      greeting.lang = "en-US";
      window.speechSynthesis.speak(greeting);

      return () => {
        isMounted = false;
        clearTimeout(startTimeout);
        recognition.stop();
        setListening(false);
        isRecognizingRef.current = false;
      };
    };
  }, []);

  const handleLogout = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });
      setUserData(null);
      navigate("/signin");
    } catch (error) {
      setUserData(null);
      console.error("Error during logout:", error);
    }
  };
  return (
    <div
      className="w-full h-[100vh] bg-gradient-to-t from-[black] to-[#030353] flex justify-center items-center 
    flex-col gap-[15px] overflow-hidden"
    >
      <CgMenuRight
        className="lg:hidden text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]"
        onClick={() => setHamburger(true)}
      />
      <div
        className={`absolute lg:hidden top-0 w-full h-full bg-[#00000070] backdrop-blur-lg p-[20px] flex flex-col
       gap-[20px] items-start ${
         hamburger ? "translate-x-0" : "translate-x-full"
       } transition-transform`}
      >
        <RxCross1
          className=" text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]"
          onClick={() => setHamburger(false)}
        />
        <button
          className="min-w-[150px] h-[50px] text-black font-semibold bg-white rounded-full 
      text-[19px]  px-[20px] py-[10px] cursor-pointer "
          onClick={handleLogout}
        >
          Log Out
        </button>
        <button
          className="min-w-[150px] h-[50px] text-black font-semibold bg-white rounded-full text-[19px] 
      px-[20px] py-[10px] cursor-pointer "
          onClick={() => navigate("/customize")}
        >
          Customize your Assistant
        </button>

        <div className="w-full h-[2px] bg-gray-400"></div>
        <h1 className="text-white font-semibold text-[19px]">History</h1>
        <div className="w-full h-[400px] overflow-y-auto flex flex-col truncate gap-[20px]">
          {userData.history.map((item) => (
            <div className="text-gray-200 text-[18px] w-full h-[30px]">
              {item}
            </div>
          ))}
          ;
        </div>
      </div>
      <button
        className="min-w-[150px] h-[50px] mt-[20px] text-black font-semibold bg-white rounded-full 
      text-[19px] absolute top-[20px] right-[20px] cursor-pointer hidden lg:block"
        onClick={handleLogout}
      >
        Log Out
      </button>
      <button
        className="min-w-[150px] h-[50px] mt-[20px] text-black font-semibold bg-white rounded-full text-[19px] 
      absolute top-[100px] right-[20px] px-[20px] py-[10px] cursor-pointer hidden lg:block"
        onClick={() => navigate("/customize")}
      >
        Customize your Assistant
      </button>
      <div className="w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg">
        <img
          src={userData?.assistantImage}
          alt=""
          className="h-full object-cover"
        />
      </div>
      <h1 className="text-white text-[18px] font-semibold">
        I'm {userData?.assistantName}
      </h1>
      {!aiText && <img src={userImg} className="w-[200px]" />}
      {aiText && <img src={aiImg} className="w-[200px]" />}
      <h1
        className="text-white text-[18px] font-semibold
       text-wrap"
      >
        {userText ? userText : aiText ? aiText : null}
      </h1>
    </div>
  );
};

export default Home;
