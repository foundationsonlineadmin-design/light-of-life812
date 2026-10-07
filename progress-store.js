(() => {
  const key = 'lol-discovery-progress-v2';
  const legacyKey = 'lol-discovery-progress-v1';
  const languageKey = 'lol-discovery-language-v1';
  const defaultGroupName = () => getLanguage() === 'hi' ? 'मेरा समूह' : 'My group';
  const newId = () => `group-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  function getLanguage() {
    try { return localStorage.getItem(languageKey) === 'hi' ? 'hi' : 'en'; }
    catch { return 'en'; }
  }
  function setLanguage(lang) {
    try { localStorage.setItem(languageKey, lang === 'hi' ? 'hi' : 'en'); } catch {}
  }
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || 'null');
      if (saved && Array.isArray(saved.groups) && saved.groups.length) {
        saved.groups = saved.groups.map(group => ({
          id: String(group.id || newId()),
          name: String(group.name || defaultGroupName()),
          completed: group.completed && typeof group.completed === 'object' ? group.completed : {}
        }));
        if (!saved.groups.some(group => group.id === saved.activeGroupId)) saved.activeGroupId = saved.groups[0].id;
        return saved;
      }
    } catch {}

    let completed = {};
    try {
      const legacy = JSON.parse(localStorage.getItem(legacyKey) || '{}');
      if (legacy && typeof legacy === 'object' && !Array.isArray(legacy)) completed = legacy;
    } catch {}
    return { activeGroupId: 'group-default', groups: [{ id: 'group-default', name: defaultGroupName(), completed }] };
  }
  function save(data) {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
  }
  function getData() {
    const data = load();
    save(data);
    return data;
  }
  function activeGroup(data = getData()) {
    return data.groups.find(group => group.id === data.activeGroupId) || data.groups[0];
  }
  function setActiveGroup(id) {
    const data = getData();
    if (data.groups.some(group => group.id === id)) data.activeGroupId = id;
    save(data);
  }
  function createGroup(name) {
    const cleanName = String(name || '').trim().slice(0, 60);
    if (!cleanName) return false;
    const data = getData();
    const group = { id: newId(), name: cleanName, completed: {} };
    data.groups.push(group);
    data.activeGroupId = group.id;
    save(data);
    return true;
  }
  function getProgress() { return activeGroup().completed; }
  function toggle(key) {
    const data = getData();
    const group = activeGroup(data);
    if (group.completed[key]) delete group.completed[key];
    else group.completed[key] = true;
    save(data);
    return !!group.completed[key];
  }

  window.progressStore = { getLanguage, setLanguage, getData, activeGroup, setActiveGroup, createGroup, getProgress, toggle };
})();
