import NatalPackage from "circular-natal-horoscope-js";
import {astroAspects,astroBodies,astroHouses,astroSigns,mainBodyKeys} from "./astrologyData.js";

const {Origin,Horoscope}=NatalPackage;
const round=(value,digits=2)=>Number(Number(value).toFixed(digits));
const safeLongitude=value=>((Number(value)%360)+360)%360;
const degreeText=longitude=>{const value=safeLongitude(longitude)%30,degrees=Math.floor(value),minutes=Math.floor((value-degrees)*60);return `${degrees}° ${String(minutes).padStart(2,"0")}′`};
const lunarPhases=[
 [22.5,"Luna nuova","inizio, semina e concentrazione dell’intento"],[67.5,"Falce crescente","slancio iniziale e costruzione"],[112.5,"Primo quarto","decisione, attrito e azione"],[157.5,"Gibbosa crescente","affinamento e preparazione"],[202.5,"Luna piena","culmine, visibilità e polarità"],[247.5,"Gibbosa calante","condivisione e restituzione"],[292.5,"Ultimo quarto","revisione, svolta e rilascio"],[337.5,"Falce calante","chiusura, interiorizzazione e riposo"],[360,"Luna nuova","inizio, semina e concentrazione dell’intento"]
];

function normalizePoint(point){
 const longitude=safeLongitude(point.ChartPosition.Ecliptic.DecimalDegrees),meta=astroBodies[point.key]||{name:point.label,glyph:"•",role:"punto astrologico"},sign=astroSigns[point.Sign.key];
 return{key:point.key,name:meta.name,glyph:meta.glyph,role:meta.role,signKey:point.Sign.key,sign:sign?.name||point.Sign.label,signSymbol:sign?.symbol||"",longitude,degree:round(longitude%30),degreeText:degreeText(longitude),house:point.House?.id||null,retrograde:!!point.isRetrograde};
}

function dominant(counts){const max=Math.max(...Object.values(counts));return Object.entries(counts).filter(([,value])=>value===max).map(([key])=>key)}

export function calculateNatalChart(input){
 const [year,month,date]=String(input.date||"").split("-").map(Number),[hour,minute]=String(input.time||"").split(":").map(Number),latitude=Number(input.latitude),longitude=Number(input.longitude);
 if(!year||!month||!date||!Number.isInteger(hour)||!Number.isInteger(minute))throw new Error("Inserisci data e ora locale complete.");
 if(!Number.isFinite(latitude)||latitude< -66||latitude>66)throw new Error("La latitudine deve essere compresa tra −66 e 66 gradi per un calcolo stabile delle case.");
 if(!Number.isFinite(longitude)||longitude< -180||longitude>180)throw new Error("La longitudine deve essere compresa tra −180 e 180 gradi.");
 const origin=new Origin({year,month:month-1,date,hour,minute,latitude,longitude});
 const horoscope=new Horoscope({origin,houseSystem:input.houseSystem||"placidus",zodiac:input.zodiac||"tropical",aspectPoints:["bodies","points","angles"],aspectWithPoints:["bodies","points","angles"],aspectTypes:["major"],customOrbs:{conjunction:8,opposition:8,trine:7,square:7,sextile:5}});
 const bodies=horoscope.CelestialBodies.all.map(normalizePoint),points=horoscope.CelestialPoints.all.map(normalizePoint),angles=horoscope.Angles.all.map(normalizePoint),allPoints=[...bodies,...points,...angles],pointMap=Object.fromEntries(allPoints.map(point=>[point.key,point]));
 const houses=horoscope.Houses.map(house=>{const longitude=safeLongitude(house.ChartPosition.StartPosition.Ecliptic.DecimalDegrees),sign=astroSigns[house.Sign.key],meta=astroHouses[house.id-1];return{id:house.id,title:meta.title,theme:meta.theme,signKey:house.Sign.key,sign:sign?.name||house.Sign.label,symbol:sign?.symbol||"",longitude,degreeText:degreeText(longitude)}});
 const aspects=horoscope.Aspects.all.filter(aspect=>astroAspects[aspect.aspectKey]&&pointMap[aspect.point1Key]&&pointMap[aspect.point2Key]).map(aspect=>({key:`${aspect.point1Key}-${aspect.aspectKey}-${aspect.point2Key}`,type:aspect.aspectKey,...astroAspects[aspect.aspectKey],point1:pointMap[aspect.point1Key],point2:pointMap[aspect.point2Key],orb:round(aspect.orb)})).sort((a,b)=>a.orb-b.orb);
 const elementCounts={Fuoco:0,Terra:0,Aria:0,Acqua:0},modalityCounts={Cardinale:0,Fisso:0,Mutevole:0};
 for(const body of bodies.filter(body=>mainBodyKeys.includes(body.key))){const sign=astroSigns[body.signKey];elementCounts[sign.element]++;modalityCounts[sign.modality]++}
 const ascendant=pointMap.ascendant,ascendantMeta=astroSigns[ascendant.signKey],rulerName=ascendantMeta.ruler,ruler=allPoints.find(point=>point.name===rulerName);
 const bigThree=[pointMap.sun,pointMap.moon,ascendant];
 const majorBodies=bodies.filter(body=>mainBodyKeys.includes(body.key)),phaseAngle=round(safeLongitude(pointMap.moon.longitude-pointMap.sun.longitude)),phase=lunarPhases.find(([limit])=>phaseAngle<limit),retrogrades=majorBodies.filter(body=>body.retrograde);
 const signGroups=Object.values(majorBodies.reduce((groups,body)=>{(groups[body.signKey]??=[]).push(body);return groups},{})).filter(group=>group.length>=3).map(group=>({kind:"segno",label:group[0].sign,bodies:group.map(body=>body.name)}));
 const houseGroups=Object.values(majorBodies.reduce((groups,body)=>{if(body.house)(groups[body.house]??=[]).push(body);return groups},{})).filter(group=>group.length>=3).map(group=>({kind:"casa",label:`Casa ${group[0].house}`,bodies:group.map(body=>body.name)}));
 const quadrants={"I · identità":[1,2,3],"II · radici":[4,5,6],"III · relazioni":[7,8,9],"IV · mondo pubblico":[10,11,12]},quadrantCounts=Object.fromEntries(Object.entries(quadrants).map(([label,ids])=>[label,majorBodies.filter(body=>ids.includes(body.house)).length]));
 return{
  profile:{name:String(input.name||"").trim(),place:String(input.place||"").trim(),date:input.date,time:input.time,latitude,longitude,timezone:origin.timezone.name,localTime:origin.localTimeFormatted,utcTime:origin.utcTimeFormatted,zodiac:input.zodiac||"tropical",houseSystem:input.houseSystem||"placidus"},
  bodies,points,angles,houses,aspects,bigThree,elementCounts,modalityCounts,dominantElements:dominant(elementCounts),dominantModalities:dominant(modalityCounts),chartRuler:{name:rulerName,placement:ruler||null},lunarPhase:{name:phase[1],meaning:phase[2],angle:phaseAngle},retrogrades,stelliums:[...signGroups,...houseGroups],quadrantCounts,
  synthesis:{identity:`Il Sole in ${pointMap.sun.sign}, in casa ${pointMap.sun.house}, orienta l’identità verso uno stile ${astroSigns[pointMap.sun.signKey].style}; la Luna in ${pointMap.moon.sign}, in casa ${pointMap.moon.house}, colora bisogni e reazioni con ${astroSigns[pointMap.moon.signKey].core}.`,approach:`L’Ascendente in ${ascendant.sign} descrive un ingresso nelle situazioni ${ascendantMeta.style}. Il governatore del tema è ${rulerName}${ruler?`, collocato in ${ruler.sign} e casa ${ruler.house}`:""}.`,balance:`La distribuzione dei dieci pianeti principali mette in evidenza ${dominant(elementCounts).join(" e ")} come elemento e ${dominant(modalityCounts).join(" e ")} come modalità. È una misura di enfasi del tema, non un giudizio di valore.`}
 };
}

export function placementInterpretation(point){const sign=astroSigns[point.signKey],house=point.house?astroHouses[point.house-1]:null;return `${point.name} riguarda ${point.role}. In ${point.sign} si esprime in modo ${sign.style}; ${sign.gift}, mentre l’attenzione va posta sul fatto che ${sign.shadow}. ${house?`La casa ${house.id} concentra questa funzione su ${house.theme}.`:"La posizione non è assegnata a una casa in questo calcolo."}`}
