import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Chat = ({ placeholder = "Type your message here..." }) => {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      const res = await fetch("http://localhost:5000/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      console.log("Gemini results:", data.results);

      navigate("/recommendations", { state: { courses: data.results || [] } });
    } catch (err) {
      console.error("Error:", err);
    }

    setMessage("");
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col space-y-2 w-full h-[40vh]">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            className="w-full h-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            rows="4"
          />
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors whitespace-nowrap w-[15%] ml-auto"
          >
            Go →
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
