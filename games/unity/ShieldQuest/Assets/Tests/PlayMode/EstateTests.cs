using System.Collections;
using System.Linq;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;

namespace ShieldQuest.Tests
{
    public class EstateTests
    {
        EstateBuilder estate;

        [UnitySetUp]
        public IEnumerator Boot()
        {
            yield return null; // Bootstrap builds the estate after the test scene loads
            estate = Object.FindFirstObjectByType<EstateBuilder>() ?? new GameObject("Sunshine Estate").AddComponent<EstateBuilder>();
        }

        [UnityTearDown]
        public IEnumerator Clear()
        {
            foreach (var go in Object.FindObjectsByType<GameObject>(FindObjectsSortMode.None).Where(g => g.transform.parent == null && g.GetComponent<Camera>() == null))
                Object.Destroy(go);
            yield return null;
        }

        [Test]
        public void BuildsTheWholeEstateFromSharedArt()
        {
            Assert.That(estate.Size, Is.EqualTo(new Vector2(60, 54)));
            Assert.That(estate.GroundTiles, Is.EqualTo(60 * 54));
            Assert.That(estate.MissingSprites, Is.Empty, "sprites missing: " + string.Join(", ", estate.MissingSprites));
            Assert.That(estate.Collisions.Count(c => c.Kind == "block"), Is.EqualTo(28), "10 solid estate blocks and 18 beyond the edge; Blocks 102 and 110 have void decks");
            CollectionAssert.IsSubsetOf(new[] { "enter", "house-entrance", "house-h-entrance", "house-i-entrance", "may", "amir" }, estate.Hotspots.Select(h => h.Id).ToList());
        }

        [Test]
        public void Block110VoidDeckIsWalkableBetweenSolidPillars()
        {
            Assert.That(Iso.CanStand(new Vector2(12.2f, 35f), estate.Size, estate.Collisions), Is.True, "under the upper floors");
            var pillars = estate.Collisions.Where(c => c.Kind == "pillar" && c.Name == "Block 110").ToList();
            Assert.That(pillars.Count, Is.EqualTo(10), "a pillar on each of the five bay lines, front and back");
            foreach (var pillar in pillars)
                Assert.That(Iso.CanStand(new Vector2(pillar.X + pillar.W / 2, pillar.Y + pillar.D / 2), estate.Size, estate.Collisions), Is.False);
        }

        [Test]
        public void EveryDoorIsStandableAndInteractive()
        {
            foreach (var (id, door) in EstateBuilder.Doors)
            {
                Assert.That(Iso.CanStand(door.at, estate.Size, estate.Collisions), Is.True, id + " door is blocked");
                estate.Player.Teleport(door.at);
                Assert.That(estate.Player.Interact(), Is.True, id);
                Assert.That(estate.Player.LastInteraction, Is.EqualTo(id));
            }
        }

        [UnityTest]
        public IEnumerator PlayerWalksButCannotEnterBuildings()
        {
            var player = estate.Player;
            Assert.That(player.Position, Is.EqualTo(EstateBuilder.Start));
            for (var i = 0; i < 30; i++) { player.Step(Vector2.right, 1 / 30f); yield return null; }
            Assert.That(Vector2.Distance(player.Position, EstateBuilder.Start), Is.GreaterThan(1.5f), "player should move");
            // Run north-east into the HDB blocks for 4 seconds: collision must hold the whole way.
            for (var i = 0; i < 120; i++)
            {
                player.Step(new Vector2(1, -1), 1 / 30f, run: true);
                Assert.That(Iso.CanStand(player.Position, estate.Size, estate.Collisions), Is.True);
            }
            yield return null;
        }
    }
}
