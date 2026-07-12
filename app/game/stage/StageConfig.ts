export type StageRect = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

export type StageSpawnPoint = {
  readonly id: string;
  readonly x: number;
  readonly y: number;
};

export type StageEncounter = {
  readonly id: string;
  readonly spawnPointIds: readonly string[];
};

export type StageExit = {
  readonly id: string;
  readonly bounds: StageRect;
  readonly targetStageId: string | null;
};

export type StageConfig = {
  readonly id: string;
  readonly worldBounds: StageRect;
  readonly walkBounds: StageRect;
  readonly playerSpawn: StageSpawnPoint;
  readonly spawnPoints: readonly StageSpawnPoint[];
  readonly encounters: readonly StageEncounter[];
  readonly exits: readonly StageExit[];
};

const isFiniteNumber = (value: number) => Number.isFinite(value);

function assertRect(name: string, rect: StageRect) {
  if (![rect.x, rect.y, rect.width, rect.height].every(isFiniteNumber) || rect.width <= 0 || rect.height <= 0) {
    throw new Error(`Invalid ${name} rectangle`);
  }
}

function assertPoint(name: string, point: StageSpawnPoint, bounds: StageRect) {
  if (!point.id || ![point.x, point.y].every(isFiniteNumber)) throw new Error(`Invalid ${name} point`);
  if (point.x < bounds.x || point.x > bounds.x + bounds.width || point.y < bounds.y || point.y > bounds.y + bounds.height) {
    throw new Error(`${name} point is outside walk bounds`);
  }
}

export function validateStageConfig(config: StageConfig): StageConfig {
  if (!config.id) throw new Error("Stage id is required");
  assertRect("world bounds", config.worldBounds);
  assertRect("walk bounds", config.walkBounds);
  if (
    config.walkBounds.x < config.worldBounds.x ||
    config.walkBounds.y < config.worldBounds.y ||
    config.walkBounds.x + config.walkBounds.width > config.worldBounds.x + config.worldBounds.width ||
    config.walkBounds.y + config.walkBounds.height > config.worldBounds.y + config.worldBounds.height
  ) throw new Error("Walk bounds must be inside world bounds");

  assertPoint("player spawn", config.playerSpawn, config.walkBounds);
  const ids = new Set<string>();
  for (const point of config.spawnPoints) {
    assertPoint("spawn", point, config.walkBounds);
    if (ids.has(point.id)) throw new Error(`Duplicate spawn point id: ${point.id}`);
    ids.add(point.id);
  }
  const encounterIds = new Set<string>();
  for (const encounter of config.encounters) {
    if (!encounter.id || encounterIds.has(encounter.id)) throw new Error(`Duplicate encounter id: ${encounter.id}`);
    encounterIds.add(encounter.id);
    for (const spawnPointId of encounter.spawnPointIds) {
      if (!ids.has(spawnPointId)) throw new Error(`Unknown spawn point: ${spawnPointId}`);
    }
  }
  for (const exit of config.exits) assertRect(`exit ${exit.id}`, exit.bounds);
  return config;
}

export const BAMBOO_COMBAT_ROOM: StageConfig = validateStageConfig({
  id: "bamboo-combat-room",
  worldBounds: { x: 0, y: 0, width: 1280, height: 720 },
  walkBounds: { x: 70, y: 390, width: 1140, height: 245 },
  playerSpawn: { id: "player-start", x: 180, y: 602 },
  spawnPoints: [
    { id: "enemy-front", x: 900, y: 560 },
    { id: "enemy-upper-rear", x: 830, y: 455 },
    { id: "enemy-lower-front", x: 850, y: 625 },
  ],
  encounters: [{ id: "opening-combat", spawnPointIds: ["enemy-front", "enemy-upper-rear", "enemy-lower-front"] }],
  exits: [],
});

