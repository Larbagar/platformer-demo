export const
    reflectPow = 0.5,
    jumpPow = 0.3,
    coyoteTime = 100,
    accel = 0.005,
    decel = 0.0001,
    speed = 0.5,
    jumpBuffer = 500,
    frameTime = 1000/120,
    gravity = 0.001,
    cameraSpeed = 0.0001,
    cameraDamp = 0.02,
    cameraLookahead = 0,
    tolerance = 10**(-3) // Keep at minimum. Decrease if clipping through walls.