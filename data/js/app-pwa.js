(function(global){
  'use strict';
  if(!('serviceWorker' in navigator)||!document.body.dataset.micrSurface)return;
  const script=new URL('sw.js',global.location.href);
  navigator.serviceWorker.register(script.pathname+'?v=20260904',{scope:new URL('./',global.location.href).pathname}).catch(()=>{});
})(window);
