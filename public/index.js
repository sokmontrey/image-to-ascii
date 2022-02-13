const fileInput = document.getElementById('file-input');
fileInput.addEventListener('change', main);

function main(event){
	var img = new Image;
	img.src= URL.createObjectURL(event.target.files[0]);
	img.onload = () => {
		var base64String;
		const minChar = document.getElementById('min-char-input').value;
		const isColor = document.getElementById('is-color-input').checked;
		if(img.width < img.height){
			base64String = resizeImg(img, minChar, img.height*minChar/img.width,0);
		}else{
			base64String = resizeImg(img, img.width*minChar/img.height, minChar,0);
		}
		const img_container = document.getElementById('image-container');
		img_container.innerHTML = `<img src="${base64String}">`;

		getPixels(base64String, isColor, (pixels)=>{
			//pixels
		});
	}
}

function getPixels(base64String, isColor, callBack){
	var img = new Image;
	img.src=base64String;
	img.onload = () =>{
		const c = document.createElement('canvas');
		c.width = img.width;
		c.height = img.height;
		const ctx = c.getContext('2d');
		ctx.drawImage(img, 0, 0);

		const all_pixels = [];
		for(let y=0; y<img.height; y++){
			const temp = [];
			for(let x=0; x<img.width; x++){
				const data = ctx.getImageData(x,y,1,1).data
				if(isColor){
					temp.push({
						r: data[0]/255,
						g: data[1]/255,
						b: data[2]/255,
					});
				}else{
					const grayscale = (data[0]+data[1]+data[2])/3;
					temp.push({g:grayscale/255});
				}
			}
			all_pixels.push(temp);
		}
		callBack(all_pixels);
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
