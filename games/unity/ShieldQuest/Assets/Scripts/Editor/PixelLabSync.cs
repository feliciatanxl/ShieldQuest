using System.IO;
using System;
using System.Security.Cryptography;
using System.Text;
using Newtonsoft.Json.Linq;
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

        static PixelLabSync() => EditorApplication.delayCall += Sync;

        [MenuItem("ShieldQuest/Sync PixelLab Assets")]
        public static void Sync()
        {
            var art = Path.Combine(RepoSrc, "assets/pixellab");
            if (!Directory.Exists(art)) { Debug.LogWarning("[PixelLabSync] Shared art not found at " + art); return; }
            if(!ExportsCurrent())return;
            var changed = false;
            foreach (var file in Directory.GetFiles(art, "*.png", SearchOption.AllDirectories))
                changed |= Copy(file, Path.Combine(Target, Path.GetRelativePath(art, file)));
            changed |= Copy(Path.Combine(RepoSrc, "maps/neighbourhood.tmj"), Path.Combine(Target, "neighbourhood.json"));
            changed |= Copy(Path.Combine(RepoSrc, "maps/amk-config.json"), Path.Combine(Target, "amk-config.json"));
            if (changed) AssetDatabase.Refresh(ImportAssetOptions.ForceSynchronousImport);
        }

        static bool ExportsCurrent()
        {
            var file=Path.Combine(Target,"shared-game.json");
            if(!File.Exists(file)){Debug.LogError("[PixelLabSync] Missing shared exports. Run npm run unity:export from the repository root.");return false;}
            try{
                var hashes=(JObject)JObject.Parse(File.ReadAllText(file))["sourceHashes"];
                if(hashes==null)throw new InvalidDataException("Source hashes missing");
                foreach(var entry in hashes.Properties()){
                    var source=Path.GetFullPath(Path.Combine(RepoSrc,"../..",entry.Name));
                    byte[] bytes=entry.Name.EndsWith(".png")?File.ReadAllBytes(source):Encoding.UTF8.GetBytes(File.ReadAllText(source).Replace("\r\n","\n"));
                    using var sha=SHA256.Create();var actual=BitConverter.ToString(sha.ComputeHash(bytes)).Replace("-","").ToLowerInvariant();
                    if(actual!=(string)entry.Value){Debug.LogWarning("[PixelLabSync] Phaser exports are stale: "+entry.Name+". Run npm run unity:export; keeping the last complete export together.");return false;}
                }
                return true;
            }catch(Exception e){Debug.LogWarning("[PixelLabSync] Could not verify shared exports: "+e.Message+". Run npm run unity:export.");return false;}
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
            importer.isReadable = assetPath.Contains("/generated/");
            importer.maxTextureSize = 4096;
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
