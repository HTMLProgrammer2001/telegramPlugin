console.log('Plugin activated');

let getFile = async (blobURL) => {
	let res = await fetch(blobURL);
	let blob = await res.blob();
	return new File([blob], 'audio.wav', {type: 'audio/wav'});

	console.log('File created');
};

async function translate(file){
	let body = new FormData();
	body.append('audio', file);

	let ftc;

	try{
		ftc = await fetch('http://localhost:9000/translate', {
			method: 'POST',
			body
		});
	}
	catch(e){
		alert('Erorr in translation');
		return;
	}

	if(!ftc.ok){
		alert('Error in translation');
		console.error('Error');

		return;
	}

	console.log('Get text');

	return await ftc.text();
};

setInterval(() => {
	let elements = document.querySelectorAll('.audio_player_wrap');

	Array.prototype.map.call(elements, async (el, index) => {
		if(el.classList.contains('translate-mounted')){
			return;
		}

		let transElem = document.createElement('div');
		transElem.classList.add('trans-but');
		transElem.textContent = 'Show text';

		let textElem = document.createElement('div');

		transElem.addEventListener('click', async (e) => {
			e.stopPropagation();

			if(!textElem.classList.contains('trans-text-mounted')){
				let audioElem = el.querySelector('.audio_player_media > [src]');

				if(!audioElem){
					return;
				}

				let file = await getFile(audioElem.getAttribute('src'));
				let text = await translate(file);

				if(!text)
					return;

				textElem.textContent = text;
				textElem.classList.add('trans-text-mounted');

				e.target.insertAdjacentElement('afterend', textElem);

				transElem.textContent = 'Hide text';
			}
			else{
				
				if(textElem.classList.contains('hide')){
					textElem.classList.remove('hide');
					transElem.textContent = 'Hide text';
				}
				else{
					textElem.classList.add('hide');
					transElem.textContent = 'Show text';
				}
			}
		}, true);

		el.insertAdjacentElement('afterend', transElem);

		el.classList.add('translate-mounted');
	});
}, 100);
