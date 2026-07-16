export type StageRect = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

export type StagePoint = {
  readonly x: number;
  readonly y: number;
};

export type StageSpawnPoint = {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly enemyType?: "soldier" | "mauler" | "duelist";
};

export type StageEncounter = {
  readonly id: string;
  readonly trigger: StageRect;
  readonly spawnPointIds: readonly string[];
};

export type StageExit = {
  readonly id: string;
  readonly bounds: StageRect;
  readonly targetStageId: string | null;
};

export type StageBackgroundSection = {
  readonly id: string;
  readonly textureKey: string;
  readonly bounds: StageRect;
};

export type StageConfig = {
  readonly id: string;
  readonly worldBounds: StageRect;
  readonly walkBounds: StageRect;
  readonly backgroundSections: readonly StageBackgroundSection[];
  readonly playerSpawn: StageSpawnPoint;
  readonly spawnPoints: readonly StageSpawnPoint[];
  readonly encounters: readonly StageEncounter[];
  readonly exits: readonly StageExit[];
};

const isFiniteNumber = (value: number) => Number.isFinite(value);

export function clampStageX(x: number, bounds: StageRect): number {
  return Math.min(Math.max(x, bounds.x), bounds.x + bounds.width);
}

export function clampStageY(y: number, bounds: StageRect): number {
  return Math.min(Math.max(y, bounds.y), bounds.y + bounds.height);
}

export function clampStagePoint(point: StagePoint, bounds: StageRect): StagePoint {
  return { x: clampStageX(point.x, bounds), y: clampStageY(point.y, bounds) };
}

export function isStagePointWithin(point: StagePoint, bounds: StageRect): boolean {
  return point.x >= bounds.x && point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y && point.y <= bounds.y + bounds.height;
}

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

  const backgroundIds = new Set<string>();
  const backgroundSections = [...config.backgroundSections].sort((left, right) => left.bounds.x - right.bounds.x);
  let expectedSectionX = config.worldBounds.x;
  for (const section of backgroundSections) {
    if (!section.id || !section.textureKey || backgroundIds.has(section.id)) throw new Error(`Invalid background section: ${section.id}`);
    backgroundIds.add(section.id);
    assertRect(`background ${section.id}`, section.bounds);
    if (
      section.bounds.x !== expectedSectionX ||
      section.bounds.y !== config.worldBounds.y ||
      section.bounds.height !== config.worldBounds.height
    ) throw new Error("Background sections must cover world bounds without gaps");
    expectedSectionX += section.bounds.width;
  }
  if (expectedSectionX !== config.worldBounds.x + config.worldBounds.width) {
    throw new Error("Background sections must cover world bounds without gaps");
  }

  assertPoint("player spawn", config.playerSpawn, config.walkBounds);
  const ids = new Set<string>();
  for (const point of config.spawnPoints) {
    assertPoint("spawn", point, config.walkBounds);
    if (point.enemyType && !["soldier", "mauler", "duelist"].includes(point.enemyType)) throw new Error(`Unknown enemy type: ${point.enemyType}`);
    if (ids.has(point.id)) throw new Error(`Duplicate spawn point id: ${point.id}`);
    ids.add(point.id);
  }
  const encounterIds = new Set<string>();
  let previousTriggerEnd = config.walkBounds.x;
  for (const encounter of config.encounters) {
    if (!encounter.id || encounterIds.has(encounter.id)) throw new Error(`Duplicate encounter id: ${encounter.id}`);
    if (encounter.spawnPointIds.length === 0) throw new Error(`Encounter has no spawn points: ${encounter.id}`);
    encounterIds.add(encounter.id);
    assertRect(`encounter ${encounter.id} trigger`, encounter.trigger);
    if (
      encounter.trigger.x < previousTriggerEnd ||
      encounter.trigger.x < config.walkBounds.x ||
      encounter.trigger.y < config.walkBounds.y ||
      encounter.trigger.x + encounter.trigger.width > config.walkBounds.x + config.walkBounds.width ||
      encounter.trigger.y + encounter.trigger.height > config.walkBounds.y + config.walkBounds.height
    ) throw new Error("Encounter triggers must be ordered inside walk bounds");
    previousTriggerEnd = encounter.trigger.x + encounter.trigger.width;
    for (const spawnPointId of encounter.spawnPointIds) {
      if (!ids.has(spawnPointId)) throw new Error(`Unknown spawn point: ${spawnPointId}`);
    }
  }
  for (const exit of config.exits) assertRect(`exit ${exit.id}`, exit.bounds);
  return config;
}

export const BAMBOO_COMBAT_ROOM: StageConfig = validateStageConfig({
  id: "bamboo-combat-room",
  worldBounds: { x: 0, y: 0, width: 3840, height: 720 },
  walkBounds: { x: 70, y: 390, width: 3700, height: 245 },
  backgroundSections: [
    { id: "bamboo-section-1", textureKey: "forest", bounds: { x: 0, y: 0, width: 1280, height: 720 } },
    { id: "bamboo-section-2", textureKey: "forest", bounds: { x: 1280, y: 0, width: 1280, height: 720 } },
    { id: "bamboo-section-3", textureKey: "forest", bounds: { x: 2560, y: 0, width: 1280, height: 720 } },
  ],
  playerSpawn: { id: "player-start", x: 180, y: 602 },
  spawnPoints: [
    { id: "enemy-front", x: 1300, y: 560, enemyType: "soldier" },
    { id: "enemy-upper-rear", x: 2320, y: 455, enemyType: "mauler" },
    { id: "enemy-lower-front", x: 2420, y: 625, enemyType: "duelist" },
  ],
  encounters: [
    {
      id: "forest-entry",
      trigger: { x: 900, y: 390, width: 120, height: 245 },
      spawnPointIds: ["enemy-front"],
    },
    {
      id: "forest-ambush",
      trigger: { x: 2000, y: 390, width: 120, height: 245 },
      spawnPointIds: ["enemy-upper-rear", "enemy-lower-front"],
    },
  ],
  exits: [{
    id: "room-exit",
    bounds: { x: 3690, y: 390, width: 80, height: 245 },
    targetStageId: null,
  }],
});

// The concrete Boss arena occupies the final viewport. Runtime physics still
// uses the Stage walk boundary; arena activation remains Task 5R.3.
export const BAMBOO_BOSS_ARENA = Object.freeze({
  id: "bamboo-boss-arena",
  entryTrigger: Object.freeze({ x: 2630, y: 390, width: 120, height: 245 }),
  bounds: Object.freeze({ x: 2630, y: 390, width: 1140, height: 245 }),
  cameraScroll: Object.freeze({ x: 2560, y: 0 }),
  spawn: Object.freeze({ x: 3420, y: 560 }),
});
