import moment from "moment";

export interface TimeProps {
  timestamp?: string;
}

function Time(props: TimeProps) {
  return (
    <time title={moment(props.timestamp).format("MMMM Do YYYY, h:mm:ss a")}>
      {moment(props.timestamp).fromNow()}
    </time>
  );
}

export default Time;
