/*
  A personal and private manager to help get the recommended 30 plants per week:
  https://joinzoe.com/post/tim-spector-gut-tips
  There are loads of other links I could put in here, but Zoe (youtube and above website) is a very good one-stop place for food-health.

  Plant icon by https://www.iconpacks.net/free-icon/green-grow-plant-17105.html (author unknown)

  App created by StewVed (Stewart Robinson) in 2023, based upon my https://github.com/StewVed/calorieWatcher
  GlobalScripts have been merged into one file for this one, with only the bits needed (no sound for example)

TODO:
# Ability to add many plants in one go.
*/

var zAppPrefix = '30p'  /* Because localStorage uses the base domain not the exact page! */
  , d1 = '^*'           /* hopefully obscure enough that it'll never happen in a string! */
  , d2 = '#*'           /* as above. These are delimiters for seperating data. */
  , savedToday
  , todayList = []
  , addedPlantsList = []
;

function initContent() {
  return '<h1 id="titleHead">'
      + '<span style="color:rgb(255, 165, 0);">30</span>'
      + '<span style="color:rgb(0, 0, 205);font-style:italic;"> Plants</span>'
    + '</h1>'
    + '<h1 style="margin:0.3em 0em 0em 0em;">This week&apos;s plants: <span id="numPlants">00</span></h1>'
    + '<button id="t+" class="plantButton uButtonOrange" type="button"'
      + ' style="width:7em;font-size:1em;">New&nbsp;Week</button>'
    + '<div id="searchPane" style="overflow:hidden;position:relative;margin:0.5em;">'
        + '<input id="fdsrch" type="search" class="plantButton editEnable" style="z-index:1;position:relative;background:white;margin:0;width:100%;" placeholder="add Plant (search)">'
        + '<div id="searchPlants" class="letScroll" style="position:absolute"></div>'
      + '</div>'
    + '<div id="todayPane">'
      + '<div id="todayPaneInner" class="letScroll">'
        + '<div id="todayPanePlants" class="letScroll"></div>'
    + '</div>'
  ;
}

function runApp() {
  loadCSS();
  savedToday = (storageLoad('ThisWeek') || 0);
  //load the user's added plants
  savedPlantsLoad();
  // load the master plant list
  todayPopulate();
  countPlants();
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

  let regMatch = new RegExp('\\b'+toMatch, 'gi');

  //debugger;
  if (toMatch.length > 0) {
    // list user added plants first, so they are on the top of the list
    for (let x of addedPlantsList) {
      /*
      if (regMatch.test(addedPlantsList[x][1])) {
        searchList.push(addedPlantsList[x]); //copy the entire array entry
      }
      */
      searchList.push(searchListed(x));
    }
    //loop through all plants in the plantsList, and make an array of
    //matching plants
    for (let x of plantsList) {
      if (x[1].match(regMatch)) {
        searchList.push(searchListed(x));
      }
    }
  } else {
    //list everything not already listed this week:
    for (let x of addedPlantsList) {
      searchList.push(searchListed(x));
    }
    for (let x of plantsList) {
      searchList.push(searchListed(x));
    }
  }
  let listOfPlants = '';

  if (searchList.length || toMatch.length > 0) {
    //list the matching plants - this would be the same as populatePlants?
      for (let x in searchList) {
        let zListed = (searchList[x][0] === -1 ? 'zListed' : '');
        
        listOfPlants +='<div id="fl'
        + searchList[x][0]
        + '" class="plantList '+ zListed + ' letScroll">'
        + searchList[x][1] + '</div>'
      ;
    }

    listOfPlants +=
        '<div id="f+"'
      + ' class="plantButton uButtonGreen letScroll" style="width:7em;margin:0.5em auto;">'
      + 'Add&nbsp;New&nbsp;Plant</div>'
  }

  //add the list to the pane.
  document.getElementById('searchPlants').innerHTML = listOfPlants;
  //make the list scrollable
  upSetClass(document.getElementById('searchPlants'));
}

function searchListed(b) {
  for (let x of todayList) {
    if (x) {
       if (x[0] === b[0]) {
        return [-1,x[1]];
      }     
    }

  }
  return b;
}

function findPlantFromIndex(num) {
  //this is needed because the index number of the plant may
  //not be the arrays index number, say for instance when the
  //array has been sorted, or added to, or an element in the
  //array was deleted. the plant's individual number will remain.
  if (num >= 1000000) {
    for (let x in addedPlantsList) {
      if (addedPlantsList[x][0] == num) {
        return addedPlantsList[x]; //breaks out of the loop and returns, because no finally.
      }
    }
  }
  for (let x in plantsList) {
    if (plantsList[x][0] == num) {
      return plantsList[x]; //breaks out of the loop and returns, because no finally.
    }
  }

  //if it gets here then the plant was not found!
  debugger;
}
/*
function plantsListClick(targ) {
  //the index number is the individual number assigned to the plant.
  //this does not change.
  let indexNum = parseInt(targ.id.slice(2));

  //Create the add plant dialogue:
  let zId = indexNum + '_add'; //add the index number here so we know what do add later.

  //add stuff to it...
  let tmpArry = findPlantFromIndex(indexNum);

  let message =
    '<p style="margin:4px;font-size:2em;">Add plant to this week&apos;s list</p>'
    + '<H2>' + tmpArry[1] + ':</h2>'
    + '<button id="y" class="plantList diaButton uButtonGreen" type="button" style="clear:both;float:left;width:5em;">add</button>'
    + '<button id="b" class="plantList diaButton uButtonRed" type="button" style="float:right;width:5em;">Cancel</button>'
  ;

  dialogueMake(zId, message);
}
*/
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
  let a = (1000000 + addedPlantsList.length).toFixed()
    , b = document.getElementById('afName').value
  ;

  if (a && b) {
    //later, maybe add checking for this
    addedPlantsList.push([
        a /* alphabet-based index */
      , b /* name of plant (eg "Cucumber") */
    ]);

    savedPlantsSave();
    //plantSearch();
    searchBlur();
  }
  else {
    if (!b) {
      document.getElementById('afName').style.backgroundColor = 'hsla(0, 100%, 50%, .33)';
    }
  }
}

function savedPlantsLoad() {
  let savedPlants = storageLoad('SavedPlants');

  if (savedPlants) {
    let b = savedPlants.split(d1) ,c;

    for (let x = 0; x < (b.length - 1); x++) {
      c = b[x].split(d2);
      /* [148, "Coffee" */
      addedPlantsList.push([
          c[0] /* alphabet-based index*/
        , c[1] /* name of plant */
      ]);
    }
  }
}

function savedPlantsSave() {
  let toSave ='';// = todaysDate(); //today's date UTC milliseconds from 1970-01-01
  /* [148, "Coffee" */
  for (let x in addedPlantsList) {
    toSave += addedPlantsList[x][0] /* alphabet-based index */
       + d2 + addedPlantsList[x][1] /* name of plant */
       + d1
    ;
  }
  storageSave('SavedPlants', toSave);
}

function searchFocus() {
  //put the searchPane into the todayPane
  /*
  document.getElementById('todayPane').insertBefore(
    document.getElementById('searchPane')
    , document.getElementById('todayPaneInner')
  );
  */
    document.getElementById('searchPane').style.height =
    window.innerHeight
    - document.getElementById('searchPane').offsetTop + 'px';

  
  document.getElementById('fdsrch').focus();
  //hide the plant list panel
  document.getElementById('todayPaneInner').hidden = 'true';
  mouseClear();
}

function searchBlur(e) {
  if (document.getElementById('searchPlants').innerText.length > 0) {
    // clear the sear bar and it's results
    document.getElementById('fdsrch').value = '';
    document.getElementById('searchPlants').innerText = '';
    document.getElementById('searchPane').style.height = '';

    // Show the plant list panel
    document.getElementById('todayPaneInner').hidden = '';
    mouseClear();
  }
}
function todayCheck() {
  //check that the current list of plant is today.
  //if not, ask user if there as anything else
  //then copy the cals for the day, and add to 
  //the pastPane.
}


function todayPopulate() {
  //do similar to plantlist here!
  if (savedToday) {
    let b = savedToday.split(d1) ,c;
    /*
    if (b[0] != todaysDate()) {
      todayNew();
    }
    */

    // to save space, only save the indexNumof a plant
    //then find the plant in the plantlist, and populate todatList with
    //all of the details (ram should never be a problem!)

    for (let x = 0; x < (b.length - 1); x++) {
      c = b[x].split(d2);
      //find the plant from it's indexNum
      let tmpArry = findPlantFromIndex(parseInt(c[0]));

      //add the plant and it's stuff to todayList
      todayList.push([
         tmpArry[0] /* indexNum */
        ,tmpArry[1] /* plant's name */
      ]);
    }
  }

  let listOfPlants = '';

  if (todayList.length === 0) {
    if (typeof(Storage) !== 'undefined') {
      zNum = localStorage.length;
    }
    //check if there is anything stored
    if (!zNum) {
      listOfPlants += '<p id="localDataNotice">30 Plants uses your browser&apos;s'
       + ' Local Storage to remember your data; No data goes anywhere!</p>'
    }
  } else {
    // reverse the list so the oldest item is at the bottom.
    for (let x = todayList.length -1; x >= 0; x--) {
      //add to list.
      listOfPlants +='<div id="tl' + x + '" class="plantList letScroll">'
        + todayList[x][1] + '</div>'
      ;
    }
  }

  document.getElementById('todayPanePlants').innerHTML = listOfPlants;

  document.getElementById('fdsrch').addEventListener('click', searchFocus, false);
  document.getElementById('fdsrch').addEventListener('click', plantSearch, false);
  document.getElementById('fdsrch').addEventListener('input', plantSearch, false);
  //document.getElementById('fdsrch').addEventListener('blur', searchBlur);
}

function todayAdd(a) {
  //add the new plant into today's plant list
  //a is the plant's individual index number
  //b is the weight of the plant.

  //find the plant from it's indexNum
  let tmpArry = findPlantFromIndex(a);

  //add the plant and it's stuff to todayList
  todayList.push([
     tmpArry[0] /* indexNum */
    ,tmpArry[1] /* plant's name */
  ]);
  //
  let x = todayList.length - 1;
  //Create the added plant entry:
  let newElement = document.createElement('div');
  newElement.id = 'tl' + x; //add the index number here so we know what do add later.
  newElement.className = 'plantList letScroll';
  //add it to the top of the plantpane: (don't have to worry about null cos tis never empty)
  document.getElementById('todayPanePlants').insertBefore(
    newElement, document.getElementById('todayPanePlants').firstChild
  );
  //add stuff to the new entry
  newElement.innerHTML = todayList[x][1];

  if (document.getElementById('localDataNotice')) {
    document.getElementById('localDataNotice').parentNode.removeChild(
      document.getElementById('localDataNotice')
    );
  }
  searchBlur();
  todaySave();
  
  //plantSearch();
}

function todayRemove(a) {
  //delete the thing!
  delete todayList[a];
  //delete the plant from the plant list
  document.getElementById('tl' + a).parentNode.removeChild(
    document.getElementById('tl' + a)
  );
  //recalculate and save the updated list
  searchBlur();
  todaySave();
}

function todayEdit(a, b) {
  //
  todayList[a][5] = b;
  document.getElementById('tl' + a).innerHTML = todayList[a][1];

  todaySave();
}


function todaySave() {
  let toSave ='';// = todaysDate(); //today's date UTC milliseconds from 1970-01-01
  //just save the plant's indexNum and it's weight to save space.
  for (let x in todayList) {
    toSave += todayList[x][0] + d1;
  }
  storageSave('ThisWeek', toSave);
  countPlants();
}

function  countPlants() {
  // count how many plants are in the list:
  let a = document.getElementsByClassName('plantList letScroll').length;
  document.getElementById('numPlants').innerText = a.toString();
}

function todaysDate() {
  let a = new Date();
  //return today from midnight, so it remains the same until next day.
  return Date.UTC(a.getUTCFullYear().toString(), a.getUTCMonth().toString(), a.getUTCDate().toString());
}

function todayNew() {
  //add today's cals left to pastList and pastPane
  //save pastList, and blank then save todayList//, and todayDate

  savedToday = null;
  todayList = [];
  todaySave();
  todayPopulate();
}

function todayListClick(targ) {
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
    let zId = todayList[indexNum][0] + '_edit_' + indexNum; //add the index number here so we know what do add later.

    let message =
        '<H2>Edit ' + todayList[indexNum][1] + ':</h2>'
      //+ '<button id="a" class="plantButton diaButton uButtonGreen" type="button" style="clear:both;float:left;">Confirm</button>'
      + '<button id="b" class="plantButton diaButton uButtonOrange" type="button" style="clear:both;float:left;">Cancel</button>'
      + '<button id="r" class="plantButton diaButton uButtonRed" type="button" style="float:right;">Remove</button>'
    ;

    dialogueMake(zId, message);
  }
}

function dialogueMouseUp(targ) {
  //look only for the buttons:
  if (targ.id === 'y' || targ.id === 'n'
       || targ.id === 'e' || targ.id === 'a'
       || targ.id === 'b' || targ.id === 'r' || targ.id === 'c'
     ) {
    let zDialog = targ.parentNode; //only ever one element within the dialogue div
    if (targ.id === 'y') {
      //add to today's list, also recalculating today's calories
      todayAdd(
          parseInt(zDialog.id)
        , parseFloat(document.getElementById('addAmount').value)
      );
    } else if (targ.id === 'e') {
      //edit the seleted plant item's details
    } else if (targ.id === 'a') {
      //edit a list item on today's list
      todayEdit(
          zDialog.id.split('_')[2]
        , parseFloat(document.getElementById('addAmount').value)
      );
    } else if (targ.id === 'r') {
      //remove plant from todayPane and todayList
      todayRemove(zDialog.id.split('_')[2]);
    } else if (targ.id === 'n') {
      //New day dialogue confirmed
      todayNew();
    } else if (targ.id === 'c') {
      //New day dialogue confirmed
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
    if (targ.parentNode.parentNode.className) {
      zParentClass = targ.parentNode.parentNode.className;
    }
  }

  if (targ.id.slice(0, 2) === 'fl' || targ.id.slice(0, 2) === 'fi') {
    //plantsListClick(targ);
    let sf = parseInt(targ.id.slice(2));
    if (sf !== -1) {
      todayAdd(sf);
    }
  } else if (targ.id === 't+' || zParentID[0] == 'todayPaneInner' || zParentID[0] == 'todayPanePlants' || targ.id.slice(0, 2) === 'tl') {
    todayListClick(targ);
  } else if (zParentClass === 'dialog') {
    dialogueMouseUp(targ);
  } else if (targ.id === 'f+') {
    savedPlantDialog();
  }
}


function loadCSS() {
  let zCSS = document.createElement('style');
  zCSS.type = 'text/css';
  zCSS.innerText = '@keyframes Vom{0%{left:0}to{left:75%}}@keyframes popupBouncer{0%{top:100%}60%{top:-25%}to{top:0}}body,input{font-size:1em}body{box-sizing:border-box;overflow:hidden;font-family:sans-serif;margin:0}.plantButton{border:1px solid #000;cursor:pointer;padding:2px 12px;margin:.5em 0;border-radius:1em}.plantList,body,input{text-align:center}.zListed{opacity:33%}#todayPanePlants{margin:auto;}.plantList{box-sizing:border-box;font-family:cursive;margin:.3em;width:14em;display:inline-table}.dialog{z-index:3;text-align:center;position:absolute;width:100%;background:#fff;height:100%;padding:0 .5em;box-sizing:border-box}#titleHead{font-size:2.5em;margin:0;text-shadow:0 0 3px;background:#fff}#todayPane{position:relative;overflow:hidden;margin:0 .5em}#todayPaneInner{position:absolute;width:100%;text-align:left}ul{font-size:.8em;padding-left:1em}.B{font-weight:700}.C{text-align:center}.Re{color:red}.Gr{color:#0f0}.Bl{color:#00f}.Or{color:orange}.ubLink{font-weight:700;text-decoration:underline;transition:opacity .7s;opacity:.7;color:#000}.ubLink:hover{transition:opacity .3s;opacity:1}.uButtons{text-align:center;margin:.3em;padding:.1em .75em;color:#000;border:.1em solid #000;border-radius:5em;display:inline-block;font:inherit}.uButtonDisabled{background:linear-gradient(#ccc,#999);opacity:.5}.uButtonGrey{background:linear-gradient(#e6e6e6,#b3b3b3)}.uButtonGrey:hover{background:linear-gradient(#fff,#ccc)}.uButtonGrey:active{background:linear-gradient(#ccc,#999)}.uButtonGreen{background:linear-gradient(#80ff80,#090)}.uButtonGreen:hover{background:linear-gradient(#b3ffb3,#0c0)}.uButtonGreen:active{background:linear-gradient(#3f3,#060)}.uButtonOrange{background:linear-gradient(#ffe5b3,#c80)}.uButtonOrange:hover{background:linear-gradient(#fff7e5,#fa0)}.uButtonOrange:active{background:linear-gradient(#fc6,#960)}.uButtonRed{background:linear-gradient(#ff8080,#900)}.uButtonRed:hover{background:linear-gradient(#ffb3b3,#c00)}.uButtonRed:active{background:linear-gradient(#f33,#600)}.uButtonLeft{border-radius:5em 0 0 5em;margin-right:0;border-right:0}.uButtonMid,.uButtonRight{margin-left:0;border-left:0}.uButtonMid{border-radius:0;margin-right:0;border-right:0}.uButtonRight{border-radius:0 5em 5em 0}.uB15{width:15%}.fsInner{transform:scale(1.5,1);font-weight:bolder;display:inline-block;line-height:1em;margin-right:.2em}.settB{position:absolute;top:0;padding:.2em .5em .2em .4em;line-height:125%;font-size:125%;background-color:rgba(255,255,255,.5);border-bottom:2px solid #007fff;border-right:2px solid #007fff}#settCont,.settInner{position:absolute;box-sizing:border-box}#settCont{top:0;left:-100%;height:100%;width:100%;background-color:#fff;border-right:4px solid #007fff;transition:left .6s ease-out;text-align:center;z-index:24}.settInner{padding:1.5em .8em;width:inherit}.loadC,.loadPi{position:relative}.loadC{width:90%;margin:2px auto;border-radius:24px;border:2px solid gray;text-align:left}.loadPi{border-radius:inherit;height:24px;width:0%;background:linear-gradient(#cfc,#0c0)}#toastContainer,.loadPc{position:absolute;width:100%}.loadPc{border-radius:inherit;text-align:center;color:gray;font-weight:700;font-size:125%;line-height:24px;top:0}.loadVV{position:relative;float:none;animation:Vom .5s ease-in-out alternate infinite;width:25%;background:radial-gradient(farthest-side at 50% 50%,#0f0,rgba(255,0,0,0))}#toastContainer{bottom:0;box-sizing:border-box;z-index:64}#toastPopup{position:absolute;padding:1.5em;top:0;border-top:4px solid #007fff;animation:popupBouncer .5s ease-in-out;background-color:rgba(255,255,255,.95);background:#fff}.buttonClose{z-index:32;font-weight:700;padding:.05em .3em;font-size:1.5em;position:absolute;top:0;right:0}#toastPopup,#unp,.inputThingy{width:100%;box-sizing:border-box}#unp,.inputThingy{text-align:center}#unp{font-weight:700;overflow:hidden;position:relative;padding-bottom:1em;border-bottom:.2em solid #000;margin-bottom:1em}.inputThingy{clear:both;float:left;margin:0;padding:.2em;border:1px solid #000;border-radius:.3em;font-size:inherit}';
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
    let d = Math.floor(a/c);
    let e = ((d*c)+1) + 'px'
    
    document.getElementById('todayPanePlants').style.width = e;
  }
}

/* https://htmldom.dev/determine-the-height-and-width-of-an-element/ then modified */
function getTotalWidthOfElement(ele) {
  const styles = window.getComputedStyle(ele);
  return parseInt(ele.offsetWidth + Math.ceil(parseFloat(styles.marginLeft)) + Math.ceil(parseFloat(styles.marginRight)));
}
