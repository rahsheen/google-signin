export const loadScript = (cb: GlobalEventHandlers['onload']) => {
  const element = document.getElementsByTagName('script')[0];
  const fjs = element;
  const js = document.createElement('script');
  js.id = 'rahsheen-google-signin';
  js.src = 'https://apis.google.com/js/api.js';
  if (fjs && fjs.parentNode) {
    fjs.parentNode.insertBefore(js, fjs);
  } else {
    document.head.appendChild(js);
  }
  js.onload = cb;
};
