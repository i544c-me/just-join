export default defineContentScript({
  matches: ['*://*.vrchat.com/*'],
  main() {
    console.log('Hello content.');
  },
});
