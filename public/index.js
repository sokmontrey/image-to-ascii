import Resize from './resizer.js';

if(window.innerWidth < window.innerHeight){
	document.documentElement.style.setProperty('font-size', '35px');

	document.body.style.flexDirection = 'column';
	document.getElementById('left-container').style.width = '100%';
	const right_container = document.getElementById('right-container');
	right_container.style.width = '100%';
	right_container.style.height = '100%';
	right_container.style.overflowY = 'visible';
	right_container.style.marginTop = 'var(--padding)';
}

const fileInput = document.getElementById('file-input');
fileInput.addEventListener('change', main);

var name = 1;

function main(event){
	//delete elements with id of 'ascii-art'
	const ascii_art = document.getElementById('ascii-art');
	if(ascii_art){
		ascii_art.parentNode.removeChild(ascii_art);
	}
	var img = new Image;
	img.src= URL.createObjectURL(event.target.files[0]);

	img.onload = () => {
		var base64String;
		const minChar = document.getElementById('min-char-input').value;
		const isColor = document.getElementById('is-color-input').checked;
		if(img.width < img.height){
			base64String = Resize(img, minChar, img.height*minChar/img.width,0);
		}else{
			base64String = Resize(img, img.width*minChar/img.height, minChar,0);
		}
		const img_container = document.getElementById('image-container');
		img_container.innerHTML = `<img src="${base64String}">`;

		getPixels(base64String, isColor, (pixels)=>{
			try{
				const link = createAscii(pixels, isColor);
				if(link){
					const button = document.createElement('button');
					button.innerHTML = 'Download';
					button.id = 'download-button';
					button.addEventListener('click', ()=>{
						link.click();
					});
					const container = document.getElementById('save-button-container');
					container.innerHTML = '';
					container.appendChild(button);
				}
				showReprocess(event);
			}catch(e){
				throw new Error(e);
			}
		});
	}
}
function showReprocess(event){
	const container = document.getElementById('recreate-button-container');
	const button = document.createElement('button');
	button.innerHTML = 'Recreate';
	button.id = 'recreate-button';
	button.addEventListener('click', ()=>{
		main(event);
	});
	container.innerHTML = '';
	container.appendChild(button);
}

function createAscii(pixels, isColor){
	try{
		const char_font = 'monospace',
			char_size = 15,
			char_width = 12,
			char_height = 12;

		const ascii_list = document.getElementById('ascii-list-input').value.split(' ');
		const canvas = document.getElementById('canvas');
		canvas.width = pixels[0].length * char_width;
		canvas.height = pixels.length * char_height;

		const ctx = canvas.getContext('2d');
		ctx.fillStyle = '#000';
		ctx.fillRect(0,0,canvas.width,canvas.height);

		for(let y=0; y<pixels.length; y++){
			for(let x=0; x<pixels[0].length; x++){
				let index,
					pixel=pixels[y][x];
				if(isColor){
					index = Math.floor(
						(pixel.r+pixel.g+pixel.b)/3 * (ascii_list.length-1)
					);
					ctx.fillStyle = `rgb(${pixel.r*255},${pixel.g*255},${pixel.b*255})`;
				}else{
					index = Math.floor(
						pixel.g * (ascii_list.length-1)
					);
					ctx.fillStyle = `rgb(${pixel.g*255},${pixel.g*255},${pixel.g*255})`;
				}
				ctx.font = char_size + 'px ' + char_font;
				ctx.fillText(
					ascii_list[index], 
					x*char_width, 
					y*char_height + char_size/1.5
				);
			}
		}

		//save canvas as jpg
		const link = document.createElement('a');
		link.download = `ascii_${name}.jpg`;
		link.href = canvas.toDataURL('image/jpeg', 1.0);
		name++;
		return link;
	}catch(e){
		throw new Error(e);
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

