import React, { useState } from "react";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { question: "Question 1", answer: "Answer 1" },
    { question: "Question 2", answer: "Answer 2" },
    { question: "Question 3", answer: "Answer 3" },
    { question: "Question 4", answer: "Answer 4" },
    { question: "Question 5", answer: "Answer 5" },
    { question: "Question 6", answer: "Answer 6" },
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
