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
 ["Ariete","♈","Cardinale di Fuoco: parte prima degli altri e trascina con coraggio, ma rende meno nella lunga attesa.",98,62,48,79,55],
 ["Toro","♉","Fisso di Terra: costruisce lentamente, protegge ciò che funziona e oppone una resistenza eccezionale al cambiamento.",40,98,70,61,27],
 ["Gemelli","♊","Mutevole d’Aria: collega idee e persone con grande rapidità, cambiando linguaggio e strategia mentre osserva.",80,42,67,87,97],
 ["Cancro","♋","Cardinale d’Acqua: percepisce il clima emotivo, protegge il gruppo e agisce quando sente minacciata la sicurezza.",47,78,95,71,53],
 ["Leone","♌","Fisso di Fuoco: sostiene la propria visione con calore, orgoglio e una presenza capace di catalizzare il gruppo.",92,82,58,98,45],
 ["Vergine","♍","Mutevole di Terra: analizza, corregge e rende pratico ciò che cambia, con costanza più metodica che ostinata.",51,90,82,49,85],
 ["Bilancia","♎","Cardinale d’Aria: muove relazioni e accordi, legge gli equilibri e influenza senza imporre frontalmente.",57,56,77,94,84],
 ["Scorpione","♏","Fisso d’Acqua: legge ciò che resta nascosto, resiste nelle crisi e concentra l’energia su obiettivi profondi.",68,96,98,73,39],
 ["Sagittario","♐","Mutevole di Fuoco: apre strade, rischia e rilancia verso nuovi orizzonti, soffrendo però la continuità minuziosa.",97,50,63,83,93],
 ["Capricorno","♑","Cardinale di Terra: trasforma ambizione e responsabilità in una strategia sostenuta per lunghissimo tempo.",60,99,69,81,59],
 ["Acquario","♒","Fisso d’Aria: mantiene saldi i propri principi ma reinventa sistemi, prospettive e regole collettive.",72,72,84,85,99],
 ["Pesci","♓","Mutevole d’Acqua: assorbe atmosfere e sfumature, immagina alternative e si adatta oltre i confini consueti.",38,52,99,68,95]
];

export const zodiacTiles=rawTiles.map(([name,symbol,signature,...numbers])=>({name,symbol,signature,values:Object.fromEntries(tileCategories.map((category,index)=>[category.id,numbers[index]]))}));

export function shuffledTiles(rng=Math.random){const out=zodiacTiles.map(tile=>({...tile,values:{...tile.values}}));for(let i=out.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out}
export function tileByName(name){return zodiacTiles.find(tile=>tile.name===name)}
export function resolveTileBattle(attacker,defender,category){const attack=attacker.values[category],defense=defender.values[category];return{attack,defense,winner:attack===defense?"tie":attack>defense?"attacker":"defender"}}
export function strongestCategory(tile){return tileCategories.reduce((best,category)=>tile.values[category.id]>tile.values[best.id]?category:best,tileCategories[0]).id}
export function bestDefense(tiles,category){let best=0;for(let i=1;i<tiles.length;i++)if(tiles[i].values[category]>tiles[best].values[category])best=i;return best}
