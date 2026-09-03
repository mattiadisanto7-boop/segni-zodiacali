export const betOptions=[50,100,200,350];

export const championshipPhases=[
 ...Array(4).fill("hot"),
 ...Array(4).fill("bet"),
 ...Array(4).fill("slow"),
 ...Array(4).fill("steal")
];

export const phaseInfo={
 hot:{title:"Dito più caldo",short:"Il primo corretto vale di più",rule:"Entrambi possono rispondere. La prima risposta corretta ottiene il premio maggiore; la seconda ne ottiene uno ridotto."},
 bet:{title:"Scommessa",short:"Rischia prima di vedere la domanda",rule:"Scegli 50, 100, 200 o 350 punti prima della domanda. Se indovini li guadagni, se sbagli li perdi."},
 slow:{title:"Domanda progressiva",short:"Il testo appare parola per parola",rule:"Hai 60 secondi. Il testo si completa nella prima metà del tempo e resta visibile fino alla scadenza; la prima risposta corretta chiude la manche."},
 steal:{title:"Ruba i punti",short:"Il primo corretto sottrae punti al rivale",rule:"La prima risposta corretta ruba all’avversario una quantità che diminuisce con il tempo. Una risposta errata lascia all’altro la possibilità di tentare."}
};

export function phaseForRound(round){return championshipPhases[round%championshipPhases.length]}
export function phaseNumber(round){return Math.floor(round/4)+1}
export function speedPoints(elapsed,max=320,min=120,duration=20000){return Math.max(min,Math.round(max-(max-min)*Math.min(1,elapsed/duration)))}

export const tileCategories=[
 {id:"slancio",label:"Slancio",description:"Fuoco, iniziativa, coraggio e rapidità nel cominciare"},
 {id:"tenacia",label:"Tenacia",description:"Qualità fissa o terrestre, disciplina e resistenza nel tempo"},
 {id:"intuito",label:"Intuito",description:"Ricettività emotiva, lettura dei segnali e profondità percettiva"},
 {id:"influenza",label:"Influenza",description:"Presenza, comunicazione, leadership e capacità di coinvolgere"},
 {id:"adattabilita",label:"Adattabilità",description:"Qualità mutevole, elasticità mentale e risposta agli imprevisti"}
];

const rawTiles=[
 ["Ariete","♈","Cardinale di Fuoco: eccelle nell’avvio e nel coraggio immediato, mentre tenacia e adattamento restano solide ma non dominanti.",92,62,53,82,71],
 ["Toro","♉","Fisso di Terra: costruisce con pazienza, tutela la continuità e legge i segnali concreti, senza primeggiare nello scatto iniziale.",52,94,74,68,72],
 ["Gemelli","♊","Mutevole d’Aria: collega idee e persone rapidamente; comunicazione e flessibilità compensano una resistenza meno ostinata.",78,55,65,82,80],
 ["Cancro","♋","Cardinale d’Acqua: coglie il clima emotivo, protegge il gruppo e conserva ciò che conta, con iniziativa più prudente.",58,81,92,74,55],
 ["Leone","♌","Fisso di Fuoco: unisce presenza, coraggio e continuità creativa; la difficoltà maggiore è cambiare rotta senza perdere il centro.",88,84,56,92,40],
 ["Vergine","♍","Mutevole di Terra: analizza, corregge e rende pratico ciò che cambia, affidandosi più al metodo che all’impatto scenico.",58,88,76,60,78],
 ["Bilancia","♎","Cardinale d’Aria: avvia accordi, legge gli equilibri e coinvolge con tatto; distribuisce la forza senza picchi ingestibili.",65,60,75,88,72],
 ["Scorpione","♏","Fisso d’Acqua: resiste nelle crisi e percepisce ciò che resta nascosto, sacrificando leggerezza e cambi di rotta immediati.",66,92,94,67,41],
 ["Sagittario","♐","Mutevole di Fuoco: apre strade, rischia e rilancia con elasticità; la continuità paziente è la sua sfida strategica.",91,52,57,77,83],
 ["Capricorno","♑","Cardinale di Terra: converte ambizione e responsabilità in durata e struttura, con meno spazio per improvvisazione e intuito.",62,95,64,83,56],
 ["Acquario","♒","Fisso d’Aria: difende principi e reinventa sistemi; adattamento mentale e visione compensano un’influenza meno personale.",68,72,74,56,90],
 ["Pesci","♓","Mutevole d’Acqua: assorbe sfumature e immagina alternative con enorme elasticità, ma fatica nello scontro frontale e nella struttura.",50,58,92,64,96]
];

export const zodiacTiles=rawTiles.map(([name,symbol,signature,...numbers])=>({name,symbol,signature,values:Object.fromEntries(tileCategories.map((category,index)=>[category.id,numbers[index]]))}));

export function shuffledTiles(rng=Math.random){const out=zodiacTiles.map(tile=>({...tile,values:{...tile.values}}));for(let i=out.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out}
export function tileByName(name){return zodiacTiles.find(tile=>tile.name===name)}
export function resolveTileBattle(attacker,defender,category){const attack=attacker.values[category],defense=defender.values[category];return{attack,defense,winner:attack===defense?"tie":attack>defense?"attacker":"defender"}}
export function strongestCategory(tile){return tileCategories.reduce((best,category)=>tile.values[category.id]>tile.values[best.id]?category:best,tileCategories[0]).id}
export function bestDefense(tiles,category){let best=0;for(let i=1;i<tiles.length;i++)if(tiles[i].values[category]>tiles[best].values[category])best=i;return best}
