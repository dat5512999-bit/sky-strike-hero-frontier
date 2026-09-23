(function () {
  'use strict';
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).catch(function () {});
  }
  const card=document.getElementById('install-card'),action=document.getElementById('install-action'),dismiss=document.getElementById('install-dismiss'),copy=document.getElementById('install-copy');
  if(!card||matchMedia('(display-mode: standalone)').matches||navigator.standalone===true)return;
  let installPrompt=null;
  addEventListener('beforeinstallprompt',function(event){event.preventDefault();installPrompt=event;card.hidden=false;});
  action.addEventListener('click',async function(){
    if(installPrompt){installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;card.hidden=true;return;}
    card.hidden=true;
  });
  dismiss.addEventListener('click',function(){card.hidden=true;});
  const ios=/iPad|iPhone|iPod/.test(navigator.userAgent);
  if(ios){copy.textContent='點 Safari 的分享按鈕，再選「加入主畫面」。';action.textContent='知道了';card.hidden=false;}
  addEventListener('appinstalled',function(){card.hidden=true;});
})();
