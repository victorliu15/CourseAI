import React, { useState } from "react";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { question: "What does CourseAI do?", answer: "CourseAI uses Google Gemini to scan through all the course information listed on Testudo and return the courses specific to the user query, so that any student could ask the simple question of, 'which class offers XYZ gen eds without ABC prereq' and immediately get results." },
    { question: "What was the inspiration?", answer: "As UMD students, we also suffered the many hours of sorting through Testudo's schedule of classes, trying to figure out what GenEds we needed while getting our major requirements. We wanted to develop an assistant that could parse through the seemingly endless amount of courses and details, and get the information straight to the student easily." },
    { question: "What's next?", answer: "Course requirements, credits, and professors are all good, however, more data is always beneficial for an app like this. Teacher reviews and class stats would be incredibly helpful for students using this project." },

  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main className="flex-1 bg-background w-full">
      <div className="container px-6 py-12 ml-auto">
        <h1 className="text-4xl font-bold text-text mb-8 w-fit">
          Frequently Asked Questions
        </h1>

        <div className="space-y-6 max-w-3xl">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-primary border border-primary-border rounded-lg overflow-hidden cursor-pointer"
              onClick={() => toggleFAQ(index)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-text mb-3">
                    {faq.question}
                  </h2>
                  <span className="text-2xl text-nav-text transition-transform">
                    {openIndex === index ? "▲" : "▼"}
                  </span>
                </div>
                {openIndex === index && (
                  <p className="text-nav-text leading-relaxed">{faq.answer}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default FAQ;
