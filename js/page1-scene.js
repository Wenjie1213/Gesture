// page1-scene.js
// Card-based scenario selection removed. Scenario page is now video-based.
// Stubs kept for any remaining references in app.js (_showPage stopGesture hook).

async function startGesture() {}
async function stopGesture() {}
function redrawCards() {}

function goExplore()    { return false; }
function goHowItWorks() { return false; }
function goAbout()      { return false; }

window.startGesture  = startGesture;
window.stopGesture   = stopGesture;
window.redrawCards   = redrawCards;
window.goExplore     = goExplore;
window.goHowItWorks  = goHowItWorks;
window.goAbout       = goAbout;
