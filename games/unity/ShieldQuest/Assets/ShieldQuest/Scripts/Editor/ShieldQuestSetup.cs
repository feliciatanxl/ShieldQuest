using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

namespace ShieldQuest.EditorTools
{
    /// <summary>Pixel-art import settings for everything under ShieldQuest/Resources.</summary>
    class PixelArtImporter : AssetPostprocessor
    {
        void OnPreprocessTexture()
        {
            if (!assetPath.Contains("/ShieldQuest/Resources/")) return;
            var ti = (TextureImporter)assetImporter;
            ti.textureType = TextureImporterType.Default; // sliced at runtime by CharacterSprites / NeighbourhoodBuilder
            ti.filterMode = FilterMode.Point;
            ti.textureCompression = TextureImporterCompression.Uncompressed;
            ti.mipmapEnabled = false;
            ti.npotScale = TextureImporterNPOTScale.None;
            ti.alphaIsTransparency = true;
            ti.wrapMode = TextureWrapMode.Clamp;
        }
    }

    public static class ShieldQuestSetup
    {
        const string ScenePath = "Assets/ShieldQuest/Scenes/Neighbourhood.unity";

        /// <summary>Creates the Neighbourhood scene with Unity's own serializer and adds it to Build Settings.</summary>
        [MenuItem("ShieldQuest/Create Neighbourhood Scene")]
        public static void CreateScene()
        {
            var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);
            new GameObject("Neighbourhood").AddComponent<NeighbourhoodBuilder>();
            EditorSceneManager.SaveScene(scene, ScenePath);
            EditorBuildSettings.scenes = new[] { new EditorBuildSettingsScene(ScenePath, true) };
            Debug.Log($"[ShieldQuest] Saved {ScenePath}. Press Play.");
        }

        /// <summary>Unity Web build copied into the React app's public/unity/Build (files ShieldQuest.*).</summary>
        [MenuItem("ShieldQuest/Build Web (into apps/web/public/unity)")]
        public static void BuildWeb()
        {
            PlayerSettings.WebGL.compressionFormat = WebGLCompressionFormat.Disabled; // Amplify/CloudFront compress; no Content-Encoding headers needed
            PlayerSettings.WebGL.decompressionFallback = false;
            PlayerSettings.WebGL.dataCaching = false; // avoid serving a stale cached .data after redeploys
            PlayerSettings.runInBackground = false;
            var outDir = System.IO.Path.GetFullPath("Builds/Web/ShieldQuest");
            var report = UnityEditor.BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { ScenePath },
                locationPathName = outDir,
                target = BuildTarget.WebGL,
                options = BuildOptions.None,
            });
            if (report.summary.result != UnityEditor.Build.Reporting.BuildResult.Succeeded)
                throw new System.Exception($"Web build failed: {report.summary.result}");
            var dest = System.IO.Path.GetFullPath("../../../apps/web/public/unity/Build");
            if (System.IO.Directory.Exists(dest)) System.IO.Directory.Delete(dest, true);
            System.IO.Directory.CreateDirectory(System.IO.Path.GetDirectoryName(dest));
            FileUtil.CopyFileOrDirectory(System.IO.Path.Combine(outDir, "Build"), dest);
            Debug.Log($"[ShieldQuest] Web build {report.summary.totalSize / 1024} KB -> {dest}");
        }
    }
}
