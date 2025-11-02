import React from "react";

const About = () => {
  return (
    <main className="flex-1 bg-background">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-text mb-8">
          About Course<span className="text-blue-500">AI</span>
        </h1>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-text mb-4">Our Mission</h2>
          <p className="text-text leading-relaxed">
            Our mission is to streamline course selection and make it easier for all UMD students to figure out what they need to take. 
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-text mb-4">
            How It Works
          </h2>
          <p className="text-text leading-relaxed">
We used a datascraper for the Testudo schedule of classes, converting all the relevant information into a JSON file that could be scanned by Google Gemini's API, and then have the relevant sections of said JSON file displayed to the user. 
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-text mb-4">Our Team</h2>
          <p className="text-text leading-relaxed">CourseAI was made by Victor Liu and Ashwath Babu, two ambitious freshmen at the University of Maryland. They both love celsius and video games</p>
        </section>
      </div>
    </main>
  );
};

export default About;
