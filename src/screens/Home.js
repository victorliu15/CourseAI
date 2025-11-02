import React from "react";
import Chat from "../components/Chat";

const Home = () => {
  return (
    <main className="flex-1 bg-background flex items-center justify-center flex-col">
      <h1 className="text-6xl font-bold text-text mb-2 w-fit">
        Course<span className="text-blue-500">AI</span>
      </h1>
      <h1 className="text-2xl font-bold text-text mb-8 w-fit">
        Streamlining your course selection process
      </h1>
      <div className="container mx-auto px-6 py-8">
        <Chat placeholder="Input your course preferences (major, level, topics, etc.)..." />
      </div>
    </main>
  );
};

export default Home;
