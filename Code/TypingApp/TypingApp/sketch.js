let serial;
let latestData = "waiting for data";
let arduinoOutput = "";

let dataReady = false; // set to true once the first valid string is displayed

let finger1Val;
let finger2Val;
let finger3Val;
let finger4Val;
let inMotion;
let flexVal;
let flexAngle;
let highlighted = 0;
let selected = '';
let fingerPressThreshold = 300; 
let inputAllowed = false; 

let inEditMode = false;



let Caps = false;
let Shift = false;

let currentRow = 0;
let currentCol = 0;
let firstRowNormal = ['`','1','2','3','4','5','6','7','8','9','0','-','=', 'delete']
let secondRowNormal = ['tab','q','w','e','r','t','y','u','i','o','p','[',']', '\\']
let thirdRowNormal = ['caps lock','a','s','d','f','g','h','j','k','l',';','\'', 'enter']
let fourthRowNormal = ['lshift','z','x','c','v','b','n','m',',','.','/', 'rshift']
let fifthRowNormal = ['&nbsp;']

let firstRowShift = ['~','!','@','#','$','%','^','&','*','(',')','_','+', 'DELETE']
let secondRowShift = ['TAB','Q','W','E','R','T','Y','U','I','O','P','{','}', '|']
let thirdRowShift = ['CAPS LOCK','A','S','D','F','G','H','J','K','L',':','"', 'ENTER']
let fourthRowShift = ['LSHIFT','Z','X','C','V','B','N','M','&lt;','&gt;','?', 'RSHIFT']
let fifthRowShift = ['&nbsp;']


let firstRowCaps = ['`','1','2','3','4','5','6','7','8','9','0','-','=', 'DELETE']
let secondRowCaps = ['TAB','Q','W','E','R','T','Y','U','I','O','P','[',']', '\\']
let thirdRowCaps = ['CAPS LOCK','A','S','D','F','G','H','J','K','L',';','\'', 'ENTER']
let fourthRowCaps= ['LSHIFT','Z','X','C','V','B','N','M',',','.','/', 'RSHIFT']
let fifthRowCaps = ['&nbsp;']

//If wrist angle is < 0 or wrist angle is greater than 25 < 50  and greater than 50 highly at risk;



// let keyCodeActive = null;
// let pressedKey =  {
//     valueInternal: null,
//     valueListener: function(val) {},
//     set value(val) {
//       this.valueInternal = val;
//       this.valueListener(val);
//     },
//     get value() {
//       return this.valueInternal;
//     },
//     registerListener: function(listener) {
//       this.valueListener = listener;
//     }
// };


// // right now configured for snakes ijkl 
// pressedKey.registerListener(function(val) {
//     //console.log(val);
//     switch(val) {
//         case "left":
//             var evt = new KeyboardEvent('keydown', {'keyCode':74, 'which':74}); 
//             keyCodeActive = 74;
//             document.dispatchEvent (evt); 
//             break;
//         case "up":
//             var evt = new KeyboardEvent('keydown', {'keyCode':73, 'which':73}); 
//             keyCodeActive = 73;
//             document.dispatchEvent (evt); 
//             break;
//         case "right":
//             var evt = new KeyboardEvent('keydown', {'keyCode':76, 'which':76}); 
//             keyCodeActive = 76;
//             document.dispatchEvent (evt); 
//             break;
//         case "down":
//             var evt = new KeyboardEvent('keydown', {'keyCode':75, 'which':75}); 
//             keyCodeActive = 75;
//             document.dispatchEvent (evt); 
//             break;
//         case "a":
//             var evt = new KeyboardEvent('keydown', {'keyCode':32, 'which':32}); 
//             keyCodeActive = 32;
//             document.dispatchEvent (evt); 
//             break;
//         case "b":
//             var evt = new KeyboardEvent('keydown', {'keyCode':27, 'which':27}); 
//             keyCodeActive = 27;
//             document.dispatchEvent (evt); 
//             break;
//         default:
//             keyCodeActive = null;
//             break;
            
//     }
        
   
    
// });



function setup() {
    serial = new p5.SerialPort();

    serial.list();
    serial.open('COM4'); //change per your system

    serial.on('connected', serverConnected);

    serial.on('list', gotList);

    serial.on('data', gotData);

    serial.on('error', gotError);

    serial.on('open', gotOpen);

    serial.on('close', gotClose);

    noCanvas();
}




function parentWidth(elem) {
    return elem.clientWidth;
}



function serverConnected() {
    print("Connected to Server");
}

function gotList(thelist) {
    print("List of Serial Ports:");

    for (let i = 0; i < thelist.length; i++) {
        print(i + " " + thelist[i]);
    }
}

function gotOpen() {
    print("Serial Port is Open");
}

function gotClose(){
    print("Serial Port is Closed");
    latestData = "Serial Port is Closed";
}

function gotError(theerror) {
    print(theerror);
}

function gotData() {

    let currentString = serial.readLine();
    trim(currentString);
    if (!currentString) return;
    //console.log(currentString);
    latestData = "Getting Data";
    // only update our stored data if the string is valid
    if (validString(currentString)) {
        arduinoOutput = currentString;
        updateValues(); 
    }
}

// returns if the string is formatted correctly
// probably unneeded but added thanks to the values instilled in me by the great Professor John Lillis 
function validString(data) {
    let splitData = data.split('$');
    if (splitData.length != 7) {
        console.log("bad string length:" + splitData.length);
        return false;
    }

    for (let i = 0; i < splitData.length; i++) {   
        if (i < 4) { 
            if (isNaN(parseInt(splitData[i]))) {
                console.log("not an integer: " + splitData[i]);
                return false;
            }
        } else if (i == 4) {
            if (parseInt(splitData[i]) != 0 && parseInt(splitData[i]) != 1) {
                console.log("not a boolean: " + splitData[i] );
                return false;
            }
        } else {
            if (isNaN(parseFloat(splitData[i]))) {
                console.log("not a float: " + splitData[i] );
                return false;
            }
        }
        
        
    }

    // must be valid
    inputAllowed = true;
    return true;

}



function updateValues() {
    let splitData = arduinoOutput.split('$');
    finger1Val = parseInt(splitData[0]);
    finger2Val = parseInt(splitData[1]);
    finger3Val = parseInt(splitData[2]);
    finger4Val = parseInt(splitData[3]);
    inMotion = !!(parseInt(splitData[4]));
    flexVal = parseFloat(splitData[5]);
    flexAngle = parseFloat(splitData[6]);
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
// ignores input for 500 ms 
function ignoreInput() {
    inputAllowed = false;
    sleep(100000000).then(() => {inputAllowed = true;});
   
}




function handleInput() {
    // if all 4 fingers are down then we must switch modes
    if(inputAllowed){ 
        if (fingerPressed(finger1Val) && fingerPressed(finger2Val) && fingerPressed(finger3Val) && fingerPressed(finger4Val)) {
            // if for 1 second all 4 fingers are held down then change modes 
            let heldLongEnough = setTimeout( function() {
                return (fingerPressed(finger1Val) && fingerPressed(finger2Val) && fingerPressed(finger3Val) && fingerPressed(finger4Val));
            }, 1000)
            if (heldLongEnough) {
                inEditMode = !inEditMode;
                ignoreInput(); 
            }
        
        } 
        
        // regular mode code
        else if (!inEditMode && fingerPressed(finger1Val) && fingerPressed(finger2Val)) {
            selectLetter();
            ignoreInput();
        } else if (!inEditMode && fingerPressed(finger1Val)) {
            moveSelection('left');
            ignoreInput();
        } else if (!inEditMode && fingerPressed(finger2Val)) {
            moveSelection('up');
            ignoreInput();
        } else if (!inEditMode && fingerPressed(finger3Val)) {
            moveSelection('right');
            ignoreInput();
        } else if (!inEditMode && fingerPressed(finger4Val)) {
            moveSelection('down');
            ignoreInput();
        } 
        // edit mode code 
        else if (inEditMode && inMotion) {
            // move the cursor over
            moveHighlight(); 
            ignoreInput();
           
        } else if (inEditMode && fingerPressed(finger1Val)) {
            copySelection();
            ignoreInput();
        } else if (inEditMode && fingerPressed(finger2Val)) {
            pasteSelection();
            ignoreInput();
        } else if (inEditMode && fingerPressed(finger3Val)) {
            deleteSelection();
            ignoreInput();
        }
    }
    let carpelTunnelVal = document.querySelector('#carpelTunnelVal span');
    if(flexAngle > 50){
        carpelTunnelVal.innerHTML = 'Highly at Risk';
        carpelTunnelVal.classList.add ('red');
        carpelTunnelVal.classList.remove ('green');
        carpelTunnelVal.classList.remove ('yellow');


    }
    else if(flexAngle <= 50 && flexAngle > 25){
        carpelTunnelVal.innerHTML = 'Mildly at Risk'
        carpelTunnelVal.classList.remove ('red');
        carpelTunnelVal.classList.remove ('green');
        carpelTunnelVal.classList.add ('yellow');
    }
    else if(flexAngle <= 25 && flexAngle > 5){
        carpelTunnelVal.innerHTML = 'Not at Risk'
        carpelTunnelVal.classList.remove ('red');
        carpelTunnelVal.classList.add ('green');
        carpelTunnelVal.classList.remove ('yellow');
    }
    else{
        carpelTunnelVal.innerHTML = 'Not at Risk';
        carpelTunnelVal.classList.remove ('red');
        carpelTunnelVal.classList.add ('green');
        carpelTunnelVal.classList.remove ('yellow');
    }

    let modeVal = document.querySelector('#modeVal span');
    if(inEditMode){
        modeVal.innerHTML = "Edit Mode";
        //document.querySelector("#keyboardDiv").classList.add('overlayMode');
        let clipboard = document.querySelector('#clipboardVal');
        clipboard.classList.remove('screen');
        document.querySelector('#typeHelp').classList.add('screen');
        document.querySelector('#editHelp').classList.remove('screen');


    }
    else{
        modeVal.innerHTML = "Typing Mode";
        let clipboard = document.querySelector('#clipboardVal');
        clipboard.classList.add('screen');
        document.querySelector('#typeHelp').classList.remove('screen');
        document.querySelector('#editHelp').classList.add('screen');

    }
    
  
}

function fingerPressed(finger) {
    if (finger > fingerPressThreshold) {
        return true;
    }
    return false; 
}



function moveHighlight() {
    console.log(inMotion);
    let textArea =  document.getElementById('typingArea');
    highlighted += 1;

    if(highlighted > textArea.value.length){
        highlighted = 1;
    }
    
    textArea.focus();
    if (textArea.setSelectionRange) {
        textArea.setSelectionRange(textArea.value.length-highlighted, textArea.value.length);
      } else {
        textArea.select();
      }
      return;
}


function copySelection() {
    console.log('copySelection');
    let clipboard = document.querySelector('#clipboardVal span');

    let textArea =  document.getElementById('typingArea');
    let start = textArea.selectionStart;
    let finish = textArea.selectionEnd;
    selected = textArea.value.substring(start, finish);
    clipboard.innerHTML = selected;
}

function pasteSelection() {
    console.log('pasteSelection');
    let textArea =  document.getElementById('typingArea');
    textArea.value += selected;
    return;
}

function deleteSelection() {
    console.log('deleteSelection');
    let textArea =  document.getElementById('typingArea');
    let start = textArea.selectionStart;
    let finish = textArea.selectionEnd;
    let textToRemove = textArea.value.substring(start, finish);
    textArea.value = textArea.value.replace(textToRemove, '');
    return;
}




// function controlInterpreter() {
//     if (leftPressed) {
//         pressedKey.value = "left";
//     } else if (upPressed) {
//         pressedKey.value = "up";
//     } else if (rightPressed) {
//         pressedKey.value = "right";
//     } else if (downPressed) {
//         pressedKey.value = "down";
//     } else if (aPressed) {
//         pressedKey.value = "a";
//     } else if (bPressed) {
//         pressedKey.value = "b";
//     } else {
//         pressedKey.value = null;
//     }
// }

function draw() {
   
    handleInput();
    
}

// function closeGame() {
//     $('#exitGame').modal('show');
//     inExitDialog = true;
// }

// function exitOutOfGame() {
//     let modalToClose = gameModalIDs[currentModal];
//     inExitDialog = false;
//     $('#exitGame').modal('hide');
//     $(modalToClose).modal('hide');
//     inGame = false;

// }

// function returnToGame() {
//     inExitDialog = false;
//     $('#exitGame').modal('hide');

// }

// function wiggleGame() {

//     let games = document.querySelectorAll('#gamesDiv div');
//     let position;
//     games.forEach( (game, i) => {
        
//         if (game.classList.contains('selected')) {
//             position = i;
//         }
//     });

//     games[position].classList.add('wiggle');
//     badSelectSound.setVolume(.2);
//     badSelectSound.play();
//     setTimeout( function () {
//         games[position].classList.remove('wiggle');
//     }, 500);
// }


function moveSelection(direction) {


    let nextHorizontalPosition;
    let prevHorizontalPosition;
    let newHorizontalPosition; 

    let nextVerticalPosition;
    let prevVerticalPosition;
    let newVerticalPosition; 
    
    let currentlySelect = document.querySelector('#keyboard .selected');
    let currentLetter = currentlySelect.innerHTML;
    console.log(currentLetter);
    let letterFound = false;
    let currentLetterCol;
    let currentLetterRow;



    if(Shift){
        for(i =0; i < firstRowShift.length; i++){
            if(firstRowShift[i].toUpperCase() == currentLetter.toUpperCase() ){
                currentLetterCol = i;
                currentLetterRow = 0;
                letterFound = true;
                break;
            }
        }
        
        if(!letterFound){
            for(i =0; i < secondRowShift.length; i++){
                if(secondRowShift[i].toUpperCase()  == currentLetter.toUpperCase() ){
                    currentLetterCol = i;
                    currentLetterRow = 1;
                    letterFound = true;
                    break;
                }
            }
        }

        if(!letterFound){
            for(i =0; i < thirdRowShift.length; i++){
                if(thirdRowShift[i].toUpperCase()  == currentLetter.toUpperCase() ){
                    currentLetterCol = i;
                    currentLetterRow = 2;
                    letterFound = true;
                    break;
                }
            }
        }

        if(!letterFound){
            for(i =0; i < fourthRowShift.length; i++){
                if(fourthRowShift[i].toUpperCase()  == currentLetter.toUpperCase() ){
                    currentLetterCol = i;
                    currentLetterRow = 3;
                    letterFound = true;
                    break;
                }
            }
        }

        if(!letterFound){
            currentLetterCol = 0;
            currentLetterRow = 4;
        }
    }
    else{
            for(i =0; i < firstRowNormal.length; i++){
                if(firstRowNormal[i].toUpperCase() == currentLetter.toUpperCase() ){
                    currentLetterCol = i;
                    currentLetterRow = 0;
                    letterFound = true;
                    break;
                }
            }
            
            if(!letterFound){
                for(i =0; i < secondRowNormal.length; i++){
                    if(secondRowNormal[i].toUpperCase()  == currentLetter.toUpperCase() ){
                        currentLetterCol = i;
                        currentLetterRow = 1;
                        letterFound = true;
                        break;
                    }
                }
            }

            if(!letterFound){
                for(i =0; i < thirdRowNormal.length; i++){
                    if(thirdRowNormal[i].toUpperCase()  == currentLetter.toUpperCase() ){
                        currentLetterCol = i;
                        currentLetterRow = 2;
                        letterFound = true;
                        break;
                    }
                }
            }

            if(!letterFound){
                for(i =0; i < fourthRowNormal.length; i++){
                    if(fourthRowNormal[i].toUpperCase()  == currentLetter.toUpperCase() ){
                        currentLetterCol = i;
                        currentLetterRow = 3;
                        letterFound = true;
                        break;
                    }
                }
            }

            if(!letterFound){
                currentLetterCol = 0;
                currentLetterRow = 4;
            }
        }
    
        console.log('(' + currentLetterCol + ', ' + currentLetterRow + ')');
    
    


    nextHorizontalPosition = currentLetterCol +1;
    prevHorizontalPosition = currentLetterCol - 1;

    nextVerticalPosition = currentLetterRow +1;
    prevVerticalPosition = currentLetterRow - 1;

    if (currentLetterRow == 4) {
        nextVerticalPosition = 0;
    } 

    if (currentLetterRow == 0) {
        prevVerticalPosition = 4;
    }


   switch (currentLetterRow) {
            case 0:
                if (currentLetterCol == firstRowNormal.length-1) {
                    nextHorizontalPosition = 0;
                } 
            
                if (currentLetterCol == 0) {
                    prevHorizontalPosition = firstRowNormal.length-1;
                }
              break;
            case 1:
                if (currentLetterCol == secondRowNormal.length-1) {
                    nextHorizontalPosition = 0;
                } 
            
                if (currentLetterCol == 0) {
                    prevHorizontalPosition = secondRowNormal.length-1;
                }
              break;
            case 2:
                if (currentLetterCol == thirdRowNormal.length-1) {
                    nextHorizontalPosition = 0;
                } 
            
                if (currentLetterCol == 0) {
                    prevHorizontalPosition = thirdRowNormal.length-1;
                }
              break;
            case 3: 
                if (currentLetterCol == fourthRowNormal.length-1) {
                    nextHorizontalPosition = 0;
                } 
            
                if (currentLetterCol == 0) {
                    prevHorizontalPosition = fourthRowNormal.length-1;
                }
            break;
            case 4: 
                
                    nextHorizontalPosition = 0;   
                    prevHorizontalPosition = 0;
            break;
    }

    console.log(direction);
    if (direction == "left") {
        newHorizontalPosition = prevHorizontalPosition;
        newVerticalPosition = currentLetterRow;
    } else if (direction == "right") {
        newHorizontalPosition = nextHorizontalPosition;
        newVerticalPosition = currentLetterRow;
    }
    else if (direction == "up") {
        newVerticalPosition = prevVerticalPosition;
        newHorizontalPosition = currentLetterCol;
    } else {
        newVerticalPosition = nextVerticalPosition;
        if(newVerticalPosition == 2 && currentLetterCol == secondRowNormal.length-1){
            newHorizontalPosition = thirdRowNormal.length-1;
        }
        else if( newVerticalPosition == 3 && currentLetterCol == thirdRowNormal.length-1){
            newHorizontalPosition = fourthRowNormal.length-1;
        }
        else{
            newHorizontalPosition = currentLetterCol;
        }
       
    }

    

    let newLetterFound = false;
    let newLetter = '';
    if(Shift){
        if(newVerticalPosition == 0){
            for(i =0; i < firstRowShift.length; i++){
                if(i == newHorizontalPosition){          
                    newLetter = firstRowShift[i];
                    newLetterFound = true;
                    break;
                }
            }
        }
            

        if(!newLetterFound && newVerticalPosition == 1){
                for(i =0; i < secondRowShift.length; i++){
                    if(i == newHorizontalPosition){
                        newLetter = secondRowShift[i];
                        newLetterFound = true;
                        break;
                    }
                }
        }

        if(!newLetterFound && newVerticalPosition == 2){
            for(i =0; i < thirdRowShift.length; i++){
                if(i == newHorizontalPosition){
                    newLetter = thirdRowShift[i];
                    newLetterFound = true;
                    break;
                }
            }
        }

        if(!newLetterFound && newVerticalPosition == 3){
            for(i =0; i < fourthRowShift.length; i++){
                if(i == newHorizontalPosition){
                    newLetter = fourthRowShift[i];
                    newLetterFound = true;
                    break;
                }
            }
        }

        if(!newLetterFound && newVerticalPosition == 4){
            newLetter = fifthRowShift[0];
        }
    }
    else{
        if(newVerticalPosition == 0){
            for(i =0; i < firstRowNormal.length; i++){
                if(i == newHorizontalPosition){
                    if(Caps  && firstRowNormal[i].toUpperCase()){
                        newLetter = firstRowNormal[i].toUpperCase();
                    }
                    else{
                        newLetter = firstRowNormal[i];
                    }
                   
                    newLetterFound = true;
                    break;
                }
            }
        }
            

        if(!newLetterFound && newVerticalPosition == 1){
                for(i =0; i < secondRowNormal.length; i++){
                    if(i == newHorizontalPosition){
                        if(Caps && secondRowNormal[i].toUpperCase()){
                            newLetter = secondRowNormal[i].toUpperCase();
                        }
                        else{
                            newLetter = secondRowNormal[i];
                        }
                    newLetterFound = true;
                    break;
                    }
                }
        }

        if(!newLetterFound && newVerticalPosition == 2){
            for(i =0; i < thirdRowNormal.length; i++){
                if(i == newHorizontalPosition){
                    if(Caps && thirdRowNormal[i].toUpperCase()){
                        newLetter = thirdRowNormal[i].toUpperCase();
                    }
                    else{
                        newLetter = thirdRowNormal[i];
                    }
                newLetterFound = true;
                break;
                }
            }
        }

        if(!newLetterFound && newVerticalPosition == 3){
            for(i =0; i < fourthRowNormal.length; i++){
                if(i == newHorizontalPosition){
                    if(Caps && fourthRowNormal[i].toUpperCase()){
                        newLetter = fourthRowNormal[i].toUpperCase();
                    }
                    else{
                        newLetter = fourthRowNormal[i];
                    }
                newLetterFound = true;
                break;
                }
            }
        }

        if(!newLetterFound && newVerticalPosition == 4){
            newLetter = fifthRowNormal[0];
        }
    }
    console.log(newLetter);

    let keys = document.querySelectorAll('#keyboard li');
    for(let i = 0; i < keys.length; i++) {
        if(newLetter.toLowerCase() ){
            console.log(keys[i].innerHTML.toLowerCase())
            if(keys[i].innerHTML.toLowerCase() == newLetter.toLowerCase()){
                currentlySelect.classList.remove('selected');
                keys[i].classList.add('selected');
                break;
            }
        }
        else{
            if(keys[i].innerHTML == newLetter){
                currentlySelect.classList.remove('selected');
                keys[i].classList.add('selected');
                break;
            }
        }
        
    };

  
    

}

// function moveSelectionExit(direction) {

//     let games = document.querySelectorAll('#exitGame .modal-footer button');
//     let position;
//     let nextPosition;
//     let prevPosition;
//     let newPosition; 
    
//     games.forEach( (game, i) => {
        
//         if (game.classList.contains('selected')) {
//             position = i;
//         }
//     });


//     nextPosition = position +1;
//     prevPosition = position - 1;

//     if (position == 1) {
//         nextPosition = 0;
//     } 

//     if (position == 0) {
//         prevPosition = 1;
//     }

//     if (direction == "left") {
//         newPosition = prevPosition;
//     } else {
//         newPosition = nextPosition;
//     }

//     games[position].classList.remove('selected');
//     games[position].classList.add('selected-invisible');
    
//     games[newPosition].classList.add('selected');
//     games[newPosition].classList.remove('selected-invisible');

//     selectSound.setVolume(.3);
//     selectSound.play();
    

// }

function selectLetter() {
    let textArea =  document.getElementById('typingArea');
    let currentlySelect = document.querySelector('#keyboard .selected');
    let selectedText = currentlySelect.innerHTML;
    if(selectedText == 'caps lock'){
        if(Caps == false){
            Caps = true;
            currentlySelect.classList.add('selected-mode');
            setLetterCase(true);
        }
        else{
            currentlySelect.classList.remove('selected-mode');
            if(!Shift){
                setLetterCase(false);   
            }
            Caps = false;
        }
    }
    else if(selectedText == 'lshift' || selectedText == 'rshift'){
        if(Shift == false){
            document.querySelector('#keyboard .right-shift').classList.add('selected-mode');
            document.querySelector('#keyboard .left-shift').classList.add('selected-mode');
            Shift = true;
            setLetterCase(true);
            setSymbols(true);
          
           
        }
        else{
            document.querySelector('#keyboard .right-shift').classList.remove('selected-mode');
            document.querySelector('#keyboard .left-shift').classList.remove('selected-mode');
            Shift = false;
            if(!Caps){
                setLetterCase(false);
            }
            setSymbols(false); 
        }
    }
    else if(selectedText == 'delete' ){
        textArea.value = textArea.value.substring(0,textArea.value.length-1);
    }
    else if(selectedText == 'enter' ){
        textArea.value += '\r\n';
    }
    else if(selectedText == 'tab'){
        textArea.value += '\t';
    }
    else if(selectedText == '&nbsp;'){
        textArea.value += ' ';
    }
    else{
        textArea.value += currentlySelect.innerHTML;
        if(Shift){
            document.querySelector('#keyboard .right-shift').classList.remove('selected-mode');
            document.querySelector('#keyboard .left-shift').classList.remove('selected-mode');
            Shift = false;
            if(!Caps){
                setLetterCase(false);
            }
            setSymbols(false); 
        }
    }

}

function setLetterCase(upper){
    let letters = document.querySelectorAll('#keyboard .letter');
    if(upper){
        for(let i = 0; i < letters.length; i++){
            letters[i].innerHTML = letters[i].innerHTML.toUpperCase();
        }
    }
    else{
        for(let i = 0; i < letters.length; i++){
            letters[i].innerHTML = letters[i].innerHTML.toLowerCase();
        }         
    }
}

function setSymbols(normal){
    let symbols = document.querySelectorAll('#keyboard .symbol');
    console.log(symbols);
    if(normal){
        console.log('yes');
        for(let i = 0; i < symbols.length; i++){
            if(firstRowNormal.includes(symbols[i].innerHTML)){
                let ind = firstRowNormal.indexOf(symbols[i].innerHTML);
                symbols[i].innerHTML = firstRowShift[ind];
                console.log('firstRow');
            }
            else if(secondRowNormal.includes(symbols[i].innerHTML)){
                let ind = secondRowNormal.indexOf(symbols[i].innerHTML);
                symbols[i].innerHTML = secondRowShift[ind];
            }
            else if(thirdRowNormal.includes(symbols[i].innerHTML)){
                let ind = thirdRowNormal.indexOf(symbols[i].innerHTML);
                symbols[i].innerHTML = thirdRowShift[ind];
            }
            else if(fourthRowNormal.includes(symbols[i].innerHTML)){
                let ind = fourthRowNormal.indexOf(symbols[i].innerHTML);
                symbols[i].innerHTML = fourthRowShift[ind];
            }
        }
    }
    else{
        for(let i = 0; i < symbols.length; i++){
            if(firstRowShift.includes(symbols[i].innerHTML)){
                let ind = firstRowShift.indexOf(symbols[i].innerHTML);
                symbols[i].innerHTML = firstRowNormal[ind];
            }
            else if(secondRowShift.includes(symbols[i].innerHTML)){
                let ind = secondRowShift.indexOf(symbols[i].innerHTML);
                symbols[i].innerHTML = secondRowNormal[ind];
            }
            else if(thirdRowShift.includes(symbols[i].innerHTML)){
                let ind = thirdRowShift.indexOf(symbols[i].innerHTML);
                symbols[i].innerHTML = thirdRowNormal[ind];
            }
            else if(fourthRowShift.includes(symbols[i].innerHTML)){
                let ind = fourthRowShift.indexOf(symbols[i].innerHTML);
                symbols[i].innerHTML = fourthRowNormal[ind];
            }
        }
    }

   
}


function keyPressed() {
        switch (keyCode) {
            case 74:
                if (inEditMode) 
                    copySelection();
                else 
                    moveSelection('left');
                break;
            case 76:
                if (inEditMode)
                    pasteSelection();
                else
                    moveSelection('right');
                break;
            case 73:
                if (inEditMode)
                    deleteSelection();
                else                
                    moveSelection('up');
                break;
            case 75:
                if (inEditMode)
                    break; // no function for finger 4 in edit mode 
                else 
                    moveSelection('down');
                break;
            case 32:
                if (inEditMode)
                    break;
                else
                    selectLetter();
                break;
            case 27:
                inEditMode = !inEditMode; 
                break;
          }
  }


