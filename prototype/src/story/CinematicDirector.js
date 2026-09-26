const smoothStep = value => value * value * (3 - 2 * value);

const shortestAngle = (from, to) => {
  let delta = (to - from) % (Math.PI * 2);
  if (delta > Math.PI) delta -= Math.PI * 2;
  if (delta < -Math.PI) delta += Math.PI * 2;
  return delta;
};

export class CinematicDirector {
  constructor({ camera, controller, gameState }) {
    this.camera = camera;
    this.controller = controller;
    this.gameState = gameState;
    this.activeId = null;
    this.frameRequest = null;
  }

  play({ id, durationMs, keyframes = [], cues = [], guard = () => true, onComplete }) {
    const completedFlag = `CG_${id}_PLAYED`;
    const activeFlag = `CG_${id}_ACTIVE`;
    if (this.activeId || this.gameState.getFlag(completedFlag) || !guard()) return Promise.resolve(false);

    const original = {
      yaw: this.controller.yaw,
      pitch: this.controller.pitch,
      enabled: this.controller.enabled
    };
    const frames = [{ at: 0, yaw: 0, pitch: 0 }, ...keyframes]
      .sort((left, right) => left.at - right.at);
    const firedCues = new Set();
    let startedAt = 0;

    this.activeId = id;
    this.controller.cancelAutoMove();
    this.controller.enabled = false;
    this.gameState.setFlag(activeFlag, true);
    document.exitPointerLock?.();

    return new Promise((resolve, reject) => {
      const finish = error => {
        if (this.frameRequest !== null) cancelAnimationFrame(this.frameRequest);
        this.frameRequest = null;
        this.controller.yaw = original.yaw;
        this.controller.pitch = original.pitch;
        this.controller.updateCameraRotation();
        this.controller.enabled = original.enabled;
        this.gameState.setFlag(activeFlag, false);
        this.activeId = null;
        if (error) {
          reject(error);
          return;
        }
        this.gameState.setFlag(completedFlag, true);
        try {
          onComplete?.();
          resolve(true);
        } catch (completionError) {
          reject(completionError);
        }
      };

      const tick = now => {
        try {
          if (!startedAt) startedAt = now;
          const progress = Math.min(1, (now - startedAt) / durationMs);
          let rightIndex = frames.findIndex(frame => frame.at >= progress);
          if (rightIndex < 0) rightIndex = frames.length - 1;
          const right = frames[rightIndex];
          const left = frames[Math.max(0, rightIndex - 1)];
          const span = right.at - left.at;
          const local = span > 0 ? smoothStep((progress - left.at) / span) : 1;
          const yawOffset = left.yaw + shortestAngle(left.yaw, right.yaw) * local;
          const pitchOffset = left.pitch + (right.pitch - left.pitch) * local;
          this.controller.yaw = original.yaw + yawOffset;
          this.controller.pitch = original.pitch + pitchOffset;
          this.controller.updateCameraRotation();

          cues.forEach((cue, index) => {
            if (progress >= cue.at && !firedCues.has(index)) {
              firedCues.add(index);
              cue.run({ camera: this.camera, controller: this.controller, gameState: this.gameState });
            }
          });

          if (progress >= 1) finish();
          else this.frameRequest = requestAnimationFrame(tick);
        } catch (error) {
          finish(error);
        }
      };

      this.frameRequest = requestAnimationFrame(tick);
    });
  }
}
