// WCAG 2.x contrast ratios. Not an accessibility certification.
export function rgb(hex){
 if(typeof hex!=="string"||!/^#(?:[a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/.test(hex))throw Error("Expected hex color");
 let h=hex.slice(1);
 if(h.length===3)h=[...h].map(c=>c+c).join("");
 return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16));
}
export function luminance(hex){
 const channels=rgb(hex).map(n=>{const s=n/255;return s<=0.04045?s/12.92:((s+0.055)/1.055)**2.4;});
 return channels[0]*0.2126+channels[1]*0.7152+channels[2]*0.0722;
}
export function contrast(foreground,background){
 const a=luminance(foreground),b=luminance(background);
 return (Math.max(a,b)+0.05)/(Math.min(a,b)+0.05);
}
export function grade(fg,bg){
 const ratio=contrast(fg,bg);
 return {ratio:Number(ratio.toFixed(2)),AA_normal:ratio>=4.5,AA_large:ratio>=3,AAA_normal:ratio>=7,AAA_large:ratio>=4.5};
}
export function bestText(bg){return contrast("#000000",bg)>=contrast("#ffffff",bg)?"#000000":"#ffffff";}
