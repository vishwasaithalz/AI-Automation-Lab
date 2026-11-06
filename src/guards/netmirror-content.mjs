const BADGES=/\b(verified|certified|audited|legal streaming|verified hd)\b/i;
export function normalizeNewsAge(publishedAt,now=new Date()){
 const t=Date.parse(publishedAt??'');
 if(!Number.isFinite(t)||t>now.getTime()+300000)return null;
 const hours=Math.floor((now.getTime()-t)/3600000);
 if(hours<0)return null;
 if(hours<24)return hours+'h ago';
 if(hours<24*30)return Math.floor(hours/24)+'d ago';
 return new Date(t).toISOString().slice(0,10);
}
export function selectUpcoming(items,now=new Date()){
 const today=now.toISOString().slice(0,10);
 return items.filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x.releaseDate??'')&&x.releaseDate>today&&x.status!=='released').sort((a,b)=>a.releaseDate.localeCompare(b.releaseDate));
}
export function safeProviderLabel(item){
 const approved=item?.providerVerified===true&&item?.licenseEvidenceUrl&&/^https:\/\//.test(item.licenseEvidenceUrl);
 return approved?item.provider:'Availability unverified';
}
export function contentWarnings(item){
 const issues=[];
 if(BADGES.test(item?.badge??'')&&!item?.verificationEvidenceUrl)issues.push('Unsubstantiated verification claim');
 if(item?.provider&&!item?.licenseEvidenceUrl)issues.push('Provider attribution lacks evidence');
 if(item?.releaseDate&&!/^\d{4}-\d{2}-\d{2}$/.test(item.releaseDate))issues.push('Invalid release date');
 return issues;
}
