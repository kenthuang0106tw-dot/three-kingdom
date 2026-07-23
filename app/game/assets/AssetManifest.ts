import type * as Phaser from "phaser";

export type RuntimeAsset =
  | { readonly kind: "image"; readonly key: string; readonly url: string }
  | { readonly kind: "atlas"; readonly key: string; readonly textureURL: string; readonly atlasURL: string }
  | { readonly kind: "bitmapFont"; readonly key: string; readonly textureURL: string; readonly dataURL: string };

export function resolveRuntimeAssetUrl(path: string, baseUrl?: string) {
  const documentBase = baseUrl ?? (typeof document === "undefined" ? undefined : document.baseURI);
  if (!documentBase) return path;
  return new URL(path.replace(/^\/+/, ""), documentBase).pathname;
}

const assetUrl = (path: string) => resolveRuntimeAssetUrl(path);

export const RUNTIME_ASSET_MANIFEST: readonly RuntimeAsset[] = [
  { kind: "image", key: "stage-forest-entry-background", url: assetUrl("/scene/bamboo-stage/bamboo-forest-entry-background.png") },
  { kind: "image", key: "stage-forest-entry-ground", url: assetUrl("/scene/bamboo-stage/bamboo-forest-entry-ground.png") },
  { kind: "image", key: "stage-forest-entry-foreground", url: assetUrl("/scene/bamboo-stage/bamboo-forest-entry-foreground.png") },
  { kind: "image", key: "stage-forest-ambush-background", url: assetUrl("/scene/bamboo-stage/bamboo-forest-ambush-background.png") },
  { kind: "image", key: "stage-forest-ambush-ground", url: assetUrl("/scene/bamboo-stage/bamboo-forest-ambush-ground.png") },
  { kind: "image", key: "stage-forest-ambush-foreground", url: assetUrl("/scene/bamboo-stage/bamboo-forest-ambush-foreground.png") },
  { kind: "image", key: "stage-boss-arena-background", url: assetUrl("/scene/bamboo-stage/bamboo-boss-arena-background.png") },
  { kind: "image", key: "stage-boss-arena-ground", url: assetUrl("/scene/bamboo-stage/bamboo-boss-arena-ground.png") },
  { kind: "image", key: "stage-boss-arena-foreground", url: assetUrl("/scene/bamboo-stage/bamboo-boss-arena-foreground.png") },
  { kind: "atlas", key: "combat-effects", textureURL: assetUrl("/art/effects/combat-effects.png"), atlasURL: assetUrl("/art/effects/combat-effects.atlas.json") },
  { kind: "image", key: "ui-hud-frame", url: assetUrl("/art/ui/ui-hud-frame.png") },
  { kind: "image", key: "ui-modal-frame", url: assetUrl("/art/ui/ui-modal-frame.png") },
  { kind: "image", key: "ui-button-frame", url: assetUrl("/art/ui/ui-button-frame.png") },
  { kind: "image", key: "ui-joystick-base", url: assetUrl("/art/ui/ui-joystick-base.png") },
  { kind: "image", key: "ui-joystick-knob", url: assetUrl("/art/ui/ui-joystick-knob.png") },
  { kind: "image", key: "ui-attack-frame", url: assetUrl("/art/ui/ui-attack-frame.png") },
  { kind: "bitmapFont", key: "dragon-pixel", textureURL: assetUrl("/art/ui/dragon-pixel.png"), dataURL: assetUrl("/art/ui/dragon-pixel.xml") },
  { kind: "atlas", key: "guanyu-v2", textureURL: assetUrl("/art/guanyu/guanyu-v2.png"), atlasURL: assetUrl("/art/guanyu/guanyu-v2.atlas.json") },
  { kind: "atlas", key: "enemy-soldier", textureURL: assetUrl("/art/enemy/enemy-soldier.png"), atlasURL: assetUrl("/art/enemy/enemy-soldier.atlas.json") },
  { kind: "atlas", key: "enemy-mauler", textureURL: assetUrl("/art/enemy/mauler.png"), atlasURL: assetUrl("/art/enemy/mauler.atlas.json") },
  { kind: "atlas", key: "enemy-duelist", textureURL: assetUrl("/art/enemy/duelist.png"), atlasURL: assetUrl("/art/enemy/duelist.atlas.json") },
  { kind: "atlas", key: "boss-warlord-attacks", textureURL: assetUrl("/art/boss/warlord-attacks.png"), atlasURL: assetUrl("/art/boss/warlord-attacks.atlas.json") },
  { kind: "atlas", key: "boss-warlord-lifecycle", textureURL: assetUrl("/art/boss/warlord-lifecycle.png"), atlasURL: assetUrl("/art/boss/warlord-lifecycle.atlas.json") },
];

export function queueRuntimeAssets(loader: Phaser.Loader.LoaderPlugin, manifest = RUNTIME_ASSET_MANIFEST) {
  for (const asset of manifest) {
    if (asset.kind === "image") loader.image(asset.key, asset.url);
    else if (asset.kind === "atlas") loader.atlas(asset.key, asset.textureURL, asset.atlasURL);
    else loader.bitmapFont(asset.key, asset.textureURL, asset.dataURL);
  }
}

export function createAssetFailureReporter(
  manifest = RUNTIME_ASSET_MANIFEST,
  report: (message: string) => void = message => console.error(message),
) {
  const keys = new Set(manifest.map(asset => asset.key));
  return (fileKey: string) => {
    if (keys.has(fileKey)) report(`Required runtime asset failed to load: ${fileKey}`);
  };
}
