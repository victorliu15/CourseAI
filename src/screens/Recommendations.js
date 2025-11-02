import React from "react";
import { useLocation } from "react-router-dom";
import Course from "../components/Course";

const Recommendations = ({ title = "Recommended Courses" }) => {
  const location = useLocation();
  const courses = location.state?.courses || [];

  const toList = (val) => {
    if (!val) return "";
    if (Array.isArray(val)) return val.join(", ");
    return String(val);
  };

  return (
    <main className="flex-1 bg-background flex flex-col pt-16 px-4 md:px-16">
      <h1 className="text-4xl md:text-5xl font-bold text-text text-center mb-10 w-full">
        {title}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full gap-6">
        {courses.map((course, i) => (
          <Course
            key={course.course_section + (course.title || i)}
            course_section={course.course_section}
            course_name={course.title}
            credits={course.credits}
            prerequisites={toList(course.prerequisites)}
            restrictions={toList(course.restrictions)}
            summary={course.summary}
          />
        ))}
      </div>
    </main>
  );
};

export default Recommendations;
