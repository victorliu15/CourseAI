import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Course from "../components/Course";

function ensureArray(x) {
  if (!x) return [];
  if (Array.isArray(x)) return x;
  if (typeof x === "string") return x ? [x] : [];
  return [];
}

export default function Recommendations({ title = "Recommended Courses" }) {
  const location = useLocation();
  const initial = Array.isArray(location.state?.courses)
    ? location.state.courses
    : null;
  const [courses, setCourses] = useState(initial || []);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initial) return;
    const q = location.state?.query || {}; // optional: previous route can pass { section, keywords, nl, limit }
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(q),
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error(`server ${r.status}`);
        return r.json();
      })
      .then((payload) => {
        setCourses(Array.isArray(payload.results) ? payload.results : []);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message || "Failed");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [initial, location.state]);

  return (
    <main className="flex-1 bg-background flex flex-col pt-16 px-4 md:px-16">
      <h1 className="text-4xl md:text-5xl font-bold text-text text-center mb-10 w-full">
        {title}
      </h1>

      {loading && <div className="text-center">Loading...</div>}
      {error && <div className="text-center text-red-600">Error: {error}</div>}

      {!loading && !error && courses.length === 0 && (
        <div className="text-center">No courses found.</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full gap-6">
        {courses.map((course) => {
          const section = course.course_section || course.section || "";
          const name = course.title || course.course_name || "";
          const credits = course.credits ?? null;
          const prerequisites = ensureArray(course.prerequisites);
          const restrictions = ensureArray(course.restrictions);
          const summary = course.summary || "";

          const key = section + (name || "").slice(0, 40);

          return (
            <Course
              key={key}
              course_section={section}
              course_name={name}
              credits={credits}
              prerequisites={prerequisites.join(", ")}
              restrictions={restrictions.join(", ")}
              summary={summary}
            />
          );
        })}
      </div>
    </main>
  );
}
