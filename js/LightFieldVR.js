

function LightFieldVR(renderer,scene,camera,testSession,menuvr) {
  var that = this;
  this.lfPlane = {};

  // LF Textures
  this.lfSpriteTexture = [];
  this.images_folder = 'lfimages/';
  this.lf_image_name = 'I03P1R1';
  this.lfTextueLoaded1 = false;
  this.lfTextueLoaded2 = false;

  // LF image properties
  this.dx = 0.10;
  this.dy = 0.06;
  this.num_views_x = 9;
  this.num_views_y = 9;
  this.num_views = this.num_views_x*this.num_views_y;
  // Number of central view in 0..(num_views-1) range
  this.centr_view = Math.floor(this.num_views_x/2)+Math.floor(this.num_views_y/2)*this.num_views_x;

  // Texture tiles properties
  this.tiles_x = 6;
  this.tiles_y = 9;
  this.tiles = this.tiles_x*this.tiles_y;
  this.num_textures = Math.ceil(this.num_views/this.tiles);
  this.end_tiles_y = Math.ceil((this.num_views%this.tiles)/this.tiles_x); // Y tiles in the last texture

  this.isMobile = false;

  // External objects
  this.renderer = renderer;
  this.scene = scene;
  this.camera = camera;
  this.testSession = testSession;
  this.menuvr = menuvr;



  this.loadTextures = function(lf_image) {
    that.lfTextueLoaded1 = false;
    that.lfTextueLoaded2 = false;

    var meshFl = scene.getObjectByName('floor');
    if (meshFl!=undefined) meshFl.visible = false;
    if (lfPlane!=undefined) lfPlane.visible = false;
    if(that.menuvr.loading!=undefined) that.menuvr.loading.visible = true;

    // Load textures
    that.lfSpriteTexture[0] = THREE.ImageUtils.loadTexture(
      that.images_folder + lf_image + '_tiles_6x9-0.png', {}, function() {
        that.renderer.setTexture(that.lfSpriteTexture[0],1);
        that.lfTextueLoaded1 = true;
        if (that.lfTextueLoaded2) {
          if(that.menuvr.loading!=undefined) that.menuvr.loading.visible = false;
          if (meshFl!=undefined) meshFl.visible = true;
          if (that.lfPlane!=undefined) that.lfPlane.visible = true;
          if(that.menuvr.welcome!=undefined) that.menuvr.welcome.visible = true;
        }
      }
    );
    that.lfSpriteTexture[1] = THREE.ImageUtils.loadTexture(
      that.images_folder + lf_image + '_tiles_6x9-1.png', {}, function() {
        that.renderer.setTexture(that.lfSpriteTexture[1],2);
        that.lfTextueLoaded2 = true;
        if (that.lfTextueLoaded1) {
          if(that.menuvr.loading!=undefined) that.menuvr.loading.visible = false;
          if (meshFl!=undefined) meshFl.visible = true;
          if (that.lfPlane!=undefined) that.lfPlane.visible = true;
          if(that.menuvr.welcome!=undefined) that.menuvr.welcome.visible = true;
        }
      }
    );

    // Configure textures
    that.lfSpriteTexture[0].offset.x =  (that.centr_view%that.tiles_x) * 1.0/that.tiles_x;
    that.lfSpriteTexture[0].offset.y =  Math.floor(that.centr_view/that.tiles_x) * (1.0/that.tiles_y);
    that.lfSpriteTexture[0].repeat.set(1.0/that.tiles_x,1.0/that.tiles_y);

    that.lfSpriteTexture[1].offset.x =  (that.centr_view%that.tiles_x) * 1.0/that.tiles_x;
    that.lfSpriteTexture[1].offset.y =  Math.floor(that.centr_view/that.tiles_x) * (1.0/that.tiles_y);
    that.lfSpriteTexture[1].repeat.set(1.0/that.tiles_x,1.0/that.end_tiles_y);
  }

  this.preloadTextures = function (lf_image_list){
    var images = new Array()
    function preload(lf) {
      src1 = that.images_folder + lf + '_tiles_6x9-0.png';
      src2 = that.images_folder + lf + '_tiles_6x9-1.png';
      images.push(new Image());
      images[images.length-1].src = src1;
      images.push(new Image());
      images[images.length-1].src = src2;
  	}
    lf_image_list.forEach(function(e) {
      if(e!=undefined){
        preload(e);
      }
    });
  }

  function init() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
      that.isMobile = true;
    }
    else {
      that.isMobile = false;
    }

    that.loadTextures(that.lf_image_name);

    var geometry = new THREE.PlaneGeometry( 14.42, 10);
    var material = new THREE.MeshBasicMaterial( {
      color: 0xffffff,
      side: THREE.DoubleSide,
      map: that.lfSpriteTexture[0]
    } );

    that.lfPlane = new THREE.Mesh( geometry, material );
    that.lfPlane.name = 'lfPlane';
    if (isMobile) {
      that.lfPlane.position.set(0,10,15);
      that.lfPlane.rotation.y = Math.PI;
    }
    else {
      that.lfPlane.position.set(15,10,0);
      that.lfPlane.rotation.y = -Math.PI / 2;
    }

    that.lfPlane.visible = false;

    that.scene.add( that.lfPlane );

    that.camera.lookAt(that.lfPlane.position);
  }

  this.n;
  this.m;
  this.l;
  this.k;
  this.update = function(cam,x,y,forceUpdate = false) {
    var range_x = 2*that.dx;
    var range_y = 2*that.dy;
    var step_x = range_x/that.num_views_x;
    var step_y = range_y/that.num_views_y;

    if ( typeof that.n == 'undefined' ) {
      that.n = Math.floor(that.num_views_x/2);
    }
    if ( typeof that.m == 'undefined' ) {
      that.m = Math.floor(that.num_views_y/2);
    }
    if ( typeof that.l == 'undefined' ) {
      that.l = that.centr_view;
    }
    if ( typeof that.k == 'undefined' ) {
      that.k = Math.floor(that.l/that.tiles);
    }

    if (that.isMobile) {
      var curRotX = cam.position.x; // Horisontal for Mobile
    }
    else {
      var curRotX = cam.position.z; // Horizontal axes for Chrome Mac
    }
    var curRotY = cam.position.y;

    for (i = 0; i < that.num_views_x; i++) {
      if( curRotX >= (    i*step_x + (x-that.dx)) &&
          curRotX <  ((i+1)*step_x + (x-that.dx)) ) {
        var n = that.num_views_x-1-i;
        if(that.n != n) {
          that.n = n;
        }
        break;
      }
    }
    for (j = 0; j < that.num_views_y; j++) {
      if( curRotY >= (    j*step_y + (y-that.dy)) &&
          curRotY <  ((j+1)*step_y + (y-that.dy)) ) {
        var m = j;
        if(that.m != m) {
          that.m = m;
        }
        break;
      }
    }

    var l = that.n + that.m*that.num_views_x;
    if (l != that.l || forceUpdate) {
      that.l = l;
      //console.log(new Date().getTime()," ",renderLightField.n,renderLightField.m);
      if(that.testSession.state=='evaluating' && that.testSession.substate=='viewing' &&
          that.lfTextueLoaded1 && that.lfTextueLoaded2)
      {
        that.testSession.tracks.push([that.testSession.currentImage,new Date().getTime(),that.n,that.m]);
      }
      var k = Math.floor(l/that.tiles);
      // Output current tile number
      document.getElementById("tl_n").innerHTML = that.n;
      document.getElementById("tl_m").innerHTML = that.m;
      document.getElementById("tl_k").innerHTML = that.k;

      var mesh = that.scene.getObjectByName('lfPlane');
      if (k != that.k || forceUpdate) {
        that.k = k;
        mesh.material.map = that.lfSpriteTexture[k];
      }

      ll = l%that.tiles;

      mesh.material.map.offset.x = (ll%that.tiles_x)*1.0/that.tiles_x;
      if (k<(that.num_textures-1)) {
        mesh.material.map.offset.y = (1.0-1.0/that.tiles_y)-Math.floor(ll/that.tiles_x)*1.0/that.tiles_y;
      }
      else {
        mesh.material.map.offset.y = (1.0-1.0/that.end_tiles_y)-Math.floor(ll/that.tiles_x)*1.0/that.end_tiles_y;
      }
    }
  }

  // Run constructor here
  init();

}
