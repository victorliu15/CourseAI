import React from "react";

const Course = ({
  course_section = "N/A",
  course_name = "N/A",
  credits = "N/A",
  restrictions = "N/A",
  prerequisites = "N/A",
  summary = "N/A",
}) => {
  return (
    <div className="bg-primary border border-primary-border rounded-lg p-6 mb-4 w-[30vw] max-w-3xl shadow-sm hover:shadow-md transition-shadow duration-200">
      <h2 className="text-lg font-bold text-accent mb-2">
        {course_section}: {course_name} ({credits} credits)
      </h2>
      <p className="text-text mb-1">
        <span className="font-semibold">Restrictions:</span> {restrictions}
      </p>
      <p className="text-text mb-1">
        <span className="font-semibold">Prerequisites:</span> {prerequisites}
      </p>
      <p className="text-text mt-2">{summary}</p>
    </div>
  );
};

export default Course;
