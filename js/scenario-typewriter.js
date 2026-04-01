// scenario-typewriter.js
// Single-shot typewriter: types one character at a time, no cursor, no loop, no delete.
// Returns a cancel function so re-entry can stop any in-progress animation.

function startScenarioTypewriter(el, text, speedMs, onComplete) {
  el.textContent = '';
  let i = 0;
  let timerId = null;

  function step() {
    if (i < text.length) {
      el.textContent += text[i++];
      timerId = setTimeout(step, speedMs);
    } else {
      timerId = null; // done
      if (typeof onComplete === 'function') onComplete();
    }
  }

  step();

  return function cancel() {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  };
}

window.startScenarioTypewriter = startScenarioTypewriter;
