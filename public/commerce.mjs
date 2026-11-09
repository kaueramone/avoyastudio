// EUR is the catalogue base; BRL is a configurable shop price conversion.
export const europeanCountries=['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','RO','SK','SI','ES','SE','GB','NO','IS','LI','CH','AD','MC','SM','VA'];
export const defaultShipping={origin_postcode:'5340-262',portugal_cents:1580,europe_cents:3970,brazil_cents:4750,eur_brl:6.1449,rate_date:'2026-11-06',max_weight_g:1000};
export let shippingSettings={...defaultShipping};
export function configureShipping(value){shippingSettings={...defaultShipping,...value};}
export function selectedCurrency(){try{return localStorage.getItem('avoya-currency')==='BRL'?'BRL':'EUR';}catch{return 'EUR';}}
export function convertedCents(eurCents,code=selectedCurrency()){return Math.round(eurCents*(code.toUpperCase()==='BRL'?Number(shippingSettings.eur_brl):1));}
export function formatMoney(amount,code='EUR',language='pt'){return new Intl.NumberFormat(language==='en'?'en-IE':language==='es'?'es-ES':code.toUpperCase()==='BRL'?'pt-BR':'pt-PT',{style:'currency',currency:code.toUpperCase(),currencyDisplay:'narrowSymbol'}).format(amount);}
export function shippingCents(country){return country==='PT'?shippingSettings.portugal_cents:country==='BR'?shippingSettings.brazil_cents:europeanCountries.includes(country)?shippingSettings.europe_cents:null;}
