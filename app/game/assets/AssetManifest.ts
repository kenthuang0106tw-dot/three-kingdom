import type * as Phaser from "phaser";

export type RuntimeAsset =
  | { readonly kind: "image"; readonly key: string; readonly url: string }
  | { readonly kind: "atlas"; readonly key: string; readonly textureURL: string; readonly atlasURL: string };

export const RUNTIME_ASSET_MANIFEST: readonly RuntimeAsset[] = [
  { kind: "image", key: "forest", url: "/scene/forest-camp.png" },
  { kind: "atlas", key: "guanyu-idle", textureURL: "/art/guanyu/guanyu-master.png", atlasURL: "/art/guanyu/guanyu-idle.atlas.json" },
  { kind: "atlas", key: "guanyu-walk", textureURL: "/art/guanyu/guanyu-walk.png", atlasURL: "/art/guanyu/guanyu-walk.atlas.json" },
  { kind: "atlas", key: "guanyu-attack", textureURL: "/art/guanyu/guanyu-combo-frames.png", atlasURL: "/art/guanyu/guanyu-attack.atlas.json" },
  { kind: "atlas", key: "enemy-soldier", textureURL: "/art/enemy/enemy-soldier.png", atlasURL: "/art/enemy/enemy-soldier.atlas.json" },
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
