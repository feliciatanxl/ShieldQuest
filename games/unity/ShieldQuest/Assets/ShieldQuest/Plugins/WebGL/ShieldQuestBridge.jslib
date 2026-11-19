// Unity -> page channel. React's UnityMission listens for this event and validates the JSON.
mergeInto(LibraryManager.library, {
  ShieldQuestSendToPage: function (jsonPtr) {
    var json = UTF8ToString(jsonPtr);
    window.dispatchEvent(new CustomEvent('shieldquest:unity', { detail: json }));
  },
});
