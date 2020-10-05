const uitvoer = document.getElementById('boeken');
const xhr = new XMLHttpRequest();

xhr.onreadystatechange = () => {
	if(xhr.readyState == 4 && xhr.status == 200){
		let resultaat = JSON.parse(xhr.responseText);
		boeken.data = resultaat;
		boeken.uitvoeren();
	}
}

xhr.open('GET', 'boeken.json', true);
xhr.send();

const boeken = {
	//er wordt hier een eigenschap data aangemaakt (regel 7)
	uitvoeren(){
		let html = "";
		this.data.forEach(boek =>{
			//in het geval van een voortitel moet deze voor de titel worden geplaatst
			let titel = "";
			if(boek.voortitel){
				titel += boek.voortitel + " ";
			}
			titel += boek.titel;
			html += `<h3>${titel}</h3>`;
		});
		uitvoer.innerHTML = html;
	}
} 