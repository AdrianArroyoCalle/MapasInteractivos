/* AdMob */
/* Iconos */

var s = Snap("#map");
var list = [];
var progress = 0;
var areas, selector;
var searchfor = -1;
var errors = 0;
var attr = {
	fill: "#333",
	stroke: "#666",
	"stroke-width": 1,
	"stroke-linejoin": "round"
};
var lock = false;
var text;
var rect;
var hud;

function shuffle(array){
	var m = array.length, t, i;
	while(m){
		i = Math.floor(Math.random() * m--);
		t = array[m];
		array[m] = array[i];
		array[i] = t;
	}
	return array;
}

function parseGET(val){
	var result = "Not found", tmp = [];
	var items = location.search.substr(1).split("&");
	for(var index = 0; index < items.length; index++){
		tmp = items[index].split("=");
		if(tmp[0] === val ) result = decodeURIComponent(tmp[1]);
	}
	return result;
}

function correct(sel){
	var el = s.select(sel);
	el.animate({
		fill: "green"
	},450);
}

function wrong(sel){
	var el = s.select(sel);
	el.attr({
		fill: "red"
	});
}

function endGame(){
	
}


function processClick(index){
	if(lock) return;
	var selected = selector[index];
	if(typeof selected != "string"){
		selected.forEach(function(sel){
			if(index === searchfor)
				correct(sel);
			else
				wrong(sel);
		});
	}else{
		if(index === searchfor)
			correct(selected);
		else
			wrong(selected);
	}
	/* Sound */
	if(index === searchfor){
		lock = true;
		setTimeout(function(){
			selector.forEach(function(selected,index){
				if(typeof selected != "string"){
					selected.forEach(function(sel){
						s.select(sel).attr(attr);
					});
				}else{
					s.select(selected).attr(attr);
				}
			});
			progress++;
			if(progress == list.length){
				endGame();
			}
			nextArea();
			lock = false;
		},1000);
	}else{
		errors++;
	}
}

function nextArea(){
	if(text != undefined){
		text.remove();
		rect.remove();
	}
	var index = list[progress];
	console.log("Search for "+index+" which is "+areas[index]);
	searchfor = index;
	var vb = s.attr("viewBox");
	text = s.text(vb.x+10,vb.y+20,areas[index]);
	rect = s.rect(vb.x+5,vb.y,text.getBBox().width+10,text.getBBox().height+5,10);
	rect.attr({fill: "#59EEA8"});
	text.remove();
	text = s.text(vb.x+10,vb.y+20,areas[index]);
}

function drawMap(f,viewBox) {
	var g = f.selectAll("*");
	console.dir(g);
	g.attr(attr);
	s.append(g);
	s.attr({ viewBox: viewBox,width: window.innerWidth, height: window.innerHeight});
	window.addEventListener("resize",function(){
		s.attr({ viewBox: viewBox,width: window.innerWidth, height: window.innerHeight});
	});
	setInterval(function(){
		if(hud != undefined) hud.remove();
		// Draw score and time
		var vb = s.attr("viewBox");
		hud = s.text(0,0,"Errores: "+errors);
		s.rect(vb.x + vb.width - hud.getBBox().width -15,vb.y,hud.getBBox().width + 5 ,hud.getBBox().height+10,10).attr({
			fill: "#59AAEE"
		});
		hud = s.text(vb.x + vb.width - hud.getBBox().width -15,vb.y+20,"Errores: "+errors);
	},1000);
	
	for(var i=0;i<areas.length;i++){
		list.push(i);
	}
	list = shuffle(list);
	selector.forEach(function(selected,index){
		console.log("Selected: "+selected);
		if(typeof selected != "string"){
			selected.forEach(function(sel){
				s.select(sel).click(function(){
					processClick(index);
				});
			});
		}else{
			s.select(selected).click(function(){
				processClick(index);
			});
		}
	});
	nextArea();
	
}

function load(){
	var map = parseGET("map");
	var xhr = new XMLHttpRequest();
	xhr.open("GET","/quiz/"+map);
	xhr.addEventListener("load",function(){
		var quizInfo = JSON.parse(xhr.responseText);
		Snap.load(quizInfo.svg,function(f){
			areas = quizInfo.areas;
			selector = quizInfo.selector;
			drawMap(f,quizInfo.viewBox);
		});
	});
	xhr.send();
}

document.addEventListener("deviceready",load);


/* On Resize */

/* Map.js tiene dos modos, uno via parámetros GET, para que en cada web en Yayeyo (FGL, etc) sea distinto y otro via un menú principal para las aplicaciones */
/* Dos tipos de juegos, como Enrique Alonso */
/* Menú principal, sugerencias, puntuación, compartir en Twitter */
