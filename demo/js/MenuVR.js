

function MenuVR ( position = new THREE.Vector3(14,10,0) ) {

  if ( !position instanceof THREE.Vector3 ) {
      console.error("ERROR: position must be instance of THREE.Vector3");
      return;
  }

  this.pos = position;

  this.currentVote = -1;
  this.isActive = false;

  this.votesList = ['Excellent','Good','Fair','Poor','Bad'];

  this.drawRetice = function () {
    var geometry = new THREE.CircleGeometry( 0.1, 32 );
    var material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
    //material.depthTest = false;
    var circle = new THREE.Mesh( geometry, material );
    circle.position.set(this.pos.x-5,this.pos.y,this.pos.z);
    //circle.rotation.y = -Math.PI/2;
    return circle;
  }

  this.drawMenuItem = function (pos_n,text='Menu item',selected = false) {
    var item_w = 5;
    var item_h = 1.5;

    var top = this.pos.y+item_h*5/2 - item_h/2;
    var item_y = top - pos_n*item_h;

  	var canvas1 = document.createElement('canvas');
  	var context1 = canvas1.getContext('2d');

    canvas1.width = item_w*50;
    canvas1.height = item_h*50;

    if (selected) {
      context1.fillStyle = "rgba(0,64,128,0.80)";
    }
    else {
      context1.fillStyle = "rgba(0,0,0,0.80)";
    }
    context1.fillRect(0, 0, canvas1.width, canvas1.height);

    context1.strokeStyle = "rgba(255,255,255,1.0)";
    context1.strokeRect(0, 0, canvas1.width, canvas1.height);

    context1.font = "30px Arial";
  	context1.fillStyle = 'white';
    context1.fillText(text, 15, 50);

  	// canvas contents will be used for a texture
  	var texture1 = new THREE.Texture(canvas1)
  	texture1.needsUpdate = true;

    var material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
    material1.transparent = true;

    var mesh1 = new THREE.Mesh(
      new THREE.PlaneGeometry(canvas1.width/50, canvas1.height/50),
        material1
      );
    mesh1.position.set(this.pos.x,item_y,this.pos.z);

    mesh1.name = text;

    //this.menu = new THREE.Mesh( geometry, material );
    //this.menu.name = 'MenuVR';
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
      mesh1.rotation.y = Math.PI;
    }
    else {
      mesh1.rotation.y = -Math.PI/2;
    }

    return mesh1;
  }

  this.createMenuTexture = function(text='Menu item',selected = false) {
    var item_w = 5;
    var item_h = 1.5;

    //var top = this.pos.y+item_h*5/2;
    //var item_y = top - pos_n*item_h;

  	var canvas1 = document.createElement('canvas');
  	var context1 = canvas1.getContext('2d');

    canvas1.width = item_w*50;
    canvas1.height = item_h*50;

    if (selected) {
      context1.fillStyle = "rgba(0,64,128,0.80)";
    }
    else {
      context1.fillStyle = "rgba(0,0,0,0.80)";
    }
    context1.fillRect(0, 0, canvas1.width, canvas1.height);

    context1.strokeStyle = "rgba(255,255,255,1.0)";
    context1.strokeRect(0, 0, canvas1.width, canvas1.height);

    context1.font = "30px Arial";
  	context1.fillStyle = 'white';
    context1.fillText(text, 15, 50);

  	// canvas contents will be used for a texture
  	var texture1 = new THREE.Texture(canvas1)
  	texture1.needsUpdate = true;

    return texture1;
  }

  this.welcome = this.drawMenuItem(2,   '     Welcome!      ');
  this.training = this.drawMenuItem(2,  '     Training!     ');
  //this.training.visible = false;
  this.evaluating = this.drawMenuItem(2,'    Evaluating!    ');
  //this.evaluating.visible = false;
  this.done = this.drawMenuItem(2,      '       Done!       ');
  this.loading = this.drawMenuItem(2,   '     Loading...    ');
  this.loading.visible = false;


  this.menuvr = new THREE.Object3D();
  for ( var i = 0; i < this.votesList.length; i++ ) {
    this.menuvr.add(this.drawMenuItem(i,this.votesList[i]));
  }

  this.menuvr.name = "MenuVR3D";


  this.showMenu = function (scene){
    scene.add(this.menuvr);
  }


  this.resetMenu = function () {
    this.menuvr = new THREE.Object3D();
    for ( var i = 0; i < this.votesList.length; i++ ) {
      this.menuvr.add(this.drawMenuItem(i,this.votesList[i]));
    }
  }

  this.update = function() {
    if(this.isActive) {
      // Ray casting for reticle
      var vector = new THREE.Vector3();
      vector.setFromMatrixPosition( camera.children[0].matrixWorld );
      vector.sub(camera.position);
      vector.normalize();
    	raycaster.set( camera.position, vector);

    	// Calculate objects intersecting the picking ray
      var menuObjects = scene.getObjectByName('MenuVR3D').children;
    	var intersects = raycaster.intersectObjects( menuObjects );

      for ( var i = 0; i < menuObjects.length; i++ ) {
        menuObjects[i].material.map = menuvr.createMenuTexture(menuObjects[i].name);
      }
      menuvr.currentVote = -1;

      if (intersects.length) {
        var name = intersects[0].object.name;
        intersects[0].object.material.map = menuvr.createMenuTexture(name,true);
        for ( var i = 0; i < menuvr.votesList.length; i++ ) {
          if(name == menuvr.votesList[i]){
            menuvr.currentVote = 5-i;
            break;
          }
        }
      }
    }
  }

};
