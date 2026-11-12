interface CameraControlsProps {
  onPause: () => void;
  onResume: () => void;
  onExit: () => void;
  paused: boolean;
}

export function CameraControls({ onPause, onResume, onExit, paused }: CameraControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={paused ? onResume : onPause}
        className="px-4 py-2 rounded border border-astra-amber/50 bg-astra-amber/10 text-astra-amber hover:bg-astra-amber/20 transition text-sm font-medium"
      >
        {paused ? "Resume" : "Pause"}
      </button>
      <button
        onClick={onExit}
        className="px-4 py-2 rounded border border-astra-red/50 bg-astra-red/10 text-astra-red hover:bg-astra-red/20 transition text-sm font-medium"
      >
        Exit
      </button>
    </div>
  );
}
