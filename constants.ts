export const GAME_CONSTANTS = {
  CANVAS_WIDTH: 900,
  CANVAS_HEIGHT: 500,
  SLOPE_ANGLE: 15,
  MOVEMENT_SPEED: 1.5,
  TREE_GENERATION_INTERVAL: 120,
  GRAVITY: 0.2,
  PLAYER_WIDTH: 56,
  PLAYER_HEIGHT: 56,
  OBSTACLE_WIDTH: 32,
  OBSTACLE_HEIGHT: 40, // Engelleri kısalttım (48'den 40'a)
}

export const COLORS = {
  sky: "#8B0000",
  snow: "#8B0000",
  skiTrail: "#FF6347",
}

export const IMAGES = {
  BACKGROUND: "/hell-background.gif",
  CHARACTERS: [
    {
      name: "Skull Warrior",
      sprite: "/skull-warrior.png",
    },
    {
      name: "Shadow Ninja",
      sprite: "/karakter3.png",
    },
    {
      name: "Ghost Spirit",
      sprite: "/haha.png",
    },
  ],
  TREES: ["/seytan.png"],
  SNOWMEN: ["/eyes.png"],
}

export const FONTS = {
  PIXEL: '"8-BIT WONDER", monospace',
}
