//I know, the code is terribly ugly
//font consolas size is 25, line height is 16, space is 0
//font width is 12, height is 16
var input = document.getElementById('file-input');
input.addEventListener('change', handleFiles);

const ascii_list = ['7', '4', '1', '2', '3', '5', '6', '0','9','8'];
const char_font = 'consolas'
const char_size = 14;
const char_lineheight = 16
const char_width = 12
const char_height = 12
let min = document.getElementById('min-input').value;

function to_ascii(pixels){
	const canvas = document.getElementById('canvas');
	canvas.width = pixels[0].length * char_width;
	canvas.height = pixels.length * char_height;

	const ctx = canvas.getContext('2d');
	ctx.fillStyle = '#000000';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	for(let y=0; y<pixels.length; y++){
		for(let x=0; x< pixels[0].length; x++){
			const index = Math.floor(pixels[y][x]*(ascii_list.length-1))

			ctx.font = char_size + 'px ' + char_font;
			//set fillstyle grayscale depending on index
			const ratio = (index+1)/ascii_list.length;
			ctx.fillStyle = 'rgb(' + Math.floor(ratio*255) + ',' + Math.floor(ratio*255) + ',' + Math.floor(ratio*255) + ')';
			ctx.fillText(ascii_list[index], x*char_width, y*char_height+ char_size/1.5);
		}
	}
}
function get_pixels(base64String){
	//convert base64String image to image pixels array
	var img = new Image;
	img.src = base64String
	img.onload = () => {
		const c= document.createElement('canvas');
		c.width = img.width;
		c.height = img.height;
		const ctx = c.getContext('2d');
		ctx.drawImage(img, 0, 0);

		const all_pixels = [];
		for(let y=0; y<img.height; y++){
			const temp = [];
			for(let x=0; x<img.width; x++){
				const data = ctx.getImageData(x,y,1,1).data
				const grayscale = (data[0]+data[1]+data[2])/3;
				temp.push(grayscale/255);
			}
			all_pixels.push(temp);
		}
		to_ascii(all_pixels);
	}
}

function handleFiles(e) {
	var img = new Image;
	img.src = URL.createObjectURL(e.target.files[0]);
	function test(){
		var base64String;
		min = document.getElementById('min-input').value;
		if(img.width < img.height)
			base64String = resizeImg(img, min, img.height*min/img.width, 0);
		else
			base64String = resizeImg(img, img.width*min/img.height, min, 0);
		const pixels = get_pixels(base64String);
	}
	img.onload = function() {
		test();
	}
}

function resizeImg(img, maxWidth, maxHeight, degrees) {
  var imgWidth = img.width,
    imgHeight = img.height;

  var ratio = 1,
    ratio1 = 1,
    ratio2 = 1;
  ratio1 = maxWidth / imgWidth;
  ratio2 = maxHeight / imgHeight;

  // Use the smallest ratio that the image best fit into the maxWidth x maxHeight box.
  if (ratio1 < ratio2) {
    ratio = ratio1;
  } else {
    ratio = ratio2;
  }
  var canvas = document.createElement("canvas");
  var canvasContext = canvas.getContext("2d");
  var canvasCopy = document.createElement("canvas");
  var copyContext = canvasCopy.getContext("2d");
  var canvasCopy2 = document.createElement("canvas");
  var copyContext2 = canvasCopy2.getContext("2d");
  canvasCopy.width = imgWidth;
  canvasCopy.height = imgHeight;
  copyContext.drawImage(img, 0, 0);

  // init
  canvasCopy2.width = imgWidth;
  canvasCopy2.height = imgHeight;
  copyContext2.drawImage(canvasCopy, 0, 0, canvasCopy.width, canvasCopy.height, 0, 0, canvasCopy2.width, canvasCopy2.height);


  var rounds = 1;
  var roundRatio = ratio * rounds;
  for (var i = 1; i <= rounds; i++) {


    // tmp
    canvasCopy.width = imgWidth * roundRatio / i;
    canvasCopy.height = imgHeight * roundRatio / i;

    copyContext.drawImage(canvasCopy2, 0, 0, canvasCopy2.width, canvasCopy2.height, 0, 0, canvasCopy.width, canvasCopy.height);

    // copy back
    canvasCopy2.width = imgWidth * roundRatio / i;
    canvasCopy2.height = imgHeight * roundRatio / i;
    copyContext2.drawImage(canvasCopy, 0, 0, canvasCopy.width, canvasCopy.height, 0, 0, canvasCopy2.width, canvasCopy2.height);

  } // end for

  canvas.width = imgWidth * roundRatio / rounds;
  canvas.height = imgHeight * roundRatio / rounds;
  canvasContext.drawImage(canvasCopy2, 0, 0, canvasCopy2.width, canvasCopy2.height, 0, 0, canvas.width, canvas.height);


  if (degrees == 90 || degrees == 270) {
    canvas.width = canvasCopy2.height;
    canvas.height = canvasCopy2.width;
  } else {
    canvas.width = canvasCopy2.width;
    canvas.height = canvasCopy2.height;
  }

  canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  if (degrees == 90 || degrees == 270) {
    canvasContext.translate(canvasCopy2.height / 2, canvasCopy2.width / 2);
  } else {
    canvasContext.translate(canvasCopy2.width / 2, canvasCopy2.height / 2);
  }
  canvasContext.rotate(degrees * Math.PI / 180);
  canvasContext.drawImage(canvasCopy2, -canvasCopy2.width / 2, -canvasCopy2.height / 2);


  var dataURL = canvas.toDataURL();
  return dataURL;
}
