import { useState } from "react";

export function EarthBackdrop() {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    >
      {/* (a) deep navy base */}
      <div className="inset-0 bg-[#020617]" />

      {/* (b) Earth photo with CSS fallback */}
      <div className="inset-0">
        {!imageFailed ? (
          <img
            src="/earth-bg.webp"
            alt=""
            loading="eager"
            decoding="async"
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover object-bottom opacity-55 md:opacity-55"
          />
        ) : null}
        {imageFailed && (
          <div
            className="inset-0"
            style={{
              background:
                "radial-gradient(ellipse 120% 60% at 50% 115%, #0b3a6b 0%, #0e5a9c 30%, rgba(34,211,238,0.35) 38%, transparent 55%)",
            }}
          />
        )}
      </div>

      {/* (c) dark gradient scrim: top ~85% navy -> bottom ~35% navy */}
      <div className="inset-0 bg-gradient-to-b from-[#020617]/85 to-[#020617]/35" />

      {/* (d) thin cyan atmospheric glow along the horizon */}
      <div className="inset-0 pointer-events-none">
        <div
          className="absolute bottom-[30%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-#22d3ee/40 to-transparent"
          aria-hidden="true"
        />
      </div>

      {/* Starfield for fallback (upper area) */}
      {imageFailed && (
        <div className="inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-0 left-0 right-0 bottom-1/2"
            style={
              {
                backgroundImage:
                  "radial-gradient(1px 1px at 20% 30%, #ffffff), " +
                  "radial-gradient(1px 1px at 40% 10%, #ffffff), " +
                  "radial-gradient(1px 1px at 60% 40%, #ffffff), " +
                  "radial-gradient(1px 1px at 80% 15%, #ffffff), " +
                  "radial-gradient(1px 1px at 30% 60%, #ffffff), " +
                  "radial-gradient(1px 1px at 70% 70%, #ffffff), " +
                  "radial-gradient(1px 1px at 10% 80%, #ffffff), " +
                  "radial-gradient(1px 1px at 90% 20%, #ffffff)",
                backgroundRepeat: "repeat",
                backgroundSize: "200px 200px",
                opacity: 0.35,
              } as React.CSSProperties
            }
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}
