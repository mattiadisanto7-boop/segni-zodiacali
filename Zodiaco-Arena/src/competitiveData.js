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
 slow:{title:"Domanda progressiva",short:"Il testo appare parola per parola",rule:"Puoi rispondere in qualsiasi momento. Appena arriva la prima risposta corretta, la domanda si chiude per l’avversario."},
 steal:{title:"Ruba i punti",short:"Il primo corretto sottrae punti al rivale",rule:"La prima risposta corretta ruba all’avversario una quantità che diminuisce con il tempo. Una risposta errata lascia all’altro la possibilità di tentare."}
};

export function phaseForRound(round){return championshipPhases[round%championshipPhases.length]}
export function phaseNumber(round){return Math.floor(round/4)+1}
export function speedPoints(elapsed,max=320,min=120,duration=20000){return Math.max(min,Math.round(max-(max-min)*Math.min(1,elapsed/duration)))}

export const tileCategories=[
 {id:"slancio",label:"Slancio",description:"Iniziativa, coraggio e rapidità nel partire"},
 {id:"tenacia",label:"Tenacia",description:"Resistenza, costanza e capacità di non mollare"},
 {id:"intuito",label:"Intuito",description:"Lettura di persone, atmosfere e segnali nascosti"},
 {id:"influenza",label:"Influenza",description:"Capacità di convincere, unire o guidare gli altri"},
 {id:"adattabilita",label:"Adattabilità",description:"Flessibilità davanti a cambiamenti e imprevisti"}
];

const rawTiles=[
 ["Ariete","♈",94,61,48,63,52],
 ["Toro","♉",45,96,62,58,39],
 ["Gemelli","♊",72,44,65,78,95],
 ["Cancro","♋",48,73,93,69,51],
 ["Leone","♌",89,74,55,96,46],
 ["Vergine","♍",52,88,76,47,84],
 ["Bilancia","♎",54,59,72,94,79],
 ["Scorpione","♏",66,92,97,61,43],
 ["Sagittario","♐",96,53,58,75,91],
 ["Capricorno","♑",57,98,64,71,60],
 ["Acquario","♒",68,65,79,82,98],
 ["Pesci","♓",42,56,99,73,90]
];

export const zodiacTiles=rawTiles.map(([name,symbol,...numbers])=>({name,symbol,values:Object.fromEntries(tileCategories.map((category,index)=>[category.id,numbers[index]]))}));

export function shuffledTiles(rng=Math.random){const out=zodiacTiles.map(tile=>({...tile,values:{...tile.values}}));for(let i=out.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out}
export function tileByName(name){return zodiacTiles.find(tile=>tile.name===name)}
export function resolveTileBattle(attacker,defender,category){const attack=attacker.values[category],defense=defender.values[category];return{attack,defense,winner:attack===defense?"tie":attack>defense?"attacker":"defender"}}
export function strongestCategory(tile){return tileCategories.reduce((best,category)=>tile.values[category.id]>tile.values[best.id]?category:best,tileCategories[0]).id}
export function bestDefense(tiles,category){let best=0;for(let i=1;i<tiles.length;i++)if(tiles[i].values[category]>tiles[best].values[category])best=i;return best}

