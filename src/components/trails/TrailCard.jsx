// 등산로 카드

function TrailCard(props) {
  // 클릭 시 이벤트
  function handleClick() {
    if (props.selectedTrail && props.selectedTrail.id === props.trail.id) {
      props.setSelectedTrail(null);
      setTimeout(() => {
        props.setSelectedTrail(props.trail);
      }, 0);
    } else {
      props.setSelectedTrail(props.trail);
    }
  }

  // 카드 생성
  return (
    <div
      className="trailCard"
      style={{
        border:
          props.selectedTrail && props.selectedTrail.id === props.trail.id
            ? "2px solid red"
            : "1px solid gray",
        padding: "8px",
        marginBottom: "8px",
        cursor: "pointer",
      }}
      onClick={handleClick}
    >
      <div>{props.trail.properties.mntn_nm}</div>
      <div>길이: {props.trail.properties.sec_len}m</div>
      <div>난이도: {props.trail.properties.cat_nam}</div>
    </div>
  );
}

export default TrailCard;
