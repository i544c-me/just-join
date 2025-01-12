import type { MessageOffscreen } from "../lib/common";

const audio = document.querySelector("audio");
chrome.runtime.onMessage.addListener(handleMessages);

async function handleMessages(message: MessageOffscreen) {
  if (message.target !== "offscreen") return true;

  switch (message.type) {
    case "ring":
      audio?.play();
      break;

    case "other":
      break;

    default:
      console.trace("Unknown message", message satisfies never);
  }

  return true;
}
