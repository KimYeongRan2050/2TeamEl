// CategorySelector.js
import React from "react";
import "../mapCategory.css";

const categories = [
  { id: "BK9", label: "은행", icon: "bank" },
  { id: "MT1", label: "마트", icon: "mart" },
  { id: "PM9", label: "약국", icon: "pharmacy" },
  { id: "OL7", label: "주유소", icon: "oil" },
  { id: "CE7", label: "카페", icon: "cafe" },
  { id: "CS2", label: "편의점", icon: "store" },
];

const CategorySelector = ({ selected, onSelect }) => {
  return (
    <ul id="category">
      {categories.map((cat, index) => (
        <li
          key={cat.id}
          id={cat.id}
          data-order={index}
          className={selected === cat.id ? "on" : ""}
          onClick={() => onSelect(cat.id === selected ? "" : cat.id)}
        >
          <span className={`category_bg ${cat.icon}`}></span>
          {cat.label}
        </li>
      ))}
    </ul>
  );
};

export default CategorySelector;
