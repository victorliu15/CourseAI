import React from "react";
import Chat from "../components/Chat";

const Home = () => {
  return (
    <main className="flex-1 bg-background flex items-center justify-center">
      <div className="container mx-auto px-6 py-8">
        <Chat />
      </div>
    </main>
  );
};

export default Home;
