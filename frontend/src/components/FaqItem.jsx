import { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

export default function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button className="faq-question" onClick={() => setOpen(!open)}>
        {question}
        {open ? <FiChevronUp /> : <FiChevronDown />}
      </button>
      {open && <p className="faq-answer">{answer}</p>}
    </div>
  );
}
