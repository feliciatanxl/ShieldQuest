using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

namespace ShieldQuest.Editor
{
    /// Copies the shared art library (src/game/assets/pixellab) and neighbourhood.tmj into Resources,
    /// so both engines draw from one generated asset set. Runs on every editor load.
    [InitializeOnLoad]
    static class PixelLabSync
    {
        static readonly string RepoSrc = Path.GetFullPath(Path.Combine(Application.dataPath, "../../../../src/game"));
        const string Target = "Assets/Resources/PixelLab";

        static PixelLabSync() => Sync();

        [MenuItem("ShieldQuest/Sync PixelLab Assets")]
        public static void Sync()
        {
            var art = Path.Combine(RepoSrc, "assets/pixellab");
            if (!Directory.Exists(art)) { Debug.LogWarning("[PixelLabSync] Shared art not found at " + art); return; }
            var changed = false;
            foreach (var file in Directory.GetFiles(art, "*.png", SearchOption.AllDirectories))
                changed |= Copy(file, Path.Combine(Target, Path.GetRelativePath(art, file)));
            changed |= Copy(Path.Combine(RepoSrc, "maps/neighbourhood.tmj"), Path.Combine(Target, "neighbourhood.json"));
            if (changed) AssetDatabase.Refresh(ImportAssetOptions.ForceSynchronousImport);
        }

        static bool Copy(string from, string to)
        {
            if (File.Exists(to) && File.GetLastWriteTimeUtc(to) >= File.GetLastWriteTimeUtc(from)) return false;
            Directory.CreateDirectory(Path.GetDirectoryName(to)!);
            File.Copy(from, to, true);
            return true;
        }

        [MenuItem("ShieldQuest/Create Sunshine Estate Scene")]
        public static void CreateScene()
        {
            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene);
            new GameObject("Sunshine Estate").AddComponent<EstateBuilder>().enabled = true;
            Directory.CreateDirectory("Assets/Scenes");
            EditorSceneManager.SaveScene(scene, "Assets/Scenes/SunshineEstate.unity");
            EditorBuildSettings.scenes = new[] { new EditorBuildSettingsScene("Assets/Scenes/SunshineEstate.unity", true) };
        }
    }

    /// Pixel-art import settings: point filtering, no compression, 32 px per unit, bottom-centre pivot for props.
    class PixelLabImport : AssetPostprocessor
    {
        void OnPreprocessTexture()
        {
            if (!assetPath.Replace('\\', '/').Contains("Resources/PixelLab/")) return;
            var importer = (TextureImporter)assetImporter;
            importer.textureType = TextureImporterType.Sprite;
            importer.spriteImportMode = SpriteImportMode.Single;
            importer.filterMode = FilterMode.Point;
            importer.textureCompression = TextureImporterCompression.Uncompressed;
            importer.mipmapEnabled = false;
            importer.spritePixelsPerUnit = Iso.PixelsPerUnit;
            var settings = new TextureImporterSettings();
            importer.ReadTextureSettings(settings);
            var isObject = assetPath.Contains("/objects/");
            settings.spriteAlignment = (int)(isObject ? SpriteAlignment.BottomCenter : SpriteAlignment.Center);
            settings.spriteMeshType = SpriteMeshType.FullRect;
            importer.SetTextureSettings(settings);
        }
    }
}
