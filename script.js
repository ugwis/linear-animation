$(document).ready(function(){
	var canvas = document.getElementById('canvas1');
	var ctx    = canvas.getContext('2d');

	var plugin = document.querySelector('object[type="application/x-wacomtabletplugin"]');
	var pressure;

	var encoder = new GIFEncoder();

	var isMouseDown = false;

	var data_url="";

	var modified = false;

	const element = document.body;
	
	var drawCount = 0;
	var drawingCount = 0;

	var editorMode = 0;
	const maxEditorMode = 1;

	var prevPoints=[];
	var reviewPoints=new Object();

	const editorIDs = ["#canvasWrapper", "#animationSetting"];

	const animeBarWidth = 40;

	var animePreX = 2;
	var animePreY = 2;

	var isShiftDown = false;
	var isMassAnime = false;

	document.onkeyup = function (e){
		if(!e) e = window.event;

		console.log(e);

		if(e.keyCode == 16){
			console.log("Shift Up !!!!!")
			isShiftDown = false;
			if(isMassAnime){
				drawingCount = 0;
				drawCount++;
				addAnimation(drawCount);
			}
			isMassAnime = false;
		}
	}
	document.onkeydown = function (e){

		// InternetExplorer 用
		if (!e)	e = window.event;

		//console.log(e);

		if(e.shiftKey && !e.repeat) isShiftDown = true;

		//Ctrl + z
		if(e.ctrlKey && e.keyCode == 90 && !e.repeat && drawCount > 0){
			console.log("undo");
			console.log(prevPoints);
			ctx.clearRect(0,0,800,400);
			$('#canvasAni' + (drawCount -1)).remove();
			drawCount--;
			for(i in prevPoints){
				if(i == drawCount) break;
				for(x in prevPoints[i] ){
					console.log("i:" + i + "x:" + x);
					if(prevPoints[i][x].drawType == "move") continue;
				    drawLine(
				    	prevPoints[i][x-1].x,
				    	prevPoints[i][x-1].y,
				    	prevPoints[i][x].x,
				    	prevPoints[i][x].y,
				    	prevPoints[i][x].width
				    );
				}
			}
			extract();
		}


		//Ctrl + y
		if(e.ctrlKey && e.keyCode == 89 && !e.repeat){
			console.log("redo");
			ctx.clearRect(0,0,800,400);
			drawCount++;
			for(var i=0;i<drawCount;i++){
				for( var x in prevPoints[i] ){
					if(prevPoints[i][x].drawType == "move") continue;
				    drawLine(
				    	prevPoints[i][x-1].x,
				    	prevPoints[i][x-1].y,
				    	prevPoints[i][x].x,
				    	prevPoints[i][x].y,
				    	prevPoints[i][x].width
				    );
				}
			}
			extract();
		}

	};
	function extract(){
		for(i in prevPoints){
			if(i >= drawCount) break;
			var beginTime = prevPoints[i][0].timeStamp;
			for(x in prevPoints[i] ){
				if(prevPoints[i][x].drawType == "move") continue;
				time = '' + Math.floor(prevPoints[i][x].timeStamp - beginTime + ($('#canvasAni' + i).offset().left - $('#animeArea').offset().left)*10);
				for(var j=0;time in reviewPoints;j++){
					time = '' + Math.floor(prevPoints[i][x].timeStamp - beginTime + ($('#canvasAni' + i).offset().left - $('#animeArea').offset().left)*10 + j);
				}
				//console.log("i: " + i + "\tx: " + x + "\tdrawType: " + draw);
				reviewPoints[time] = {
					'prevx':prevPoints[i][x-1].x,
					'prevy':prevPoints[i][x-1].y,
					'x':prevPoints[i][x].x,
					'y':prevPoints[i][x].y,
					'width':prevPoints[i][x].width,
					'drawCount':i
				};
			}
		}
		console.log(reviewPoints);
	}
	function addAnimation(drawID){
		console.log(prevPoints);
		console.log("drawID: " + drawID);
	    var left = prevPoints[drawID-1][0].x;
	    var right = prevPoints[drawID-1][0].x;
	    var top = prevPoints[drawID-1][0].y;
	    var bottom = prevPoints[drawID-1][0].y;
	    var time = (prevPoints[drawID-1][prevPoints[drawID-1].length - 1].timeStamp
				 - prevPoints[drawID-1][0].timeStamp)/10;
	    for(i in prevPoints[drawID-1]){
	    	if(i == 0) continue;
	    	x = prevPoints[drawID-1][i].x;
	    	y = prevPoints[drawID-1][i].y;
	    	if(x < left) left = x;
	    	if(x > right) right = x;
	    	if(y < top) top = y;
	    	if(y > bottom) bottom = y;
	    }
	    var zoomx = time/(right-left);
    	var zoomy = animeBarWidth/(bottom-top);
    	var zoom = Math.min(zoomx,zoomy);
    	console.log("top    : " + top);
    	console.log("bottom : " + bottom);
    	console.log("left   : " + left);
    	console.log("right  : " + right);
    	console.log("time   : " + time);
    	console.log("zoomx  : " + zoomx);
    	console.log("zoomy  : " + zoomy);
    	/*
    	prevPoints[drawID-1].widthbt = bottom-top;
    	prevPoints[drawID-1].widthrl = right-left;
		prevPoints[drawID-1].left = left;
		prevPoints[drawID-1].top = top;
		*/
		$('#animeArea').append("<canvas style='background:#fff;' id='canvasAni" + (drawID-1) + "' width='" + (time-4) + "' height='" + animeBarWidth + "'></canvas>");
    	var prex;
    	var prey;
    	tca = document.getElementById('canvasAni' + (drawID-1)).getContext('2d');
    	while(tca == null){
        	tca = document.getElementById('canvasAni' + (drawID-1)).getContext('2d');
    	}
    	$('#canvasAni' + (drawID-1)).draggable({
    		grid: [ 1, animeBarWidth + 4 ],
    		opacity: 0.5,
    		scroll: true,
    		snap: true,
    		snapTolerance:3,
    		stack: '.anime',
    		containment: 'parent',
    		start:function(){
    			modified=true;
    		}
    	});
	    for(i in prevPoints[drawID-1]){
	    	if(prevPoints[drawID-1][i].drawType == 'move') continue;
		    prex = (prevPoints[drawID-1][i-1].x - left)*zoom;
		    prey = (prevPoints[drawID-1][i-1].y - top)*zoom;
	    	x = (prevPoints[drawID-1][i].x - left)*zoom;
	    	y = (prevPoints[drawID-1][i].y - top)*zoom;
	    	tca.lineWidth = prevPoints[drawID-1][i].width;
	        tca.lineJoin = 'round';
	        tca.lineCap  = 'round';
            tca.beginPath();
            tca.moveTo(prex, prey);
            tca.lineTo(x, y);
            tca.closePath();
            //cta.fillStyle = 'rgba(255,255,255)';
		    tca.stroke();
	    }
	    if(drawID-1 == 0){
	    	animePreX = 0;
	    	animePreY = 0;
	    } else {
	    	animePreY = $('#canvasAni' + (drawID-2)).offset().top - $('#animeArea').offset().top;
	    	animePreX = $('#canvasAni' + (drawID-2)).offset().left - $('#animeArea').offset().left + $('#canvasAni' + (drawID-2)).width() + 2;
	    }
	    $('#canvasAni' + (drawID-1)).css({'position': 'absolute','top': animePreY + 'px','left': animePreX + 'px'});
    	$('#animeArea').scrollLeft(animePreX + time);
	}
	$('#canvas1').on('mousemove', function(e){
		if (plugin && plugin.penAPI && plugin.penAPI.isWacom && plugin.penAPI.pointerType === 1) {
			pressure =  plugin.penAPI.pressure;
		} else {
			pressure = 0.1;
		}
		if(isMouseDown){
			var x = e.pageX - $('#canvas1').offset().left
			var y = e.pageY - $('#canvas1').offset().top

			width = pressure * 5;
			//shadowWidth = pressure*3;
			//shadowWidth = 0;

			
			//ctx.shadowBlur = shadowWidth;
			//ctx.shadowColor = "#000000";

			drawLine(prevPoints[drawCount][drawingCount-1].x,prevPoints[drawCount][drawingCount-1].y,x,y,width)
			prevPoints[drawCount][drawingCount] = {
				'x': x,
				'y': y,
				'width': width,
				'timeStamp': e.timeStamp,
				'drawType': "line"
			}
		
		    drawingCount++;
		}
		return false;
	});

	$('#canvas1').on('mousedown', function(e){
		console.log("mousedown");
		if(!modified) modified=true;
		if(!isMassAnime) prevPoints[drawCount] = new Array();
		if(isShiftDown && !isMassAnime) isMassAnime = true;
		prevPoints[drawCount][drawingCount] = {
			'x': e.pageX - $('#canvas1').offset().left,
			'y': e.pageY - $('#canvas1').offset().top,
			'width': 0,
			'timeStamp': e.timeStamp,
			'drawType': "move"
		};
	    isMouseDown = true;
	    drawingCount++;
	    return false;
	});
	$('#canvas1').on('mouseup', function(e){
	    isMouseDown = false;
	    if(drawingCount == 1){
	    	drawingCount = 0;
	    	return false;
	    }
	    if(isMassAnime && isShiftDown) return false;
	    drawingCount = 0;
	    drawCount++;

	    addAnimation(drawCount);

		//extract();
	    return false;
	});
	function resize(){
	    left = (document.documentElement.clientWidth -20 - 804)/2;
	    $("#story").stop();
	    $("#story").animate({ 
		    left: left - 204 - editorMode*854 + "px"
		}, 500 );
	    
	    $("#leftButton").stop();
	    if(editorMode == 0){
		    $("#leftButton").animate({ 
			    left: left + 10 - 50 + 10 + "px",
			    top: (404-30)/2 + $('#canvas1').offset().top + "px"
			}, 500, function(){
				$('#leftButton').removeClass();
				$('#leftButton').addClass('hiddenOpacity');
			});
	    } else {
		    $("#leftButton").animate({ 
			    left: left + 10 - 50 + 10 + "px",
			    top: (404-30)/2 + $('#canvas1').offset().top + "px"
			}, 500, function(){
				$('#leftButton').removeClass();
				$('#leftButton').addClass('normalOpacity');
			});
		}

	    $("#rightButton").stop();
	    if(editorMode == maxEditorMode){
		    $("#rightButton").animate({ 
			    left: left + 10 + 804 + 10 + "px",
			    top: (404-30)/2 + $('#canvas1').offset().top + "px"
			}, 500, function(){
				$('#rightButton').removeClass();
				$('#rightButton').addClass('hiddenOpacity');
			});
		} else {
		    $("#rightButton").animate({ 
			    left: left + 10 + 804 + 10 + "px",
			    top: (404-30)/2 + $('#canvas1').offset().top + "px"
			}, 500, function(){
				$('#rightButton').removeClass();
				$('#rightButton').addClass('normalOpacity');
			});

		}
	}

    function drawLine(prevx,prevy,x,y,width){
			ctx.lineWidth = width;
	        ctx.lineJoin = 'round';
	        ctx.lineCap  = 'round';
            ctx.beginPath();
            ctx.moveTo(prevx, prevy);
            ctx.lineTo(x, y);
            ctx.closePath();
            //ctx.fillStyle = 'rgba(255,255,255)';
		    ctx.stroke();
		    return false;
    }

    resize();
    window.addEventListener('resize', resize,false);

    $('#rightButton').hover(
    	function(){
    		if(editorMode < maxEditorMode){
				$('#rightButton').removeClass();
				$('#rightButton').addClass('hoverOpacity');
			}
    	},
    	function(){
    		if(editorMode < maxEditorMode){
				$('#rightButton').removeClass();
				$('#rightButton').addClass('normalOpacity');
			}
    	}
    );
    $('#rightButton').click(function(){
    	if(editorMode < maxEditorMode){
	    	$(editorIDs[editorMode]).removeClass();
	    	$(editorIDs[editorMode]).addClass('normalOpacity');
	    	editorMode++;
	    	$(editorIDs[editorMode]).removeClass();
	    	$(editorIDs[editorMode]).addClass('highOpacity');
	    	resize();
	    }
    });


    $('#leftButton').hover(
    	function(){
    		if(editorMode > 0){
				$('#leftButton').removeClass();
				$('#leftButton').addClass('hoverOpacity');
			}
    	},
    	function(){
    		if(editorMode > 0){
				$('#leftButton').removeClass();
				$('#leftButton').addClass('normalOpacity');
			}
    	}
    );
    $('#leftButton').click(function(){
    	if(editorMode > 0){
	    	$(editorIDs[editorMode]).removeClass();
	    	$(editorIDs[editorMode]).addClass('normalOpacity');
	    	editorMode--;
	    	$(editorIDs[editorMode]).removeClass();
	    	$(editorIDs[editorMode]).addClass('highOpacity');
	    	resize();
	    }
    });

    $('#animePlay').click(play());
    function play(){
    	if(!modified){
    		$("#playImg").attr('src',data_url);
    		return 0;
    	}
    	var interval = parseInt($('#animeInterval').val());
    	console.log("interval\t:" + interval);
    	cap = document.getElementById('canvas2').getContext('2d');
		cap.clearRect(0,0,400,200);
		cap.fillStyle = "rgb(255,255,255)";
		cap.fillRect(0,0,400, 200); //GIF can't do transparent so do white
    	extract();
    	encoder.setRepeat(-1);
		encoder.setDelay(interval); //go to next frame every n milliseconds
		encoder.setSize(400,200);
		encoder.start();
    	var beginTime = new Date();
	    cap = document.getElementById('canvas2').getContext('2d');
	    var section=-1;
    	for(x in reviewPoints){
	    	cap.lineWidth = reviewPoints[x].width;
	        cap.lineJoin = 'round';
	        cap.lineCap  = 'round';
            //cap.fillStyle = 'rgba(255,255,255)';
            cap.beginPath();
            cap.moveTo(reviewPoints[x].prevx*0.5, reviewPoints[x].prevy*0.5);
            cap.lineTo(reviewPoints[x].x*0.5, reviewPoints[x].y*0.5);
            cap.closePath();
		    cap.stroke();
			if(Math.floor(parseInt(x)/interval) > section){
				encoder.addFrame(cap);
				section = parseInt(x)/interval;
			}
    	}
		encoder.finish();
		var binary_gif = encoder.stream().getData() //notice this is different from the as3gif package!
		//data_url = 'data:image/gif;base64,'+encode64(binary_gif);
		$.ajax({
                url: "http://sandbox.neos-lab.jp/~orn/cgi-bin/create_animation_gif.cgi",
                type:'POST',
                data : {encrypt : encode64(binary_gif)},
                timeout:10000,
                success: function(data) {
					$("#playImg").attr('src',"http://sandbox.neos-lab.jp/~orn/gif_anime/" + data);
					data_url = data;
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                	console.error(textStatus);
					$("#playImg").attr('src',data_url);
                }
              });
		modified = false;
    }

	$('#animeInterval').keydown(function() {
	    modified = true;
	});

	function sign_in_with_twitter(){
		play();
		$.cookie("fileName", data_url, { expires: 7 });
	}

});