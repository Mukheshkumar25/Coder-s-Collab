import React from "react";

import solo from "../assets/solo.webp";
import group from "../assets/group.jpg";
import whiteboard from "../assets/whiteboard.png";
import previewImg from "../assets/preview.jpeg";
import terminalImg from "../assets/terminal.webp";

const features = [
  {
    title: "Solo IDE",
    subtitle: "Write, run, and debug — all in the browser",
    text:
      "Our Solo IDE provides a distraction-free coding environment with support for popular languages like C, C++, Java, and Python. Whether you're practicing algorithms or building small scripts, you can write and execute code instantly without any setup or login. Includes syntax highlighting, auto-closing brackets, and error feedback for a smooth experience.",
    img: solo,
  },
  {
    title: "Real-time Collaboration",
    subtitle: "Code together in sync, wherever you are",
    text:
      "Join collaborative coding rooms where every keystroke is shared live. Perfect for pair programming, mentoring, or technical interviews. See who's online, share files, and edit simultaneously with zero conflicts. It's like Google Docs for code — but more powerful.",
    img: group,
  },
  {
    title: "Live HTML/CSS/JS Preview",
    subtitle: "Build, see, and refine without refreshing",
    text:
      "Front-end developers can preview their code changes in real-time. As you edit HTML, CSS, or JavaScript, the browser preview updates instantly. This helps you prototype faster, debug visual issues, and iterate your designs with confidence — without leaving the editor.",
    img: previewImg,
  },
  {
    title: "Integrated Terminal",
    subtitle: "Test programs with real input/output",
    text:
      "The built-in terminal lets you pass custom inputs to your code and view real-time output, including errors and compile-time warnings. Whether you're testing edge cases or debugging logic, our terminal gives you immediate feedback right below the code — no context switching required.",
    img: terminalImg,
  },
  {
    title: "Whiteboard & Team Chat",
    subtitle: "Sketch, discuss, and ideate visually",
    text:
      "Communicate beyond just code. The collaborative whiteboard helps teams sketch diagrams, explain logic visually, and brainstorm together. Integrated team chat lets you share ideas, send updates, and coordinate tasks — all without leaving your workspace.",
    img: whiteboard,
  },
];

export default function FeatureSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-[#EAEAEA] to-gray-50 px-4 md:px-10 font-sans">
      <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-16 font-inter">
        🔧 Key Features That Power Your Workflow
      </h2>

      <div className="space-y-12 max-w-6xl mx-auto">
        {features.map((f, idx) => (
          <div
            key={f.title}
            className={`flex flex-col md:flex-row ${
              idx % 2 === 1 ? "md:flex-row-reverse" : ""
            } items-center gap-8 md:gap-14 border border-gray-200 bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300`}
          >
            {/* Image */}
            <div className="md:w-1/2 w-full">
              <img
                src={f.img}
                alt={f.title}
                className="rounded-xl w-full object-cover max-h-64 shadow-sm"
              />
            </div>

            {/* Text */}
            <div className="md:w-1/2 w-full text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 font-inter">
                {f.title}
              </h3>
              <p className="text-blue-600 font-semibold text-sm md:text-base mb-4 uppercase tracking-wide">
                {f.subtitle}
              </p>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed font-normal">
                {f.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}