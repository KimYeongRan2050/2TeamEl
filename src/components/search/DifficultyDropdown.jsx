import React from "react";

// 등산로 난이도 드랍다운 목록

const DifficultyDropdown = ({ value, setValue }) => {
  const options = ["전체", "상", "중", "하"];

  return (
    <select
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
      }}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
};

export default DifficultyDropdown;
