interface TimerDisplayProps {
  minutes: number;
  seconds: number;
  //mode: "work" | "break";
}

export default function TimerDisplay({ minutes, seconds }: TimerDisplayProps) {
  return (
    <div className="text-6xl font-mono font-bold text-primary">
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </div>
  );
}
//test
