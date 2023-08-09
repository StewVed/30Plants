/*
  A personal and private manager to help get the recommended 30 plants
  per week: https://joinzoe.com/post/tim-spector-gut-tips

  There are loads of other links I could put in here, but Zoe (youtube
  and above website) is a very good one-stop place for food-health.

  Plant icon by:
  https://www.iconpacks.net/free-icon/green-grow-plant-17105.html (author unknown)

  App created by StewVed (Stewart Robinson) in 2023, based upon my
  https://github.com/StewVed/calorieWatcher

  GlobalScripts have been merged into one file for this one, with only
  the bits needed (no sound for example)

TODO:
# Try alphabet reading down the coloumns, instead of along the rows.

*/

var zAppPrefix = '30p'  /* Because localStorage uses the base domain not the exact page! */
  , d1 = '^*'           /* hopefully obscure enough that it'll never happen in a string! */
  , d2 = '#*'           /* as above. These are delimiters for seperating data. */
  , weekStart = (storageLoad('weekStart') || 0)
  , weekList = []
  , addedPlantsList = []
;


function initContent() {
  return '<h1 id="titleHead">'
      + '<span style="color:rgb(255, 165, 0);">30</span>'
      + '<span style="color:rgb(0, 0, 205);font-style:italic;"> Plants</span>'
    + '</h1>'
    + '<h1 style="margin:0.3em 0em 0em 0em;">This week&apos;s plants: '
      + '<span id="numPlants">0</span>&nbsp;in&nbsp;<span id="numDays">0</span>&nbsp;days.'
    + '</h1>'
    + '<button id="t+" class="plantButton uButtonOrange" type="button"'
      + ' style="width:7em;font-size:1em;">New&nbsp;Week</button>'
    + '<div id="searchPane" style="overflow:hidden;position:relative;margin:0.5em;">'
        + '<input id="fdsrch" type="search" class="plantButton editEnable" style="z-index:1;position:relative;background:white;margin:0;width:100%;" placeholder="add Plant (search)">'
    + '</div>'
    + '<div id="todayPane">'
      + '<div id="todayPaneInner" class="letScroll">'
        + '<div id="todayPanePlants" class="letScroll"></div>'
    + '</div>'
  ;
}

function runApp() {  
  loadCSS();
  
  // how long has it been since the start of this week?
  if (weekStart) {
    
    // get the number of ms since 1/1/1970
    const dateNow = new Date().getTime();
    
    // amount of ms in a day
    const aDay = 86400000;

    // calculate the length of time between now and the week start
    const tLength = dateNow - weekStart;
    
    // how many days since the week start?
    let nDays = (Math.floor(tLength / aDay));
    
    // display the result
    document.getElementById('numDays').innerText = nDays.toString();
  }

  // load the user's added plants
  savedPlantsLoad();
  // load the saved plants for this week
  weekLoad();
  
  countPlants();  
  document.getElementById('fdsrch').addEventListener('click', searchFocus, false);
  document.getElementById('fdsrch').addEventListener('input', plantSearch, false);
}


function dialogueMake(zId, message) {
  let newElement = document.createElement('div');
  //newElement.id = zId //add the index number here so we know what do add later.
  newElement.className = 'dialog';
  //add it to the plantpane:
  document.body.appendChild(newElement);

  newElement.style.top =
    (document.getElementById('titleHead').offsetHeight - 2)
    + 'px';

  newElement.style.height =
    window.innerHeight
    - document.getElementById('titleHead').offsetHeight
    + 'px';

  newElement.innerHTML = '<div id="'+zId+'" style="width:fit-content;margin:auto;z-index:3">'+message+'</div>';

}


function plantSearch() {
  let toMatch = document.getElementById('fdsrch').value.toLowerCase()
    , searchList = []
  ;

  let regMatch = new RegExp(toMatch, 'gi');

  if (toMatch.length > 0) {
    // list user added plants first, so they are on the top of the list
    for (let x of addedPlantsList) {
      if (x.match(regMatch)) {
        searchList.push(searchListed(x));
      }
    }
    //loop through all plants in the plantList, and make an array of
    //matching plants
    for (let x of plantList) {
      if (x.match(regMatch)) {
        searchList.push(searchListed(x));
      }
    }
  } else {
    //list everything not already listed this week:
    for (let x of addedPlantsList) {
      searchList.push(searchListed(x));
    }
    for (let x of plantList) {
      searchList.push(searchListed(x));
    }
  }

  //Alphabetise the list:
  searchList.sort();
  
  let listOfPlants = '';

  if (searchList.length || toMatch.length > 0) {
    //list the matching plants - this would be the same as populatePlants?
      for (let x in searchList) {
        let zListed = '', zPlant = searchList[x]
          if (searchList[x].slice(-1) === '-') {
            zListed = 'zListed ';
            zPlant = searchList[x].slice(0,-1);
          }
        
        listOfPlants +='<div id="fl' + searchList[x]
        + '" class="plantList '+ zListed + 'letScroll">'
        + zPlant + '</div>'
      ;
    }

    listOfPlants +=
        '<div id="f+"'
      + ' class="plantButton uButtonGreen letScroll" style="width:7em;margin:0.5em auto;">'
      + 'Add&nbsp;New&nbsp;Plant</div>'
    ;
  }

  //add the list to the pane.
  document.getElementById('todayPanePlants').innerHTML = listOfPlants;
  //make the list scrollable
  //upSetClass(document.getElementById('searchPlants'));
}

function searchListed(b) {
  for (let x of weekList) {
    if (x) {
       if (x === b) {
         // add a - on the front of it so I know that plant is done this week.
         return  x + '-';
      }     
    }

  }
  return b;
}

function savedPlantDialog() {
  let message =
    '<p style="margin:4px;font-size:2em;">Add new plant to list</p>'

    + '<input type="text" id="afName" class="inputThingy editEnable" placeholder="Name of plant">'

    + '<button id="c" class="plantButton diaButton uButtonGreen" type="button" style="width:5em;clear:both;float:left;">Add</button>'
    + '<button id="b" class="plantButton diaButton uButtonRed" type="button" style="width:5em;float:right;">Cancel</button>'
  ;
  dialogueMake('addPlant', message);
}

function savedPlantAdd() {
  let a = document.getElementById('afName').value;

  //capitalize the first letter:
  a = a.charAt(0).toUpperCase() + a.slice(1);

  // change any ' in to &apos; because I use ' in my strings.
  let reg = new RegExp(/'/,'g');
  a = a.replace(reg,'&apos;');
  
  if (a) {
    //later, maybe add checking for this
    addedPlantsList.push(a);
    savedPlantsSave();
    searchBlur();
  }
  else {
    if (!a) {
      document.getElementById('afName').style.backgroundColor = 'hsla(0, 100%, 50%, .33)';
    }
  }
}

function savedPlantsLoad() {
  let a = storageLoad('SavedPlants');
  addedPlantsList = (a ? a.split(d1) : []);
}

function savedPlantsSave() {
  storageSave('SavedPlants', addedPlantsList.join(d1));
}

function searchFocus() {
  if (!document.contains(document.getElementById('dn'))) {
    // add a button to close the search and go back to the list.
    let newElement = document.createElement('div');
    newElement.id = 'dn';
    newElement.className = 'plantButton uButtonGreen';
    newElement.style.cssText = 'width:7em;margin:0.5em auto;text-align:center;';
    newElement.innerText = 'Done';
    //add it to the plantpane:
    document.getElementById('searchPane').appendChild(newElement);
  }
  
  document.getElementById('fdsrch').focus();
  mouseClear();
  plantSearch();
}

function searchBlur() {
  // clear the sear bar and it's results
  document.getElementById('fdsrch').value = '';
  if (document.contains(document.getElementById('dn'))) {
    document.getElementById('searchPane').removeChild(document.getElementById('dn'));
  }
  
  mouseClear();
  // repopulate this week's plant list:
  weekListPopulate();
}

function weekLoad() {
  a = storageLoad('ThisWeek');
  // split() is enough now that weekList is 1 dimension.
  weekList = (a ? a.split(d1) : []);
  
  weekListPopulate();
}


function weekListPopulate() {
  //reset the scroll of the list:
  document.getElementById('todayPaneInner').style.top = '0px';

  let listOfPlants = '';

  if (weekList.length === 0) {
    if (typeof(Storage) !== 'undefined') {
      zNum = localStorage.length;
    }
    //check if there is anything stored
    if (!zNum) {
      listOfPlants += '<p id="localDataNotice">30 Plants uses your browser&apos;s'
       + ' Local Storage to remember your data; No data goes anywhere!</p>'
    }
  } else {
    //Alphabetise the list:
    weekList.sort();
    
    for (let x in weekList) {
      //add to list.
      listOfPlants +='<div id="tl' + weekList[x] + '" class="plantList letScroll">'
        + weekList[x] + '</div>'
      ;
    }
  }

  document.getElementById('todayPanePlants').innerHTML = listOfPlants;

  
}

function weekListToggle(a) {
  //find the element
  let zElem = document.getElementById('fl' + a);

  // Is it already added?
  if (a.slice(-1) !== '-') {
    // add the new plant into today's plant list
    // grey out the selected plant, and add - to start of plant name
    let zElem = document.getElementById('fl' + a);
    zElem.classList.add('zListed');
    zElem.id = 'fl' + a + '-';
  
    // add the plant and it's stuff to weekList
    weekList.push(a);
  } else {
    //find index of the plant in the list
    let zPlant = weekList.indexOf(a.slice(0,-1));

    if (zPlant !== -1) {
      // take the plant back off the week list
      zElem.classList.remove('zListed');
      // remove the -
      zElem.id = 'fl' + a.slice(0,-1);
  
      //remove from the week list:
      weekList.splice(zPlant, 1);
    } else {
      //plant now found?!?!
      debugger;
    }
  }
 
  weekSave();
}

function todayRemove(a) {
  //delete the thing - use splice now that the length is used!
  let b = weekList.indexOf(a);
  if (b !== -1) {
    weekList.splice(b,1);
  
    searchBlur();
    weekSave();
  } else {
    //not found!
    debugger;
  }
}

function weekSave() {
  if (!weekStart) {
    // This is the first time the app has saved / browser cookies reset.

    // get the number of ms since 1970-01-01
    const dateNow = new Date().getTime();

    // save the number to calculate the length of time in later app launches.
    storageSave('weekStart', dateNow.toString());
  }
  
  // save the plant names. .join() method as weekList is now 1 dimension
  let toSave = weekList.join(d1);
  
  storageSave('ThisWeek', toSave);
  countPlants();
}

function  countPlants() {
  // count how many plants are in the list:
  // let a = document.getElementById('todayPanePlants').getElementsByClassName('plantList letScroll').length;
  document.getElementById('numPlants').innerText = weekList.length.toString();
}

function newWeek() {
  // empty the week list, reset the week start, save, reset display.
  weekList = [];
  weekStart = 0;
  weekSave();
  document.getElementById('todayPanePlants').innerHTML = '';
}

function weekListClick(targ) {
  if (targ.id === 't+') {
    //show dialogue to confirm new day.
    let message =
        '<H2>Confirm new week</h2>'
      + '<p>Do you want to begin a new week?'
      + '</p>'
      + '<button id="n" class="plantButton diaButton uButtonGreen" type="button" style="clear:both;float:left;">Confirm</button>'
      + '<button id="b" class="plantButton diaButton uButtonRed" type="button" style="float:right;">Cancel</button>'
    ;

    dialogueMake('new', message);
  } else if (targ.id.slice(0, 2) === 'tl') {
    //the index number is the individual number assigned to the plant.
    //this does not change.
    let indexNum = parseInt(targ.id.slice(2));

    //Create the aad plant dialogue:
    let zId = indexNum + '_edit_' + indexNum; //add the index number here so we know what do add later.

    let message =
      '<H2>remove ' + indexNum + '?</h2>'
      + '<button id="b" class="plantButton diaButton uButtonOrange" type="button" style="clear:both;float:left;">Cancel</button>'
      + '<button id="r" class="plantButton diaButton uButtonRed" type="button" style="float:right;">Remove</button>'
    ;

    dialogueMake(zId, message);
  }
}

function dialogueMouseUp(targ) {
  //look only for the buttons:
  if (targ.id === 'n'
      || targ.id === 'a' || targ.id === 'b'
      || targ.id === 'r' || targ.id === 'c'
     ) {
    let zDialog = targ.parentNode; //only ever one element within the dialogue div
    if (targ.id === 'r') {
      //remove plant from todayPane and weekList
      todayRemove(zDialog.id.split('_')[2]);
    } else if (targ.id === 'n') {
      //New day dialogue confirmed
      newWeek();
    } else if (targ.id === 'c') {
      //New plant dialogue confirmed
      savedPlantAdd();
    }
    //no matter the button pressed, close the dialogue:
    zDialog.parentNode.parentNode.removeChild(zDialog.parentNode);
  }
}

function mClick(targ) {
  let zParentID = ['--','--'];
  let zParentClass = '';

  if (targ.parentNode) {
    if (targ.parentNode.id) {
      zParentID = targ.parentNode.id.split('_');
    }
    if (targ.parentNode.parentNode) {
      if (targ.parentNode.parentNode.className) {
        zParentClass = targ.parentNode.parentNode.className;
      }
    }
  }

  if (targ.id.slice(0, 2) === 'fl') {
    weekListToggle(targ.id.slice(2));
  } else if (targ.id === 't+') {
    //show dialogue to confirm new day.
    let message =
        '<H2>Confirm new week</h2>'
      + '<p>Do you want to begin a new week?'
      + '</p>'
      + '<button id="n" class="plantButton diaButton uButtonGreen" type="button" style="clear:both;float:left;">Confirm</button>'
      + '<button id="b" class="plantButton diaButton uButtonRed" type="button" style="float:right;">Cancel</button>'
    ;

    dialogueMake('new', message);
  } else if (targ.id.slice(0, 2) === 'tl') {
    //the index number is the individual number assigned to the plant.
    //this does not change.
    let indexNum = targ.id.slice(2);

    //Create the aad plant dialogue:
    let zId = indexNum + '_edit_' + indexNum; //add the index number here so we know what do add later.

    let message =
        '<H2>Remove ' + indexNum + '?</h2>'
      //+ '<button id="a" class="plantButton diaButton uButtonGreen" type="button" style="clear:both;float:left;">Confirm</button>'
      + '<button id="b" class="plantButton diaButton uButtonOrange" type="button" style="clear:both;float:left;">Cancel</button>'
      + '<button id="r" class="plantButton diaButton uButtonRed" type="button" style="float:right;">Remove</button>'
    ;

    dialogueMake(zId, message);
  } else if (zParentClass === 'dialog') {
    dialogueMouseUp(targ);
  } else if (targ.id === 'f+') {
    savedPlantDialog();
  } else if (targ.id === 'dn') {
    searchBlur();
  }
}


function loadCSS() {
  let zCSS = document.createElement('style');
  zCSS.type = 'text/css';
  zCSS.innerText = '@keyframes Vom{0%{left:0}to{left:75%}}@keyframes popupBouncer{0%{top:100%}60%{top:-25%}to{top:0}}body,input{font-size:1em}body{box-sizing:border-box;overflow:hidden;font-family:sans-serif;margin:0}.plantButton{border:1px solid #000;cursor:pointer;padding:2px 12px;margin:.5em 0;border-radius:1em}.plantList,body,input{text-align:center}.zListed{opacity:33%}#todayPanePlants{margin:auto;}.plantList{box-sizing:border-box;font-family:cursive;font-size:large;margin:.3em;width:12em;display:inline-table}.dialog{z-index:3;text-align:center;position:absolute;width:100%;background:#fff;height:100%;padding:0 .5em;box-sizing:border-box}#titleHead{font-size:2.5em;margin:0;text-shadow:0 0 3px;background:#fff}#todayPane{position:relative;overflow:hidden;margin:0 .5em}#todayPaneInner{position:absolute;width:100%;text-align:left}ul{font-size:.8em;padding-left:1em}.B{font-weight:700}.C{text-align:center}.Re{color:red}.Gr{color:#0f0}.Bl{color:#00f}.Or{color:orange}.ubLink{font-weight:700;text-decoration:underline;transition:opacity .7s;opacity:.7;color:#000}.ubLink:hover{transition:opacity .3s;opacity:1}.uButtons{text-align:center;margin:.3em;padding:.1em .75em;color:#000;border:.1em solid #000;border-radius:5em;display:inline-block;font:inherit}.uButtonDisabled{background:linear-gradient(#ccc,#999);opacity:.5}.uButtonGrey{background:linear-gradient(#e6e6e6,#b3b3b3)}.uButtonGrey:hover{background:linear-gradient(#fff,#ccc)}.uButtonGrey:active{background:linear-gradient(#ccc,#999)}.uButtonGreen{background:linear-gradient(#80ff80,#090)}.uButtonGreen:hover{background:linear-gradient(#b3ffb3,#0c0)}.uButtonGreen:active{background:linear-gradient(#3f3,#060)}.uButtonOrange{background:linear-gradient(#ffe5b3,#c80)}.uButtonOrange:hover{background:linear-gradient(#fff7e5,#fa0)}.uButtonOrange:active{background:linear-gradient(#fc6,#960)}.uButtonRed{background:linear-gradient(#ff8080,#900)}.uButtonRed:hover{background:linear-gradient(#ffb3b3,#c00)}.uButtonRed:active{background:linear-gradient(#f33,#600)}.uButtonLeft{border-radius:5em 0 0 5em;margin-right:0;border-right:0}.uButtonMid,.uButtonRight{margin-left:0;border-left:0}.uButtonMid{border-radius:0;margin-right:0;border-right:0}.uButtonRight{border-radius:0 5em 5em 0}.uB15{width:15%}.fsInner{transform:scale(1.5,1);font-weight:bolder;display:inline-block;line-height:1em;margin-right:.2em}.settB{position:absolute;top:0;padding:.2em .5em .2em .4em;line-height:125%;font-size:125%;background-color:rgba(255,255,255,.5);border-bottom:2px solid #007fff;border-right:2px solid #007fff}#settCont,.settInner{position:absolute;box-sizing:border-box}#settCont{top:0;left:-100%;height:100%;width:100%;background-color:#fff;border-right:4px solid #007fff;transition:left .6s ease-out;text-align:center;z-index:24}.settInner{padding:1.5em .8em;width:inherit}.loadC,.loadPi{position:relative}.loadC{width:90%;margin:2px auto;border-radius:24px;border:2px solid gray;text-align:left}.loadPi{border-radius:inherit;height:24px;width:0%;background:linear-gradient(#cfc,#0c0)}#toastContainer,.loadPc{position:absolute;width:100%}.loadPc{border-radius:inherit;text-align:center;color:gray;font-weight:700;font-size:125%;line-height:24px;top:0}.loadVV{position:relative;float:none;animation:Vom .5s ease-in-out alternate infinite;width:25%;background:radial-gradient(farthest-side at 50% 50%,#0f0,rgba(255,0,0,0))}#toastContainer{bottom:0;box-sizing:border-box;z-index:64}#toastPopup{position:absolute;padding:1.5em;top:0;border-top:4px solid #007fff;animation:popupBouncer .5s ease-in-out;background-color:rgba(255,255,255,.95);background:#fff}.buttonClose{z-index:32;font-weight:700;padding:.05em .3em;font-size:1.5em;position:absolute;top:0;right:0}#toastPopup,#unp,.inputThingy{width:100%;box-sizing:border-box}#unp,.inputThingy{text-align:center}#unp{font-weight:700;overflow:hidden;position:relative;padding-bottom:1em;border-bottom:.2em solid #000;margin-bottom:1em}.inputThingy{clear:both;float:left;margin:0;padding:.2em;border:1px solid #000;border-radius:.3em;font-size:inherit}';
  document.head.appendChild(zCSS);
}

function resizeIt() {
    //make the todayPane go right to the bottom of the screen
  document.getElementById('todayPane').style.height =
    window.innerHeight
    - document.getElementById('todayPane').offsetTop + 'px';
  
  // how wide is the available area?
  let a = document.getElementById('todayPane').offsetWidth;
  // how wide is a single plant list element?
  let b = document.getElementById('todayPanePlants').getElementsByClassName('plantList letScroll')[0];
  if (b) {
    // how many times does the width divide by the available width?
    let c = getTotalWidthOfElement(b);
    let d = Math.floor(a/c) || 1;
    let e = ((d*c)+1) + 'px'
    
    document.getElementById('todayPanePlants').style.width = e;
  }
}


/* https://htmldom.dev/determine-the-height-and-width-of-an-element/ then modified */
function getTotalWidthOfElement(ele) {
  const styles = window.getComputedStyle(ele);
  return parseInt(ele.offsetWidth + Math.ceil(parseFloat(styles.marginLeft)) + Math.ceil(parseFloat(styles.marginRight)));
}
