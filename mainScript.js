function hamburger(x) { // this function is for changing css attributes (hamburger menu)
    x.classList.toggle("change");
}


// URL Dictionary...
var url ={
  // get map url
  mapserv : "http://localhost/cgi-bin/mapserv.exe?map=C:/ms4w/apps/MyProject/project.map",
  service : "&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&EPSG:4326&CRS=CRS:84&BBOX=",
  bbox : [44, 25, 63, 40],
  layer : "&LAYERS=places",
  picInfo : "&WIDTH=1000&HEIGHT=600&FORMAT=image/png",
  // get feature url
  request : "&REQUEST=GetFeatureInfo&",
  qlayer : "query_layers=places,water",
  style : "&STYLES=&INFO_FORMAT=text/html&feature_count=4&",
  xAtr : "x=300&",
  yAtr : "y=200"
};

//pushing modified url into image source
function urlModifier() {

 document.getElementById("mapImg").src = url.mapserv+url.service+url.bbox.join()+url.layer+url.picInfo;
 pinImg.style.display = "none";

}



/*
* functions for changing layers
* setDefaultLayer : set layers to default states (also label's style)
* layerFunc : this changes the layers (connected to checkbox)
*/
function setDefaultLayer() {
  document.getElementById("labelRailroad").style.backgroundColor = "#dbdbf0";
  document.getElementById("labelWaterway").style.backgroundColor = "#dbdbf0";
  url.layer =  "&LAYERS=places"
}
function layerFunc() {
  setDefaultLayer()
  if (document.getElementById("railwaysChecked").checked) { // railways layer
    url.layer = url.layer + ",railways";
    url.qlayer = url.qlayer + ",railways";
    document.getElementById("labelRailroad").style.backgroundColor = "#66a3ff";
  }
  if (document.getElementById("waterwaysChecked").checked) { //waterways layer
    url.layer = url.layer + ",waterways";
    url.qlayer = url.qlayer + ",waterways";
    document.getElementById("labelWaterway").style.backgroundColor = "#66a3ff";

  }

  urlModifier();

}

/*
* functions for zooming
* zoomFunc : zoom respect to point double clicked
* zoomInFunc : zooming in function
* zoomOutFunc : zooming out function
*
*  zoom to point calculation:   (a,b):image position; (width,height): image attributes = (1000px,600px);
*                                              (Exmin,Eymin): minimum X and Y in extent;
*                                              (Exmax,Eymax): maximum X and Y in extent;
*                                              (Cx,Cy): mouse click position;
*                                              (Px,Py): position respect to Extent.
*                    -------
*                      b         (Exmax,Eymax)
*      +---------------+---------------+ (width)
*      |   |           |               |                        Px = (Exmax - Exmin) * ((Cx - a) / (width))
*      |---P (x,y)     |               |                        Py = (Eymax - Eymin) * ((Cy - b) / (height))
*   a  |---------------|---------------|                        ---> 10% zoom:
*      |               |               |
*      |               |               |
*      +---------------+---------------+
*    (Exmin,Eymin)                 (height)
*/

var a = document.getElementById("mapImg").offsetLeft;
var b = document.getElementById("mapImg").offsetTop;
var pinImg = document.getElementById("pinImage");


/* 
* it consists of two part, first part that triggers with alt key shows the feature info with iframe
* and second part is just simple double click that just zoom in
*/
function doubleClick() {
  var Cx = event.clientX;
  var Cy = event.clientY;
  if (event.altKey) {
    //set the URL
    /**
    * mouse click position must be reduced by  top and left position of image
     */
    url.xAtr = "x=" + (Cx - a)  + "&";
    url.yAtr = "y=" + (Cy - b);

    /* chaging url for GetFeatureInfo
    * diffrences with urlModifier:
    * 1: it will change the IFRAME src
    * 2: it has additional string respect to what is in wms getMap
    * we send x and y of required location to server...
    */
    document.getElementById("iframeSet").src = url.mapserv+url.service+url.bbox.join()+url.layer+url.picInfo + url.request + url.qlayer + url.style  + url.xAtr + url.yAtr;

    // set the pin image position
    pinImg.style.display = "block";
    pinImg.style.top = Cy - 38.02 + "px"; // 38.02 :height of image rendered (we reduce it to pin goes exactly where we clicked)
    pinImg.style.left = Cx  + "px";
  }
  else {
    // zooming function
    var Py = (url.bbox[3] - url.bbox[1]) * ((Cy - b) / 600);
    var Px = (url.bbox[2] - url.bbox[0]) * ((Cx - a) / 1000);
    url.bbox[2] = url.bbox[2] - (url.bbox[2] - url.bbox[0] - Px) * 30 / 100 ;  // set zooming  in on 30%
    url.bbox[0] = url.bbox[0] + Px * 30 / 100;
    url.bbox[1] = url.bbox[1] + (url.bbox[3] - url.bbox[1] - Py) * 30 / 100;
    url.bbox[3] = url.bbox[3] - Py * 30 / 100;

    urlModifier();
  }
}
/*
* Dynamic Zoom:
* i made an array of Lx and Ly (variables that change the BBOX) so zoom in and zoom back become MATCHED
* so each time client zoom in the Lx and Ly of that state will save and some how with this method zooming back for That state will be reserved
* i and j  are counters:
*   i  is for zoom in
*   j is for zoom out
* with this method zooming in is infinite and wont be hindered (aposite of  static Zooming) but i set a treshold of just 10 times zooming capability
*/

var Lx = [];
var Ly = [];
var i = 0;
var j = 0;
Lx[0] = (url.bbox[2] - url.bbox[0]) / 10;
Ly[0] = (url.bbox[3] - url.bbox[1]) / 10;


// zoom in button function
function zoomInFunc() {
 if (i <= 11) { //calculation starts at 1
  url.bbox[0] = url.bbox[0] + Lx[i];
  url.bbox[1] = url.bbox[1] + Ly[i];
  url.bbox[2] = url.bbox[2] - Lx[i];
  url.bbox[3] = url.bbox[3] - Ly[i];

  urlModifier();

  i ++;
  Lx[i] = (url.bbox[2] - url.bbox[0]) / 10;
  Ly[i] = (url.bbox[3] - url.bbox[1]) / 10;
  j = i;
 }
}

// zoom out button function
function zoomOutFunc() {
  // if wont allow zoom out goes outside of primary  EXTENT
  if (j == 0) { // we dont have minus for array and with this we can zoom back double click zoom in
    j = 1;
  }
 if (url.bbox[0] - Lx[j-1] < 44 || url.bbox[1] - Ly[j-1] < 25 || url.bbox[2] + Lx[j-1] >63 || url.bbox[3] + Ly[j-1] > 40) {
  url.bbox = [44, 25, 63, 40];
 }else {
  url.bbox[0] = url.bbox[0] - Lx[j-1];
  url.bbox[1] = url.bbox[1] - Ly[j-1];
  url.bbox[2] = url.bbox[2] + Lx[j-1];
  url.bbox[3] = url.bbox[3] + Ly[j-1];
  j--;
 }

  urlModifier();
}

/**
* Panning
* it will do the drag by mouse down/up
* setting a treshold for not dragging if mouse move is less than 30px
*/

 // prevent default enables trigring to panning function by mouse down/up
document.getElementById("mapImg").addEventListener("onmouseup" ,function(event){
   event.preventDefault()
});
document.getElementById("mapImg").addEventListener("onmousedown" ,function(event){
   event.preventDefault()
});

var pos =[]
function panning(pos) {
   var lenX = pos[2] - pos[0];
   var lenY = pos[1] - pos[3];
   var len = Math.sqrt( Math.pow(lenX, 2) + Math.pow(lenY, 2) );
if (len > 30) { // pan when mouse movement is more than 30px
  var moveX = (lenX / 1000) * (url.bbox[2] - url.bbox[0]);
  var moveY = (lenY / 600) * (url.bbox[3] - url.bbox[1]);
  url.bbox[0] = url.bbox[0] - moveX;
  url.bbox[1] = url.bbox[1] - moveY;
  url.bbox[2] = url.bbox[2] - moveX;
  url.bbox[3] = url.bbox[3] - moveY;

 urlModifier();
 }
}
// mouse down function
function dragFuncStart() {
   pos[0] = event.clientX - a;
   pos[1] = event.clientY - b;
}
// mouse up function
function dragFuncOver() {
  pos[2] = event.clientX - a;
  pos[3] = event.clientY - b;
  panning(pos);
}

/* 
* panning with buttons (move to right, left, up and down)
* i will set it to move 50px with each click (50px is about 1.25 movement of bbox)
*/
// upward
function panUp() {
  url.bbox[1] = url.bbox[1] + 1.25;
  url.bbox[3] = url.bbox[3] + 1.25;

  urlModifier();
}
//downward
function panDown() {
    url.bbox[1] = url.bbox[1] - 1.25;
    url.bbox[3] = url.bbox[3] - 1.25;

    urlModifier();
}
//leftward
function panLeft() {
    url.bbox[0] = url.bbox[0] - 1.25;
    url.bbox[2] = url.bbox[2] - 1.25;

    urlModifier();
}
//upward
function panRight() {
    url.bbox[0] = url.bbox[0] + 1.25;
    url.bbox[2] = url.bbox[2] + 1.25;

    urlModifier();
}

/*
* Reload icon function - set to default value
*/
function reloadFunc() {
  url.bbox = [44, 25, 63, 40];
  url.layer = "&LAYERS=places";

  pinImg.style.display = "none";

  urlModifier();
}