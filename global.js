/* a single fine with all of the always used global code */

/* gevents.js */

function bubbleStop(e) {
  if (e.cancelable) {
    e.preventDefault();//stop browser doing it's default action.
    e.stopPropagation(); //stop the event bubbling
  }
}
function findTarget(e) {
  if (!e) {
    e = window.event;
  }
  var targ = e.target || e.srcElement;
  if (targ.nodeType != 1) {
    //element nodes are 1, attribute, text, comment, etc. nodes are other numbers... I want the element.
    targ = targ.parentNode;
  }
  return targ;
}
function findObject(e) {
/*
could I just use: boolean ctx.isPointInPath(path, x, y);
*/
  var ting = null;
  var mx = (Math.floor((e.clientX - document.getElementById('cont').offsetLeft) / gameVars.scale));
  var my = (Math.floor((e.clientY - document.getElementById('cont').offsetTop) / gameVars.scale));

  for (var x = 0; x < zObjects.length; x++) {
    if (
      (mx >= zObjects[x].x && 
      mx <= (zObjects[x].x + zSize))
      &&
      (my >= zObjects[x].y && 
      my <= (zObjects[x].y + zSize))
    ) {
      ting = x;
    }
  }
  return ting;
}
function findCloseButton(targ) {
  //if there is a close button, make sure it stays on-screen.
  var zElemChildList = targ.children;
  var zCloseButton = 0;
  for (var zChilds = 0; zChilds < zElemChildList.length; zChilds++) {
    if (zElemChildList[zChilds].id.toLowerCase().indexOf('close') != -1) {
      zCloseButton = zElemChildList[zChilds];
      break; //only ever have "close" on the close button!
    }
  }
  return zCloseButton;
}

function keyRedefine(theKey) {
  // left,up,right,down,A,B,X,Y   you can add more should your game require it.
  var theKey = keyNum(e);
  if (keysIgnore.indexOf(theKey) === -1) {
    bubbleStop(e);
    //simply add the newly pressed key into the WinKeys array.
    keyVars.push(theKey);
  }
}

function mouseClear() {
  if (mouseVars.clickTimer) {
    window.clearTimeout(mouseVars.clickTimer);
  }
  mouseVars = {
      button: null
    , type: null
    , cursorStyle: null
    , clickTimer: null
    , current:{target:null, time:null, x:null, y:null}
    , last:{target:null, time:null, x:null, y:null}
    , start:{target:null, time:null, x:null, y:null}
    , moved: 0
  }
  document.body.style.cursor = 'default';
}

function scrollClear() {
  scrollVars = {
    targ: null,
    leftDiff: null,
    TopDiff: null,
  }
}

function resizeCenter(a, b) {
  return Math.round((a / 2) - (b / 2));
}

function resize() {
  //regardless of height, always make the width correct:
  document.body.style.width = window.innerWidth + 'px';
  // call any custom resising code for the app
  resizeEvents();

  //prototype CSS transform for scale and centering:
  if (document.getElementById('contC')) {
    reScale();
    return;
  }
  //little fix for on-screen keyboards resizing screen space:
  if (document.activeElement.classList.contains('editEnable')) {
    //also could double-check by checking that the width hasn't changed:
    //if (document.body.offsetWidth === window.innerWidth) - if needed...

    /*
      attempt to keep the entire webapp visible...
      I will assume that document.body.offsetHeight will be correctly reported.
    */
    /*var zTop = resizeCenter(document.body.offsetHeight, document.getElementById('cont').offsetHeight);

    if (zTop < 0) {
      //make sure that the activeElement is visible.
      var zParentElem = document.activeElement.parentNode;
      var xTop = document.activeElement.offsetHeight + document.activeElement.offsetTop;
      while (zParentElem.id != 'cont') {
        xTop += zParentElem.offsetTop;
        zParentElem = document.activeElement.parentNode;
      }
    }
    document.getElementById('cont').style.top = zTop + 'px';
    */

    // different approach using scrollheight and scrollTo:
    let zHeight = document.body.offsetHeight - document.body.scrollHeight;
    if (zHeight < 0) {
      //document.activeElement.scrollIntoView();
    }
    return;
  }

  //maybe I should make the game bit a squre, then have the scores bit
  //however amount of space is left? what if the available area is square?
  //regardless, let's begin by finding the smallest size out of length and width:

  
  document.body.style.height = window.innerHeight + 'px';

  if (document.getElementById('cont')) {
    resizeSetSize(window.innerWidth)
  }

}

function resizeSetSize(num) {
  document.body.style.fontSize = (num * .002) + 'em';
  window.requestAnimationFrame(function() {
    resizeEvents();
    resizeCheckSize();
  });

}

function resizeCheckSize() {
    var zTop = resizeCenter(document.body.offsetHeight, document.getElementById('cont').offsetHeight);

    if (zTop < 0) {
      //Assume the overall aspect ratio of the container remains
      //the same, reduce the width of the container by the % that
      //it is over the window width.
      var cHeight = document.getElementById('cont').offsetHeight;
      var newWidth = document.getElementById('cont').offsetWidth  / (cHeight / window.innerHeight);
      document.getElementById('cont').style.width = newWidth + 'px';
      resizeSetSize(newWidth);
    } else if (
        (document.getElementById('cont').offsetWidth < (window.innerWidth * .95))
      && (document.getElementById('cont').offsetHeight < (window.innerHeight * .95))
      ) {
      var cWidth = document.getElementById('cont').offsetWidth;
      var newwidth = cWidth  / (cWidth / window.innerWidth);
      document.getElementById('cont').style.width = newwidth + 'px';
      resizeSetSize(newWidth);
    } else {
      resizeEnd();
    }
}

function resizeRatio(a, b) {
  //for fixed ratio apps - widescreen would be resizeRatio(16, 9) for example.
  var gWidth = document.body.offsetWidth;
  var gHeight = (gWidth / (a / b));
  if (gHeight > document.body.offsetHeight) {
  gHeight = document.body.offsetHeight;
  gWidth = gHeight * (a / b);
  }
  document.getElementById('cont').style.width = gWidth + 'px';
  document.getElementById('cont').style.height = gHeight + 'px';
}

function resizeEnd() {
  document.getElementById('cont').style.top = resizeCenter(document.body.offsetHeight, document.getElementById('cont').offsetHeight) + 'px';
  document.getElementById('cont').style.left = resizeCenter(document.body.offsetWidth, document.getElementById('cont').offsetWidth) + 'px';
}

function resizeCheckOrientation() {
    var a
  , b
  , portraitLayout;

  if (window.innerWidth > window.innerHeight) {
    a = window.innerHeight;
    b = window.innerWidth;
    portraitLayout = 0;
  }
  else {
    a = window.innerWidth;
    b = window.innerHeight;
    portraitLayout = 1;
  }

  return [a,b,portraitLayout];
}

function scroller(targ, zCloseButton, toScrollBy) {
  var stopNow = 0;
  var zTop = (targ.offsetTop + toScrollBy);
  var tcTop = targ.parentNode.offsetTop;
  var longest = document.body.offsetHeight - (targ.clientHeight + tcTop);//don't include border on targ.

  if (longest > zTop) {
    zTop = longest;
    stopNow = 1;
  }
  else if (zTop > 0) {
    zTop = 0;
    stopNow = 1;

  }

  targ.style.top = zTop + 'px';


  if (zCloseButton) {
    //check first in case browser blindly sets each time
    if (zTop < -tcTop) {
      if (zCloseButton.style.position != 'fixed') {
        zCloseButton.style.position = 'fixed';
      }
    }
    else if (zCloseButton.style.position != 'absolute') {
      zCloseButton.style.position = 'absolute';
    }
  }

  return stopNow;
}
function divScroller(targ, zCloseButton, zSpeed, zTime) {
  if (!targ || mouseVars.button) {
    //if the element no longer exists, there is nothing to do.
    return;
  }
  var tNow = new Date().getTime();
  var tDiff = (tNow - zTime) / 1000;
  var newSpeed = zSpeed;
  var toScrollBy = (zSpeed * tDiff);

  if ((tDiff > 0) && (zSpeed != 0) && (toScrollBy < 1 && toScrollBy > -1)) {
    //scroll speed is too slow. Just stop the scrolling animation.
    return;
  }

  if (toScrollBy > 1 || toScrollBy < -1) {
    if (scroller(targ, zCloseButton, toScrollBy)) {
      /*
        when hitting the top or bottom of the scroll,
        stop it scrolling any more.
      */
      newSpeed = 0;
    }
  }

  //now to calculate the next frame's scroll amount:
  if (tDiff) {
    /*
      NOTE:
      I've tried lots of different varients, but the scrolling up always takes longer than scrolling down
      I've given up tring to understand that, and just reversing the speed to compensate
      I am now just taking off a little more for scrolling up.
      Hopefully, that will prove about right no matter what browser is used!
    */
    if (newSpeed < 0) {
      newSpeed *= .925;
    } else {
      newSpeed *= .95;
    }
    //check for whether the newSpeed is going in the opposite direction
    if ((zSpeed > 0 && newSpeed < 0) || (zSpeed < 0 && newSpeed > 0)) {
      newSpeed = 0;
    }
  }
  if (newSpeed) {
    window.requestAnimationFrame(function() {
      divScroller(targ, zCloseButton, newSpeed, tNow)
    });
  }
}

// fullscreen handling from webtop then simplified for this project...
function fullScreenToggle() {
  var isFS = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
  if (isFS) {
    killFS.call(document, function() {});
    if (document.getElementById('fs')) {
      document.getElementById('fs').classList.remove('fsd')
      document.getElementById('fs').classList.add('fsu');
    }
  } else {
    getFS.call(document.documentElement, function() {});
    if (document.getElementById('fs')) {
      document.getElementById('fs').classList.remove('fsu')
      document.getElementById('fs').classList.add('fsd');
    }
  }
}


//Global slider stuff - should really be in their own file I think

function sliderMoveH() {
  //find the percentage of the the slider's left
  var zWidth = mouseVars.start.target.parentNode.offsetWidth;

  //go through all of the parentNodes and add their offsetLefts
  var zLeft = 0;
  var targParent = mouseVars.start.target.parentNode;
  //this should go all the way up to #document.
  while (targParent && isFinite(targParent.offsetLeft)) {
    //add this parent's offsetLeft to the total
    zLeft += targParent.offsetLeft;
    //move to the next parentNode:
    targParent = targParent.parentNode;
  }

  var sliderLeft = mouseVars.current.x - zLeft + 2;
  sliderLeft -= (mouseVars.start.target.offsetWidth / 2);
  var sliderPercent = [(sliderLeft / (zWidth - mouseVars.start.target.offsetWidth)) * 100];
  if (sliderPercent[0] < 0) {
    sliderPercent[0] = 0;
  } else if (sliderPercent[0] > 100) {
    sliderPercent[0] = 100;
  }
  //if this is a 2D slider, then add the perCent of that now:
  if (mouseVars.start.target.id.split('-')[1] === 'pan') {
    sliderPercent.push(sliderMoveV());
  }
  sliderUpdate(sliderPercent, 1);
}

function sliderMoveV() {
  //find the percentage of the the slider's top
  var zHeight = mouseVars.start.target.parentNode.offsetHeight;

  //go through all of the parentNodes and add their offsetTops
  var zTop = 0;
  var targParent = mouseVars.start.target.parentNode;
  //this should go all the way up to #document.
  while (targParent && isFinite(targParent.offsetTop)) {
    //add this parent's top to the total
    zTop += targParent.offsetTop;
    //move to the next parentNode:
    targParent = targParent.parentNode;
  }
  //calculate where the slider should be:
  var sliderTop = mouseVars.current.y - zTop + 2;
  //take half of the height of the target so it is in the middle:
  sliderTop -= (mouseVars.start.target.offsetHeight / 2);
  var sliderPercent = (sliderTop / (zHeight - mouseVars.start.target.offsetHeight)) * 100;
  //make sure the slider is not over the bounds of the parentNode.
  if (sliderPercent < 0) {
    sliderPercent = 0;
  } else if (sliderPercent > 100) {
    sliderPercent = 100;
  }
  return sliderPercent;
}
function sliderUpdate(sliderPercent, sve) {
  //recalculate to offset width of the slider iteself
  var zDiff = (mouseVars.start.target.parentNode.offsetWidth - mouseVars.start.target.offsetWidth) / mouseVars.start.target.parentNode.offsetWidth;
  mouseVars.start.target.style.left = Math.round(sliderPercent[0] * zDiff) + '%';

  if (sliderPercent.length === 2) {
    zDiff = (mouseVars.start.target.parentNode.offsetHeight - mouseVars.start.target.offsetHeight) / mouseVars.start.target.parentNode.offsetHeight;
    mouseVars.start.target.style.top = Math.round(sliderPercent[1] * zDiff) + '%';
  } else { //only color the slider button for 1D sliders.
    sliderColors(sliderPercent);
  }

  //hard-code for volume control in settings:
  if (mouseVars.start.target.id.split('-')[1] === 'vol') {
    //update the app's volume
    globVol = sliderPercent[0];
    if (audioVolume) {
      soundVolUpdate();
    }
    if (mouseVars.start.target.style.background.length && sve) {
      storageSave('volume', globVol.toFixed(2));
    }
  } else {
    //do specific things for different sliders:
    sliderEvents(sliderPercent, sve);
  }
}
function sliderColors(sliderPercent) {
  //change the color of the slider
  //var zNum = Math.round((240/100) * (100 - (sliderPercent[0]*100)));
  var zNum = Math.round(2.4 * (100 - sliderPercent[0]));
  var zBack = 'radial-gradient(farthest-side at 33% 33% , hsl(' + zNum +
  ',100%,90%), hsl(' + zNum + ',100%,55%), hsl(' + zNum + ',100%,33%))';

  mouseVars.start.target.style.background = zBack;
}

/*
  Let's try a new method or resizing...
  CSS Transform !!!
  this has two functions that I am very interested in:

  scale(x,y)
    This one is very interesing because I could render the app once,
    then use the scale function to make it the correct size depenging
    on the available screen size.

  translate(-50%,-50%)
    This seems to be a simple way of centering an element... like my
    app container ('Cont') for example.
    This would effectively replace all centering code.
    CAVEAT: when scaled, the translate has to the altered by the amount
    of translate scale applied. eg. scale(0.5) translate(-75%,-75%)
    - I'd be surprised if there wasn't some way of making it linked,
    but tis simple enough to take the scale amount and change the 
    translate amount.
*/

function reScale() {
  if (typeof initScreenWidth == 'undefined') {
    return;
  }
  //use this instead of resize() for making the app cneter and fill the available screen space.

  //now for the scaling itself.
  var xScale = window.innerWidth / initScreenWidth
    , yScale = window.innerHeight / initScreenHeight
  ;

  var zScale = (xScale <= yScale) ? xScale : yScale;
  var tScale = 50 / zScale;
  document.getElementById('contC').style.transform =
    'scale(' + zScale + ')'
  + ' translate(-' + tScale + '%,-' + tScale + '%)';

}



/* settings.js */

function settingsCreate() {
/*
  Generally, there is a hamburger on the top-left, though some people
  put it on the right. I think Google do the top left, and because
  they are so ubiquitus, I will choose to place my settings thing there.
*/
  var newElem1 = document.createElement('div');
  newElem1.id = 'sets';
  newElem1.classList = 'settB';
  newElem1.innerHTML = '&#9776;';
  document.body.appendChild(newElem1);

  // If this project has sound, add a global volume slider.
  var volControl = (typeof zVol != 'undefined') ? zVol : ''
    , newElem2 = document.createElement('div')
  ;
  newElem2.id = 'settCont';

  newElem2.innerHTML =
    //close button
    '<div id="setsClose" class="buttonClose">X</div>'
    + '<div id="settInner" class="settInner">'
    //fullscreen toggle button
    + '<div id="fs" class="uButtons uButtonGreen">'
      + '<span id="fsI" class="fsInner">&#9974;</span>&nbsp;Fullscreen'
    + '</div>'
    + '<br>'
    //volume slider:
    + volControl
    + '<br><div id="bPrivacy" class="uButtons uButtonGrey">Privacy</div>'
    + '<div id="bChange" class="uButtons uButtonGrey">webapp changeLog</div>'
    + appAbout
    + appBugs
    + '</div>'
    ;
  document.body.appendChild(newElem2);

  if (volControl) {
    //set the volume slider:
    mouseVars.start.target = document.getElementById('sli-vol-I');
    sliderUpdate([globVol], 0);
    //check whether muted or not.
    swapToggler('muteToggle');

  }

  //check for other things to go into the Settings panel
  if (window['settingsExtra']) {
    settingsExtra();
  }

  upSetClass(newElem2);

}

function settingsClose() {
  //move the settings element back offscreen to the left
  document.getElementById('settCont').style.transition = 'left .4s ease-in';
  document.getElementById('settCont').style.left = '';
  document.getElementById('settCont').style.boxSizing = '';
}
function settingsOpen() {
  document.getElementById('settCont').style.transition = '';
  document.getElementById('settCont').style.left = 0;
  document.getElementById('settCont').style.boxSizing = 'content-box';
}




/* gtexts.js */

var imgDummy = ' src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACAQMAAABIeJ9nAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAApJREFUCNdjAAIAAAQAASDSLW8AAAAASUVORK5CYII="'
  , appAbout =
  '<hr style=clear:both>'
  + '<img alt="The Author" src="data:image/jpeg;base64,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" '
  +'style="float:left;border-radius:0.7em;width:6em;margin:0 .5em .5em 0;">'
  + '<p style="text-align:justify;">'
    + 'Stewart Robinson (StewVed) is creating useful, fun, and educational '
    + 'web (HTML5) applications that are Free Open Source Software (FOSS).'
  + '</p>'
  + '<a href="https://stewved.github.io" target="blank">StewVed\s&nbsp;github&nbsp;website</a>'
  + ' '
  + '<a href="https://stewved.co.uk" target="blank">StewVed\'s&nbsp;main&nbsp;website</a>'

  
 ,  appAboutEx =
  '<p style="text-align:justify;">'
    + 'He has been coding since he was about 7 years old, though back '
    + 'then it was on a Sinclair ZX Spectrum (48k rubber keyboard) '
    + 'using BASIC code.'
  + '</p>'
  + '<p style="text-align:justify;">'
    + 'Years later, he fooled with VB.NET, and C#.NET as the .NET '
    + 'platform was supposed to be OS agnostic, though then he realised '
    + 'that the truly universal choice was the internet since every '
    + 'device has a browser, regardless of the OS it uses.'
  + '</p>'
  + '<p style="text-align:justify;">'
    + 'So, somewhere around 2010, he began learning internet developing '
    + 'from the internet, and has been creating applications for the '
    + 'web ever since!'
  + '</p>'

, appBugs =
  '<hr style=clear:both>'
  + '<h1 style=margin-bottom:.2em;font-size:1.25em>'
    + 'StewVed&apos;s standard notice:'
  + '</h1>'
  + '<p style=text-align:center;color:red;margin-top:0;line-height:1.5em;>'
    + 'Warning: May contain Bugs!<br>'
    + 'Cannot guarantee Bug free!<br>'
    + 'Produced on a system where Buggy products are also made!'
  + '</p>'

, appPrivacy =
    '<p style=text-align:center;>This app sends no data anywhere;<br>'
  + 'everything is calculated and stored entirely within your browser.<br><br>'
  + 'This also means if you clear the cache, any stored data is gone.<br><br>'
  + '</p>'

;




/* inputs.js */

/*
 * Ideally, I would have only two different tpes of input;
 * pointer (for touch and mouse)
 * gamepad for gamepads, and keybnoards
 *
 * having said that, I could make the mouse into a 3-button, 1 axis gamepad, and touches similar, but more axis and buttons.
 * and gamepads and keyboards could be used to move a pointer around too.
 *
 * Sensetivity should be adjustable, and axes and buttons would be configurable
*/
function gamePadUpdate() {
  var gamePads = navigator.getGamepads();
  for (var x = 0; x < gamePads.length; x++) {
    if (gamePads[x]) {
      //only add if the gamepad exists - NOT FOOLPROOF!
      //initialize/clear the gamePadVar
      gamePadVars[x] = [];
      //only shallow-copy the buttons and axes - don't need the rest (yet!)
      gamePadVars[x].buttons = gamePads[x].buttons.slice(0);
      gamePadVars[x].axes = gamePads[x].axes.slice(0);
    }
  }
}
function gamePadsButtonEventCheck() {
  //only worry about gamePadVar[0] for this version
  var oldButtons = []
  if (gamePadVars[0]) {
    //shallow-copy cos it is an (object) array:
    for (var x = 0; x < gamePadVars[0].buttons.length; x++) {
      oldButtons[x] = gamePadVars[0].buttons[x].pressed;
    }
  }
  gamePadUpdate();
  //if there is at least 1 gamepad being used:
  if (gamePadVars[0]) {
    //if there has been any change to the buttons:
    if (oldButtons.length === gamePadVars[0].buttons.length) {
      //cycle through the newButtons, comparing them to the oldButtons
      for (var x = 0; x < gamePadVars[0].buttons.length; x++) {
        if (oldButtons[x] !== gamePadVars[0].buttons[x].pressed) {
          if (gamePadVars[0].buttons[x].pressed) {
            gamePadsButtonDown(x);
          } else {
            gamePadsButtonUp(x);
          }
          anEvent();
        }
      }
    }
  }
  //because there are no events for a gamepad, I must check for them myself...

  if (gamePadVars[0]) {
    //use animationFrame when there is a gamepad being used.
    window.requestAnimationFrame(function() {
      gamePadsButtonEventCheck();
    });
  } else {
    //there are no current gamepads, so just check for a new one every second.
    window.setTimeout(function() {
      gamePadsButtonEventCheck();
    }, 1000);
  }
}
function keyNum(e) {
  return e.keyCode || window.event.keyCode;
}
function keyDown(e) {
  var theKey = keyNum(e);
  if (!document.activeElement.classList.contains('editEnable')) {
    if (keysIgnore.indexOf(theKey) === -1) {
      bubbleStop(e);
      //simply add the newly pressed key into the WinKeys array.
      keyVars.push(theKey);
      keyDownGameEvents(theKey);
      anEvent();
    }
  }
  else {
    //if user presses Return or Tab, remove input focus.
    if (theKey == 13 || theKey == 9) {
      bubbleStop(e);
      document.activeElement.blur();
    }
    else {
      keyDownEvents();
    }
  }
}
function keyUp(e) {
  var theKey = keyNum(e);
  if (!document.activeElement.classList.contains('editEnable')) {
    if (keysIgnore.indexOf(theKey) === -1) {
      bubbleStop(e);
      while (keyVars.indexOf(theKey) != -1) {
        //updates array length while delete() doesn't
        keyVars.splice(keyVars.indexOf(theKey), 1);
      }
      keyUpGameEvents(theKey);
      anEvent();
    }
  }
  else {
    keyUpEvents();
  }
}
function mouseDown(e) {
  var targ = findTarget(e);

  if (targ.id.slice(0, 4) === 'game') {
    gameVars.gameObject = findObject(e);
  }
  mouseVars.button = null == e.which ? e.button : e.which;
  mouseVars.type = 'click';
  mouseVars.clickTimer = window.setTimeout(function() {
    mouseLongClick()
  }, 500);
  mouseVars.current.target = targ;
  mouseVars.current.time = new Date().getTime();
  mouseVars.current.x = e.clientX;
  mouseVars.current.y = e.clientY;
  mouseVars.last.target = targ;
  mouseVars.last.time = new Date().getTime();
  mouseVars.last.x = e.clientX;
  mouseVars.last.y = e.clientY;
  mouseVars.start.target = targ;
  mouseVars.start.time = new Date().getTime();
  mouseVars.start.x = e.clientX;
  mouseVars.start.y = e.clientY;

  if (targ.classList.contains('editEnable')) {
    return;
  }

  bubbleStop(e);

  // if this project has tooltips then:
  if (typeof tooltipVars != 'undefined') {
    //look for tooltip
    if (targ.classList.contains('toolTipclass')) {
      tooltipVars.over = true;
      toolTipOver(targ.id);
      toolTipSort(targ.id, 1);
    }
  }

  //look for sliders here:
  var targSplit = targ.id.split('-');
  if (targ.id !== 'sli-pan-I') {
    if (targSplit[0] === 'sli') {
      //change the mouseType to slider.
      mouseVars.type = 'sli';
      //change the target to the slider's button
      mouseVars.start.target = document.getElementById('sli-' + targSplit[1] + '-I');
      //call the sliderMove function to begin moving the slider.
      sliderMoveH();
    }
  }

  mouseDownEvents();
  anEvent();
}
function mouseMove(e) {
  //make sure that only one mouse movement is done per frame to reduce cpu usage.
  if (mouseVars.moved) {
    return;
  }
  mMoved = 1;
  window.requestAnimationFrame(function() {
    mMoved = 0;
  });


  var zTime = new Date().getTime();

  var targ = findTarget(e);
  if (targ.id.slice(0, 4) === 'game') {
    gameVars.gameObjectLast = gameVars.gameObject;
    gameVars.gameObject = findObject(e);
  }

  if (mouseVars.current.target) {
    if (mouseVars.current.target.classList.contains('editEnable')) {
      mouseVars.current = {target:targ, time:zTime, x:e.clientX, y:e.clientY};
      return;
    }
  }

  bubbleStop(e);
  //check for onmouseout/onmousein events
  //if using canvas, check the game objects:
  if (targ.id.slice(0, 4) === 'game') {
    if (gameVars.gameObjectLast !== gameVars.gameObject) {
      if (mouseVars.type === 'click') {
        mouseVars.type = 'drag';
        window.clearTimeout(mouseVars.clickTimer);
      }
      mouseMoveEnter(targ);
      mouseMoveOut(targ);
    }
  }
  //now the mouse version
  else if (mouseVars.current.target !== mouseVars.last.target){
    if (mouseVars.type === 'click') {
      mouseVars.type = 'drag';
      window.clearTimeout(mouseVars.clickTimer);
    }
    mouseMoveEnter(targ);
    mouseMoveOut(targ);
  }

  //now onmouseover - this one is done always.
  mouseMoveOver(targ);
  //scroll the about/changelogs type dialogues
  if (mouseVars.type === 'scrollable' && (e.clientY != mouseVars.current.y)) {
    var framesPerSecond = (1000 / (scrollVars.time - mouseVars.current.time));
    var pixlesMoved = (mouseVars.current.y - scrollVars.y);
    var speedInPixelsPerSecond = pixlesMoved * framesPerSecond;

    //console.log(speedInPixelsPerSecond);
    if (pixlesMoved) {
      scroller(mouseVars.start.target, findCloseButton(mouseVars.start.target), pixlesMoved);
    }

    scrollVars.time = mouseVars.current.time;
    scrollVars.x = mouseVars.current.x;
    scrollVars.y = mouseVars.current.y;
  }
  //update the last mouse events - copy current to last
  mouseVars.last = {
      target:mouseVars.current.target
    , time:mouseVars.current.time
    , x:mouseVars.current.x
    , y:mouseVars.current.y};
  //then update current.
  mouseVars.current = {target:targ, time:zTime, x:e.clientX, y:e.clientY};

  // if this project has tooltips then:
  if (typeof tooltipVars != 'undefined') {
    if (targ.classList.contains('toolTipclass')) {
      toolTipOver(targ.id);
      toolTipMouseMove(e);
      tooltipVars.over = true;
    } else if (tooltipVars.over && !targ.classList.contains('ttElem')) {
      tooltipVars.over = false;
      toolTipHide();
    }
  }

  if (mouseVars.type === 'sli') {
    sliderMoveH();
    //volMove();
  } else if (mouseVars.type === 'click') {
    if (((mouseVars.start.x + 25) < e.clientX) || ((mouseVars.start.x - 25) > e.clientX) || ((mouseVars.start.y + 25) < e.clientY) || ((mouseVars.start.y - 25) > e.clientY)) {
      window.clearTimeout(mouseVars.clickTimer);
    //debugger;
      if (mouseVars.start.target.id === 'sli-pan-I') {
        //change the mouseType to slider.
        mouseVars.type = 'sli';
        //call the sliderMove function to begin moving the slider.
        sliderMoveH();
      }
      else {
        mouseVars.type = 'drag';
      }
    }
  }

  if (mouseVars.type === 'drag' && mouseVars.start.target) {
    if (mouseVars.start.target.classList.contains('letScroll')) {
      //there is currently only one scrolling element at the moment.
      mouseVars.start.target = findUpperScrollable(mouseVars.start.target);
      //the inner element may not be tall enough to require scrolling:
      if (mouseVars.start.target.offsetHeight > mouseVars.start.target.parentNode.offsetHeight) {
        mouseVars.type = 'scrollable';
        scrollVars.time = mouseVars.current.time;
        scrollVars.x = mouseVars.current.x;
        scrollVars.y = mouseVars.current.y;
      } else {
        mouseVars.type = 'notScrollable';
      }
    }
  }
  if (mouseVars.type === 'sgDrag') {
    tg_mMove(mouseVars.start.target, e)
    return;
  }

  mouseMoveEvents();
}
function mouseMoveVarsUpdate(targ) {
  mouseVars.current.target  = targ;
  mouseVars.current.time = zTime;
  mouseVars.current.x = e.clientX;
  mouseVars.current.y = e.clientY;
}

function mouseUp(e) {
  if (mouseVars.current.target == null || mouseVars.current.target.classList.contains('editEnable')) {
    return;
  }
  //if the pointer is not on an input, take the focus off of
  //the focused element. This should remove focus from input elements
  //when the user clicks off of them.
  document.activeElement.blur();

  bubbleStop(e);
  mouseUpEvents();
  //do any mouseup stuff here, eg. flinging or animated panning
  if (mouseVars.type == 'click') {
    if (mouseVars.button == 1) {
      mouseClick();
    } else if (mouseVars.button == 2) {
      mouseLongClick();
    }
  }

  if (mouseVars.button == 1) {
    if (mouseVars.type == 'scrollable' || mouseVars.type === 'scrolling') {
      //console.log('begin auto scroll...');
      var tNow = new Date().getTime();
      var framesPerSecond = (1000 / (scrollVars.time - mouseVars.current.time));
      var pixlesMoved = (mouseVars.current.y - scrollVars.y);
      var speedInPixelsPerSecond = pixlesMoved * framesPerSecond;
      //console.log(speedInPixelsPerSecond);

      if (pixlesMoved) {
        scroller(mouseVars.start.target, findCloseButton(mouseVars.start.target), pixlesMoved);
      }
      //speed should now be pixels per second, averaged over the last 5 frames.
      //console.log('average speed = ' + zSpeed);
      //mouseVars.start.target gets cleared, so make a seperate pointer.
      var targ = document.getElementById(mouseVars.start.target.id);
      var zCloseButton = findCloseButton(targ);
      window.requestAnimationFrame(function() {
        divScroller(targ, zCloseButton, -speedInPixelsPerSecond, tNow)
      });
    }
  }

  //check for tooltips in this project:
  if (typeof tooltipVars != 'undefined') {
    //tooltip stuff for touch and click support
    if (tooltipVars.over && vPup.style.opacity > 0 && !mouseVars.start.target.classList.contains('toolTipclass')) {
      toolTipStuffHide(mouseVars.start.target.id);
    } else if (mouseVars.start.target) {
      if (mouseVars.start.target.classList) {
        if (mouseVars.start.target.classList.contains('toolTipclass')) {
          //show tooltip immediatly
          toolTipShowNow(e, mouseVars.start.target.id);
        }
      }
    }
  }

  mouseClear();
  anEvent();
}
function mouseWheel(e) {//for zooming in/out, changing speed, etc.
  var targ = findTarget(e);
  if (targ.id.slice(0, 4) === 'game') {
    gameVars.gameObjectLast = gameVars.gameObject;
    gameVars.gameObject = findObject(e);
  }

  bubbleStop(e);

  var delta;
  if (e.deltaY) {
    delta = -e.deltaY;
    //seems like the main one
  } else if ('wheelDelta'in e) {
    delta = e.wheelDelta;
  } else {
    delta = -40 * e.detail;
    //fallback!
  }
  if (delta > 0) {
    delta = 1;
  } else {
    delta = -1;
  }

  // check for scrollable element and one who's height is taller than the parentNode's height
  if (targ.classList.contains('letScroll') && mouseVars.type != 'notScrollable') {
    targ = findUpperScrollable(targ);
    if (targ.offsetHeight > targ.parentNode.offsetHeight) {
      var zCloseButton = findCloseButton(targ);
      divScroller(targ, zCloseButton, delta*1000, new Date().getTime());
    } else {
      mouseVars.type = 'notScrollable';
      mouseWheelEvents(targ, delta);
    }
  }
  else {
    mouseWheelEvents(targ, delta);
  }

}

function mouseClick() {
  var targID = mouseVars.current.target.id;
  if (targID === 'toastClose') {
    upNotClose();
  } else if (targID === 'sets') {
    settingsOpen();
  } else if (targID === 'setsClose') {
    settingsClose();
  } else if (targID === 'bPrivacy') {
    upNotOpen('Privacy', appPrivacy);
  } else if (targID === 'bChange') {
    var updateButton = '';
    if (aSWR) {
      updateButton = '<button id="uSW" class="uButtons uButtonGreen"'
      + ' type="button"'
      + ' onclick="updateServiceWorkers()">Check for updates</button>'
    }

    upNotOpen('webapp changeLog<br>' + updateButton, appCL);
  } else if (targID === 'grdf') {
    reloadDrFreeman();// reload the webpage.
  } else if (targID === 'uSW') {
    updateServiceWorkers();// reload the webpage.
  } else if (targID.slice(0, 4) === 'stor') { //storage question.
    storageChoose(targID.slice(-1));
    upNotClose();
  } else if (targID === 'fsI' || targID === 'fs') {//fullscreen button
    fullScreenToggle();
  } else if (targID === 'muteToggle' || targID === 'pmuteToggle') {//toggle audio mute.
    MuteToggle();
  } else if (targID === 'playB') {//Play button press for apps with sound
    document.body.removeChild(document.getElementById('pB'));
    soundInit()
  } else {
    mouseClickEvents();
  }
}
function mouseLongClick() {//this is also the right-click.
//for right click, and long taps.
}
function touchChange(e) {
  return {
    button: 1,
    target: e.target,
    id: e.identifier,
    clientX: e.clientX,
    clientY: e.clientY,
    preventDefault: function() {},
    stopPropagation: function() {}
  };
  //return a new event object back with only the things I want in it :)
}
function touchDown(e) {
  var cTouches = e.changedTouches;
  for (var x = 0; x < cTouches.length; x++) {
    var zID = cTouches[x].identifier;
    touchVars[zID] = touchChange(cTouches[x]);
    //would overwrite existing event if a finger was not deleted - from aen error for example.
    if (touchVars[zID].target) {
      if (zID == 0) {
        if (!touchVars[zID].target.classList.contains('editEnable')) {
          bubbleStop(e);
          //should change the mouse cursor if needed.
          mouseDown(touchVars[zID]);
          //only do the mouse events on the first finger.
          //mouseMove(touchVars[zID]);
        }
      }
      else {
        bubbleStop(e);
      }
    }
  }
}
function touchMove(e) {
  bubbleStop(e);
  var cTouches = e.changedTouches;
  for (var x = 0; x < cTouches.length; x++) {
    var zID = cTouches[x].identifier;
    if (zID >= 0) {
      touchVars.splice(zID, 1, touchChange(cTouches[x]));
      // swap in the new touch record
    }

    if (zID == 0) {
      if (!touchVars[zID].target.classList.contains('editEnable')) {
        bubbleStop(e);
        //only do the mouse events on the first finger.
         mouseMove(touchVars[zID]);
      }
    }
    else {
      bubbleStop(e);
    }
  }
}
function touchUp(e) {
  var cTouches = e.changedTouches;
  //new array for all current events
  for (var x = 0; x < cTouches.length; x++) {
    var zID = cTouches[x].identifier;
    if (zID >= 0) {
      if (touchVars[zID]) {
        mouseMoveOut(touchVars[zID].target);
      } else {
        touchVars[zID].target = document.body;
      }

      if (zID == 0) {
        if (!touchVars[zID].target.classList.contains('editEnable')) {
          bubbleStop(e);
          mouseUp(touchVars[zID]);
        }
      } else {
        bubbleStop(e);
      }

      //should change the mouse cursor if needed.
      delete touchVars[zID];
    }
  }
}

function findUpperScrollable(targ) {
  /*
    Go through the parentNodes of the targ element,
    making a note of each element as we go,
    until we reach the outermost element that
    has 'letScroll' in its classList.
    Make targ that element.
  */
  if (targ.parentNode) {
    while (targ.parentNode.classList.contains('letScroll')) {
      targ = targ.parentNode;
      //check whether there is another parentNode!
      if (!targ.parentNode) {
        break;
      }
    }
  }
  return targ;
}



/* storage.js */

var saveY;
//use LS1 & LS2 for joining/splitting lines
function storageCheck() {
  try {
    if (localStorage) {
      if (localStorage.length) {
        //something is stored
        var dataToLoad = storageLoad('AllowSave');
        if (dataToLoad == 1) {
          //user has said YES to saving.
          saveY = 1;
        } else if (dataToLoad == 0) {
          //user has said NO to saving.
          saveY = -1;
        } else {
          //either there is nothing saved yet, or something is amiss!
          saveY = 0;
        }
      } else {
        saveY = 0;
      }
    }
    else {
      upNotOpen('localStorage appears to be unavailable in this browser. Unable to save anything.','');
      saveY = -1;
    }
  }
  catch(e) {
    upNotOpen('localStorage appears to be unavailable in this browser. Unable to save anything.','');
    saveY = -1;
  }
}
function storageChoose(zChoice) {
  if (zChoice === 'Y') {
    var a = saveY[0]
      , b = saveY[1];
    saveY = 1;
    storageSave('AllowSave', 1);
    storageSave(a, b);
  } else {
    //disable saving for this session.
    saveY = -1;
  }
  //later on if it is called for by anyone, I can add a 'never' save that disables saving, except for saving the preference to never save :D
  upNotClose();
}
function storageLoad(toLoad) {
  if (saveY !== -1) {
    var dataToLoad = '';

    try {
      dataToLoad = localStorage.getItem(zAppPrefix + toLoad);
    } catch (ex) {}

    return dataToLoad;
  }
}
function storageSave(toSave, dataToSave) {
  //ONLY save if if is 1
  if (saveY === 1) {
    localStorage.setItem(zAppPrefix + toSave, dataToSave);
  }//check whether this is the first time the user has saved something:
  else if (saveY === 0) {
    //nothing stored
    //check if the user has already got a notifyer yet:
    if (!document.getElementById('storY')) {
      //temporerily store the data in this variable.
      saveY = [toSave, dataToSave];
      upNotOpen('Would you like your browser to remember your preferences?<br><br>I respect your privacy: no data is sent anywhere; everything is done within your browser.<br><br><button id="storY" class="uButtons uButtonGreen" type="button " style="font-size:1.5em;width:30%;margin:.1em .2em;float:left;">Yes</button>' + '<button id="storN" class="uButtons uButtonRed" type="button" style="font-size:1.5em;width:30%;margin:.1em .2em;float:right;">No</button>','');
    }
  }
  //else stor is -1 which means the user has opted to not save anything.
}




/* initialize.js */

//cancel fullscreen:
var killFS = (document.exitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen || document.msExitFullscreen)
//kick up fullscreen:
, getFS = (document.documentElement.requestFullscreen || document.documentElement.mozRequestFullScreen || document.documentElement.webkitRequestFullscreen || document.documentElement.msRequestFullscreen)
//mousewheel event, based on the all-encompassing mozDev version
, mouseWheelType = 'onwheel' in document.createElement('div') ? 'wheel' : document.onmousewheel ? 'mousewheel' : 'DOMMouseScroll'
/*
 * Keys to ignore... alt-tab is annoying, so don't bother with alt for example
 * 16 = shift
 * 17 = Ctrl
 * 18 = Alt (and 17 if altGr)
 * 91 = windows key
 * 116 = F5 - browser refresh
 * 122 = F11 - Full Screen Toggle
 * 123 = F12 - Dev tools.
*/
, keysIgnore = [0, 16, 17, 18, 91, 116, 122, 123]
/*
  left,up,right,down,A,B,X,Y you can add more should your game require it.
*/
, keysDefault = {100:0, 101:1, 97:2, 98:3}
/*
  the currently used keys are loaded on init
*/
, keysCurrent = null
//Input events vars to hold the event info:
, inputType = null
//touch|gamePad|mouse|keyboard - depending on game type you could add GPS or whatever else HTML supports...
//Mouse:
, mouseVars = []
//Gamepad:
, gamePadVars = []
, gamepadReMap = [2, 3, 0, 1]
//keyboard:
, keyVars = []
//For touch-enabled devices
, touchVars = []
//vars to hold variables for the window
, gameWindow = null

, LS1 = '@#~'
, LS2 = '~#@'
, saveY = 0 //whether the user allows saving to HTML5 local storage
;

function Init() {
  //Add event listeners to the game element
  addEventListeners();
  //initialize the mouse event
  mouseClear();
  //initialize the scroll vars
  scrollClear();
  //window management vars - is this even needed any more?!?!
  gameWindow = {
    initWidth: 640
  , initHeight: 360
  , width: 0
  , height: 0
  , scale: 1
  };

  //check for saved data. If set, the user has chosen to either save or not save data.
  storageCheck();

  //for the moment, just use the default keyset:
  keysCurrent = parseFloat(storageLoad('keymap')) || keysDefault;

  //add the initContent function to the main project, and return
  //the html content of the app :)
  document.body.innerHTML = initContent();

  /*
    if this project has audio then:
    add the "play" button with a mute toggler to get around
    Google's decision to suspend a created audioContext
    instead of preventing/muting a play attempt!
  */
  if (typeof audioCtx != 'undefined') {
    //check if the user has modified the volume level if not, default to 54%:
    globVol = parseFloat(storageLoad('volume') || 54);
    //when the user activates the play button, runApp is called.
    playButton();
  }
  else {
    runApp();
    /*
      extra bit to center contC rescaling apps, because of all of the content is not
      all on the screen, it squashes up so that it all fits horizontally.
      it is set to -100% - fully off to the left on startup 
    */
    //if (typeof document.getElementById('contC') != 'undefined') {
    if  (document.getElementById('contC')) {
      document.getElementById('contC').style.left = '50%';
      document.getElementById('contC').style.top = '50%';
    }
  }

  // if this project has tooltips then:
  if (typeof tooltipVars != 'undefined') {
    //add the tooltip elements:
    tooltipsAdd();
  }

  //add my settings system to the project.
  settingsCreate();

  //scale the UI to the available screen size
  resize();

  //now that everything is set up, make a recurring checker for button presses:
  gamePadsButtonEventCheck();
}

function addEventListeners() {
  window.addEventListener('resize', resize, false);
  window.addEventListener('contextmenu', bubbleStop, false);
  window.addEventListener('dblclick', bubbleStop, false);
  window.addEventListener(mouseWheelType, mouseWheel, false);
  window.addEventListener('touchstart', touchDown, false);
  window.addEventListener('touchmove', touchMove, false);
  window.addEventListener('touchcancel', touchUp, false);
  window.addEventListener('touchend', touchUp, false);
  window.addEventListener('touchleave', touchUp, false);
  window.addEventListener('mousedown', mouseDown, false);
  window.addEventListener('mousemove', mouseMove, false);
  window.addEventListener('mouseup', mouseUp, false);
  window.addEventListener('keydown', keyDown, false);
  window.addEventListener('keyup', keyUp, false);
}

























/* my default avatar jpg image... have it in this file for faster loading */

var StewVedImg = 'data:image/jpeg;base64,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'