import React, { useState, useEffect, useCallback } from "react";
import { Activity, Cpu, MemoryStick } from "lucide-react";

interface MemoryUsage {
  used: string;
  total: string;
}

const PerformanceStats: React.FC = () => {
  const [fps, setFps] = useState<number>(0);
  const [cpuLoad, setCpuLoad] = useState<number>(0);
  const [memoryUsage, setMemoryUsage] = useState<MemoryUsage>({
    used: "0",
    total: "0",
  });
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const frameData = React.useRef({
    lastTime: performance.now(),
    frameCount: 0,
    frames: [] as number[],
  });

  const calculateFPS = useCallback((currentTime: number) => {
    const { lastTime, frameCount, frames } = frameData.current;
    const deltaTime = currentTime - lastTime;

    if (deltaTime >= 1000) {
      const currentFPS = Math.round(frameCount / (deltaTime / 1000));
      frames.push(currentFPS);

      if (frames.length > 10) {
        frames.shift();
      }

      // Calculate average FPS
      const averageFPS = Math.round(
        frames.reduce((sum, fps) => sum + fps, 0) / frames.length
      );

      setFps(averageFPS);
      frameData.current.frameCount = 0;
      frameData.current.lastTime = currentTime;
    } else {
      frameData.current.frameCount++;
    }
  }, []);

  // More accurate CPU load estimation
  const calculateCPULoad = useCallback((startTime: number, endTime: number) => {
    const frameTime = endTime - startTime;
    const targetFrameTime = 1000 / 60; // 60 FPS is ideal
    const load = Math.min(100, Math.round((frameTime / targetFrameTime) * 100));
    setCpuLoad(load);
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const gameLoop = () => {
      const startTime = performance.now();

      calculateFPS(startTime);

      // Memory Usage (if available)
      if ((performance as any).memory) {
        const memoryInfo = (performance as any).memory;
        const usedMemory = (memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2);
        const totalMemory = (memoryInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(
          2
        );
        setMemoryUsage({
          used: usedMemory,
          total: totalMemory,
        });
      }

      const endTime = performance.now();
      calculateCPULoad(startTime, endTime);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [calculateFPS, calculateCPULoad]);

  // Helper function to determine status color
  const getStatusColor = (
    value: number,
    threshold1: number,
    threshold2: number
  ) => {
    if (value <= threshold1) return "text-green-500";
    if (value <= threshold2) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900/90 rounded-lg p-4 text-white shadow-lg backdrop-blur-sm">
      <div
        className="flex items-center justify-between cursor-pointer mb-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Activity size={20} className="text-blue-400" />
          Performance Stats
        </h3>
        <span className="text-gray-400 text-sm">{isExpanded ? "▼" : "▶"}</span>
      </div>

      {isExpanded && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-blue-400" />
            <span className={`font-mono ${getStatusColor(fps, 50, 30)}`}>
              {fps} FPS
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Cpu size={16} className="text-blue-400" />
            <span className={`font-mono ${getStatusColor(cpuLoad, 30, 70)}`}>
              CPU: {cpuLoad}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            <MemoryStick size={16} className="text-blue-400" />
            <span className="font-mono text-gray-300">
              RAM: {memoryUsage.used}/{memoryUsage.total} MB (
              {Math.round(
                (parseFloat(memoryUsage.used) / parseFloat(memoryUsage.total)) *
                  100
              )}
              %)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceStats;
