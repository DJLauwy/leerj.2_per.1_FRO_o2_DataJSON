const uitvoer = document.getElementById('boeken');
const xhr = new XMLHttpRequest();
//checkboxen voor taal filter
const taalKeuze = document.querySelectorAll('.besturing__cb-taal');
//select voor keuze sorteren
const selectSort = document.querySelector('.besturing__select');
const aantalInWinkelwagen = document.querySelector('.ww__aantal');

xhr.onreadystatechange = () => {
	if(xhr.readyState == 4 && xhr.status == 200){
		let resultaat = JSON.parse(xhr.responseText);
		boeken.filteren(resultaat);
		boeken.uitvoeren();
	}
}
xhr.open('GET', 'boeken.json', true);
xhr.send();

//object ww (winkelwagen)
//   met properties: bestelling (bestelde boeken)
//   en methods: boekToevoegen, dataOphalen, uitvoeren...

const ww = {
	bestelling: [],
	boekToevoegen(obj){
		let gevonden = this.bestelling.filter(b => b.ean == obj.ean);
		if(gevonden.length == 0){
			obj.besteldAantal ++;
			ww.bestelling.push(obj);
		} else {
			gevonden[0].besteldAantal ++;
		}
		
		localStorage.wwBestelling = JSON.stringify(this.bestelling);
		this.uitvoeren();
	},

	// de data uit de local storage halen
	dataOphalen(){
		if(localStorage.wwBestelling){
			this.bestelling = JSON.parse(localStorage.wwBestelling);
		}
		this.uitvoeren();
	},
	uitvoeren(){		
		let html = '<table>';
		let totaal = 0;
		let totaalBesteld = 0;
		this.bestelling.forEach(boek => {
			//complete titel maken
			let completeTitel = "";
			if(boek.voortitel){
				completeTitel += boek.voortitel + " ";
			}
			completeTitel += boek.titel;
			//opbouwen string
			html += '<tr>';
			html += `<td><img src="${boek.cover}" alt="${completeTitel}" class="bestelformulier__cover"></td>`;
			html += `<td>${completeTitel}</td>`;
			html += `<td class="bestelformulier__aantal">
			<i class="fas fa-arrow-down bestelformulier__verlaag" data-role="${boek.ean}"></i>
			${boek.besteldAantal}
			<i class="fas fa-arrow-up bestelformulier__verhoog" data-role="${boek.ean}"></i></td>`;
			html += `<td>${boek.prijs.toLocaleString('nl-NL', {currency: 'EUR', style: 'currency'})}</td>`;
			html += `<td><i class="fas fa-trash bestelformulier__trash" data-role="${boek.ean}"></i></td>`;
			html += '</tr>';
			totaal += boek.prijs*boek.besteldAantal;
			totaalBesteld += boek.besteldAantal;
		});
		html += `<tr><td colspan="3">Totaal</td>
		<td>${totaal.toLocaleString('nl-NL', {currency: 'EUR', style: 'currency'})}</td>
		</tr>`;
		html += '</table>';
		document.getElementById('uitvoer').innerHTML = html;
		aantalInWinkelwagen.innerHTML = totaalBesteld;
		this.trashActiveren();
		this.hogerLagerActiveren();
	},
	hogerLagerActiveren(){
		//verhoog knop
		let hogerKnoppen = document.querySelectorAll('.bestelformulier__verhoog');
		hogerKnoppen.forEach(knop => {
			knop.addEventListener('click', e => {
				let ophoogID = e.target.getAttribute('data-role');
				let opTeHogenBoek = this.bestelling.filter(boek => boek.ean == ophoogID);
				opTeHogenBoek[0].besteldAantal ++;
				localStorage.wwBestelling = JSON.stringify(this.bestelling);
				this.uitvoeren();
			});
		});

		//verlaagknop
		let lagerKnoppen = document.querySelectorAll('.bestelformulier__verlaag');
		lagerKnoppen.forEach(knop => {
			knop.addEventListener('click', e => {
				let verlaagID = e.target.getAttribute('data-role');
				let teVerlagenAantal = this.bestelling.filter(boek => boek.ean == verlaagID);
				if(teVerlagenAantal[0].besteldAantal>1){
					teVerlagenAantal[0].besteldAantal --;
				} else {
					//boek verwijderen
					this.bestelling = this.bestelling.filter(bk => bk.ean != verlaagID);
				}
				localStorage.wwBestelling = JSON.stringify(this.bestelling);
				this.uitvoeren();
			});
		});
	},
	trashActiveren(){
		document.querySelectorAll('.bestelformulier__trash').forEach(trash => {
			trash.addEventListener('click', e => {
				let teVerwijderenBoekID = e.target.getAttribute('data-role');
				this.bestelling = this.bestelling.filter(bk => bk.ean != teVerwijderenBoekID);
				//local storage bijwerken
				localStorage.wwBestelling = JSON.stringify(this.bestelling);
				this.uitvoeren();
			});
		});
	}
}
// de data uit de local storage halen
ww.dataOphalen();

//object boeken
//   met properties: taalFilter, data, es
//   en methods: filteren, sorteren, uitvoeren ...
const boeken = {

	taalFilter: ['Engels', 'Duits', 'Nederlands'],
	es: 'titel', //de eigenschap van de boeken waarop gesorteerd wordt
	oplopend: 1, //volgorde van sorteren

	//er wordt hier een eigenschap data aangemaakt (regel 25 bij het filteren)

	//filteren op taal
	filteren(gegevens){
		this.data = gegevens.filter((bk) => {
			let bool = false;
				this.taalFilter.forEach((taal) => {
					if(bk.taal == taal){bool = true}
				});
			return bool;
		});
	},

	//de sorteerfunctie
	sorteren(){
		if(this.es == 'titel'){
			this.data.sort((a,b)=>(a.titel.toUpperCase()>b.titel.toUpperCase())?this.oplopend:-1*this.oplopend);
		} else if(this.es == 'paginas') {
			this.data.sort((a,b)=>(a.paginas>b.paginas)?this.oplopend:-1*this.oplopend);
		} else if(this.es == 'uitgave') {
			this.data.sort((a,b)=>(a.uitgave>b.uitgave)?this.oplopend:-1*this.oplopend);
		} else if(this.es == 'prijs') {
			this.data.sort((a,b)=>(a.prijs>b.prijs)?this.oplopend:-1*this.oplopend);  
		} else if(this.es == 'auteur') {
			this.data.sort((a,b)=>(a.auteurs[0].achternaam>b.auteurs[0].achternaam)?this.oplopend:-1*this.oplopend);
		}
	},

	//er wordt hier een eigenschap data aangemaakt (regel 7)
	uitvoeren(){
		//eerst sorteren
		this.sorteren();
		let html = "";
		this.data.forEach(boek =>{

			//elk boek een eigenschap aantalBesteld geven
			boek.besteldAantal = 0;

			//in het geval van een voortitel moet deze voor de titel worden geplaatst
			let completeTitel = "";
			if(boek.voortitel){
				completeTitel += boek.voortitel + " ";
			}
			completeTitel += boek.titel;
			//een lijst met auteurs maken
			let auteurs = "";
			boek.auteurs.forEach((schrijver,index) => {
				let tv = schrijver.tussenvoegsel ? schrijver.tussenvoegsel + " " : "";
				//het scheidingsteken tussen de auteurs
				let separator = ", ";
				if(index >= boek.auteurs.length-2){separator = " en "}
				if(index >= boek.auteurs.length-1){separator = ""}
				auteurs += schrijver.voornaam + " " + tv + schrijver.achternaam + separator;
			});
			//html var toevoegen
			html += `<section class="boek">`;
			html += `<img class="boek__cover" src="${boek.cover}" alt="${completeTitel}">`
			html += `<div class="boek__info">`;
			html += `<h3 class="boek__kop">${completeTitel}</h3>`;
			html += `<p class="boek__auteurs">${auteurs}</p>`
			html += `<span class="boek__uitgave"> ${this.datumOmzetten(boek.uitgave)}</span>`;
			html += `<span class="boek__ean"> ean: ${boek.ean}</span>`;
			html += `<span class="boek__paginas"> ${boek.paginas} pagina's </span>`;
			html += `<span class="boek__taal"> ${boek.taal}</span>`;
			html += `<div class="boek__prijs">${boek.prijs.toLocaleString('nl-NL', {currency: 'EUR', style: 'currency'})}
					<a href="#" class="boek__bestel-knop" data-role="${boek.ean}">bestellen</a></div>`;
			html += `</div></section>`;
		});
		uitvoer.innerHTML = html;
		//de gemaakte knoppen voorzien van eventlistener
		document.querySelectorAll('.boek__bestel-knop').forEach(knop => {
			knop.addEventListener('click', e => {
				e.preventDefault();
				let boekID = e.target.getAttribute('data-role');
				let gekliktBoek = this.data.filter(b => b.ean == boekID);
				ww.boekToevoegen(gekliktBoek[0]);
			});
		});
	},
	datumOmzetten(datumString){
		let datum = new Date(datumString);
		let jaar = datum.getFullYear();
		let maand = this.geefMaandnaam(datum.getMonth());
		return `${maand} ${jaar}`;
	},
	geefMaandnaam(m){
		let maand = "";
		switch(m){
			case 0 : maand = 'januari'; break;
			case 1 : maand = 'februari'; break;
			case 2 : maand = 'maart'; break;
			case 3 : maand = 'april'; break;
			case 4 : maand = 'mei'; break;
			case 5 : maand = 'juni'; break;
			case 6 : maand = 'juli'; break;
			case 7 : maand = 'augustus'; break;
			case 8 : maand = 'september'; break;
			case 9 : maand = 'oktober'; break;
			case 10 : maand = 'november'; break;
			case 11 : maand = 'december'; break;
			default : maand = m;
		}
		return maand;
	}
}

const pasFilterAan = () => {
	let gecheckteTaalKeuze = [];
	taalKeuze.forEach(cb => {
		if(cb.checked) gecheckteTaalKeuze.push(cb.value);
	});
	boeken.taalFilter = gecheckteTaalKeuze;
	boeken.filteren(JSON.parse(xhr.responseText));
	boeken.uitvoeren();
}

const pasSortEigAan = () => {
	boeken.es = selectSort.value;
	boeken.uitvoeren();
}

taalKeuze.forEach(cb => cb.addEventListener('change', pasFilterAan));

selectSort.addEventListener('change', pasSortEigAan);
document.querySelectorAll('.besturing__rb').forEach(rb => rb.addEventListener('change', () => {
	boeken.oplopend = rb.value;
	boeken.uitvoeren();
}));