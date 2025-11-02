import React, { useState } from "react";

const Chat = ({ placeholder = "Type your message here..." }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Message:", message);
    setMessage("");
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col space-y-2 w-full h-[40vh]">
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={placeholder}
              className="w-full h-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              rows="4"
            />
          </div>
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
