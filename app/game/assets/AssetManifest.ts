import type * as Phaser from "phaser";

export type RuntimeAsset =
  | { readonly kind: "image"; readonly key: string; readonly url: string }
  | { readonly kind: "atlas"; readonly key: string; readonly textureURL: string; readonly atlasURL: string };

export function resolveRuntimeAssetUrl(path: string, baseUrl?: string) {
  const documentBase = baseUrl ?? (typeof document === "undefined" ? undefined : document.baseURI);
  if (!documentBase) return path;
  return new URL(path.replace(/^\/+/, ""), documentBase).pathname;
}

const assetUrl = (path: string) => resolveRuntimeAssetUrl(path);

export const RUNTIME_ASSET_MANIFEST: readonly RuntimeAsset[] = [
  { kind: "image", key: "forest", url: assetUrl("/scene/forest-camp.png") },
  { kind: "atlas", key: "guanyu-idle", textureURL: assetUrl("/art/guanyu/guanyu-master.png"), atlasURL: assetUrl("/art/guanyu/guanyu-idle.atlas.json") },
  { kind: "atlas", key: "guanyu-walk", textureURL: assetUrl("/art/guanyu/guanyu-walk.png"), atlasURL: assetUrl("/art/guanyu/guanyu-walk.atlas.json") },
  { kind: "atlas", key: "guanyu-attack", textureURL: assetUrl("/art/guanyu/guanyu-combo-frames.png"), atlasURL: assetUrl("/art/guanyu/guanyu-attack.atlas.json") },
  { kind: "atlas", key: "enemy-soldier", textureURL: assetUrl("/art/enemy/enemy-soldier.png"), atlasURL: assetUrl("/art/enemy/enemy-soldier.atlas.json") },
  { kind: "atlas", key: "enemy-mauler", textureURL: assetUrl("/art/enemy/mauler.png"), atlasURL: assetUrl("/art/enemy/mauler.atlas.json") },
  { kind: "atlas", key: "enemy-duelist", textureURL: assetUrl("/art/enemy/duelist.png"), atlasURL: assetUrl("/art/enemy/duelist.atlas.json") },
  { kind: "atlas", key: "boss-warlord-attacks", textureURL: assetUrl("/art/boss/warlord-attacks.png"), atlasURL: assetUrl("/art/boss/warlord-attacks.atlas.json") },
  { kind: "atlas", key: "boss-warlord-lifecycle", textureURL: assetUrl("/art/boss/warlord-lifecycle.png"), atlasURL: assetUrl("/art/boss/warlord-lifecycle.atlas.json") },
];

export function queueRuntimeAssets(loader: Phaser.Loader.LoaderPlugin, manifest = RUNTIME_ASSET_MANIFEST) {
  for (const asset of manifest) {
    if (asset.kind === "image") loader.image(asset.key, asset.url);
    else loader.atlas(asset.key, asset.textureURL, asset.atlasURL);
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
