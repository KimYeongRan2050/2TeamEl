import React from "react";

// 등산로 최소 최대 길이 입력 - 숫자만 입력 가능, 최대 5글자

const RangeInput = ({ value, setValue, placeholder }) => {
  const handleChange = (e) => {
    const input = e.target.value;
    if ((input === "" || /^[0-9]*$/.test(input)) && input.length <= 5) {
      setValue(input);
    }
  };

  return <input type="text" value={value} onChange={handleChange} placeholder={placeholder} />;
};

export default RangeInput;
