

function TestSession() {

  this.sessionID = new Date().getTime();
  this.sessionInfo = getSessionInfo();
  this.votes = [];
  this.tracks = [];
  this.currentImage = "";

  // External methods
  this.showLF = {};
  this.hideLF = {};
  this.loadLF = {};
  this.preloadLF = {};
  this.showMenu = {};
  this.hideMenu = {};

  // External objects
  this.scene = {};
  this.menu = {};

  const states = ['welcome','dummies','training','evaluating'];
  const substates = ['viewing','voting'];

  this.state = 'welcome';
  this.substate = 'voting';

  this.permutation_n = 1;
  // DEBUG: DEMO
  //var permutations_log = readText('sessions/permutations.log');
  // if (permutations_log!=undefined){
  //   var n = Number(permutations_log[permutations_log.length-1]);
  //   this.permutation_n = n >= 25 ? 1 : n + 1;
  // }
  // else {
     permutations_log = [];
  // }
  permutations_log.push(this.permutation_n);
  //sendToServer(permutations_log,'permutations.log'); // Moved to the first stimulus

  Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
  }
  this.permutaions_file = 'Permutation-' + this.permutation_n.pad() + '.txt';

  this.training = readText('experiment/Training.txt');
  this.stimuli = readText('experiment/' + this.permutaions_file);
  this.dummies = [this.stimuli[this.stimuli.length-1],
                  this.stimuli[this.stimuli.length-2]];

  this.update = function() {
    // State machine
    switch (this.state) {
      case 'welcome':
        this.preloadLF([this.training[0]]);
        //this.hideMenu();
        //this.menu.welcome.visible = false;
        this.scene.remove(this.menu.welcome);
        //this.showLF();
        this.hideLF();
        this.state = 'training';
        this.scene.add(this.menu.training);
        break;
      case 'training':
        this.menu.training.visible = false;
        if (this.training.length){
          var image = this.training.shift();
          this.loadLF(image);
          if(this.training.length>=1){
            this.preloadLF([this.training[0]]);
          }
          else {
            this.preloadLF([this.dummies[0]]);
          }
          //this.showLF();
          console.log("Training: ",image);
        }
        else if (this.substate == 'voting') {
          this.hideLF();
          this.scene.add(this.menu.evaluating);
          this.substate = 'viewing';
        }
        else {
          if (this.dummies.length){
            var image = this.dummies.shift();
            this.loadLF(image);
            this.preloadLF([this.dummies[0]]);
            console.log("Dummy: ",image);
          }
          //this.showLF();
          this.menu.evaluating.visible=false;
          this.state = 'dummies';
        }
        break;
      case 'dummies':
        switch (this.substate) {
          case 'viewing':
            this.showMenu();
            this.substate = 'voting';
            break;
          case 'voting':
            if(this.menu.currentVote > 0) {
              this.hideMenu();
              if (this.dummies.length){
                var image = this.dummies.shift();
                this.loadLF(image);
                if (this.dummies.length>=1){
                  this.preloadLF([this.dummies[0]]);
                }
                else {
                  this.preloadLF([this.stimuli[0],this.stimuli[1]]);
                }
                this.substate = 'viewing';
                console.log("Dummy: ",image);
              }
              else {
                if (this.stimuli.length){
                  //sendToServer(permutations_log,'permutations.log'); // Save permutations
                  var image = this.stimuli.shift();
                  this.loadLF(image);
                  this.preloadLF([this.stimuli[0],this.stimuli[1]]);
                  this.substate = 'viewing';
                  console.log("Evaluating: ",image);
                }
                this.state = 'evaluating';
              }
            }
            break;
          default:
        }
        break;
      case 'evaluating':
        switch (this.substate) {
          case 'viewing':
            this.showMenu();
            this.substate = 'voting';
            break;
          case 'voting':
            if(this.menu.currentVote > 0) {
              this.hideMenu();
              console.log(this.currentImage,": Vote ",this.menu.currentVote);
              this.votes.push([this.currentImage,this.menu.currentVote]);
              if (this.stimuli.length){
                var image = this.stimuli.shift();
                this.loadLF(image);
                this.preloadLF([this.stimuli[0],this.stimuli[1]]);
                this.substate = 'viewing';
                console.log("Evaluating: ",image);
              }
              else {
                this.sessionInfo = getSessionInfo();
                this.saveOnServer();
                this.scene.add(this.menu.done);
                this.hideLF();
                this.state = 'done';
              }
            }
            break;
          default:
        }
        break;
      case 'done':
        break;
      default:
    }
  }

  this.clickOnScreen = function() {
    this.update();
    console.log("Session action. Current state: ",this.state,": ",this.substate);
  }

  this.saveOnServer = function () {
    //sendToServer(this.votes,this.sessionID + '_votes.csv',"Stimulus,Vote\n");
    //sendToServer(this.tracks,this.sessionID + '_tracks.csv',"Stimulus,Timestamp,x,y\n");
    //sendToServer(this.sessionInfo,this.sessionID + '_info.txt');
  }
  function sendToServer(arr,filename,text = "") {
    var data = new FormData();
    data.append("filename" , filename);
    arr.forEach(function(e) {
      text += e.toString() + '\n';
    });
    data.append("data" , text);
    var xhr = (window.XMLHttpRequest) ? new XMLHttpRequest() : new activeXObject("Microsoft.XMLHTTP");
    xhr.open( 'post', 'php/saveData.php', true );
    xhr.send(data);
  }

  function readText(url){
    var data;
    xhrDoc = new XMLHttpRequest();
    xhrDoc.open('GET', url, false);
    if (xhrDoc.overrideMimeType)
      xhrDoc.overrideMimeType('text/plain; charset=x-user-defined');
    xhrDoc.onreadystatechange = function()
    {
      if (this.readyState == 4)
      {
        if (this.status == 200)
        {
          data = this.response; //Here is a string of the text data
        }
      }
    }
    xhrDoc.send(); //sending the request
    var output = data.match(/[^\r\n]+/g);
    if (output && output.length) {
      return output;
    }
    else {
      return undefined;
    }
  }

  function getSessionInfo(){
    var agent = navigator.userAgent;
    var H = window.screen.availHeight;
    var W = window.screen.availWidth;
    var h = window.screen.height;
    var w = window.screen.width;
    return [['Agent',agent],['W','H',W,H],['w','h',w,h]];
  }

}
