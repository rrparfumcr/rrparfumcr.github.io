/* RR PARFUM — Configurá tus canales de venta antes de publicar. */
const RR_CONFIG = {
  whatsappNumber: "50670470857",
  instagramUrl: "https://www.instagram.com/", // Pegá aquí el perfil oficial de RR Parfum
  productsUrl: "products.json"
};
const state = { products: [], category: 'Todos', gender: 'Todos', search: '', sort: 'featured', limit: 16, activeProduct: null, activeImages: [], activeImageIndex: 0, cart: [], returnToCart: false, deliveryMap: null, deliveryMarker: null, leafletPromise: null, lastGeocodeRequest: 0, gamValidation: 'unselected', gamValidationToken: 0, gamValidationTimer: 0 };
const $ = s => document.querySelector(s);
const productGrid = $('#productGrid');
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
function normalizedCategory(p){const c=normalize(p.categoria); if(c.includes('arab'))return 'Árabe'; if(c.includes('nicho'))return 'Nicho'; if(c.includes('body')||c.includes('bodys'))return 'Body'; if(c.includes('disenador')||c.includes('designer'))return 'Diseñador'; return p.categoria || 'Otros';}
function categoryLabel(p){const c=normalizedCategory(p);return c==='Árabe'?'Árabe':c==='Body'?'Body':c;}
function interleaveByGender(products){
 const groups=new Map();
 products.forEach(product=>{const gender=normalize(product.genero)||'otros';if(!groups.has(gender))groups.set(gender,[]);groups.get(gender).push(product);});
 const order=['mujer','hombre','unisex',...Array.from(groups.keys()).filter(gender=>!['mujer','hombre','unisex'].includes(gender))].filter(gender=>groups.has(gender));
 const positions=new Map(order.map(gender=>[gender,0]));
 const result=[];
 while(result.length<products.length){
  order.forEach(gender=>{const position=positions.get(gender);const group=groups.get(gender);if(position<group.length){result.push(group[position]);positions.set(gender,position+1);}});
 }
 return result;
}
const RR_EDITORIAL_IMAGES = [
 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=90',
 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=900&q=90',
 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=90',
 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=90'
];
function productImages(p){
 const supplied=productValues(p.imagenes).length?productValues(p.imagenes):productValues(p.imagen);
 if(supplied.length)return supplied.slice(0,2);
 // El catálogo heredado trae una sola imagen genérica repetida en todos los registros.
 // Alternamos fotografías editoriales para evitar una cuadrícula visualmente duplicada.
 const raw=String(p.imagen||'');
 const repeatedGeneric=raw.includes('photo-1594035910387-fea47794261f');
 if(raw && !repeatedGeneric) return [raw];
 const id=Number(p.id)||0;
 const category=normalizedCategory(p);
 const offset=category==='Árabe'?1:category==='Nicho'?2:category==='Body'?3:0;
 return [RR_EDITORIAL_IMAGES[(id+offset)%RR_EDITORIAL_IMAGES.length]];
}
function productImage(p){return productImages(p)[0];}
function whatsappUrl(message){const number=RR_CONFIG.whatsappNumber.replace(/\D/g,'');return number?`https://wa.me/${number}?text=${encodeURIComponent(message)}`:`https://wa.me/?text=${encodeURIComponent(message)}`;}
function whatsappLink(p){const msg=p?`Hola, RR Parfum. Quisiera consultar precio y disponibilidad de ${p.nombre}${p.marca?` de ${p.marca}`:''}${p.version?` (${p.version})`:''}.`:'Hola, RR Parfum. Quisiera información sobre sus perfumes y disponibilidad.';return whatsappUrl(msg);}
function setMapStatus(message,status=''){const element=$('#mapStatus');element.textContent=message;element.classList.toggle('is-error',status==='error');element.classList.toggle('is-success',status==='success');}
function setContactLinks(){const wa=whatsappLink();['#contactWhatsApp','#floatingWhatsApp'].forEach(s=>{const el=$(s);if(el)el.href=wa;});const instagramUrl=RR_CONFIG.instagramUrl;['#contactInstagram','#floatingInstagram'].forEach(s=>{const el=$(s);if(el)el.href=instagramUrl;});}
function visibleProducts(){let list=state.products.filter(p=>{const cat=normalizedCategory(p);const categoryOK=state.category==='Todos'||(state.category==='Nicho'?cat==='Nicho':cat===state.category);const genderOK=state.gender==='Todos'||normalize(p.genero)===normalize(state.gender);const haystack=normalize([p.nombre,p.marca,p.categoria,p.genero,p.familia,p.descripcion,p.concentracion,p.version].filter(Boolean).join(' '));return categoryOK&&genderOK&&haystack.includes(normalize(state.search));});if(state.sort==='az')list.sort((a,b)=>a.nombre.localeCompare(b.nombre,'es'));if(state.sort==='za')list.sort((a,b)=>b.nombre.localeCompare(a.nombre,'es'));if(state.sort==='brand')list.sort((a,b)=>(a.marca||'').localeCompare(b.marca||'','es'));if(state.sort==='featured'&&state.category==='Todos'&&state.gender==='Todos')list=interleaveByGender(list);return list;}
function cardHTML(p,index){
 const name=escapeHTML(p.nombre||'Fragancia');
 const brand=escapeHTML(p.marca||'RR Parfum');
 const gender=escapeHTML(p.genero||'Unisex');
 const cat=escapeHTML(categoryLabel(p));
 const img=escapeHTML(productImage(p));
 const family=escapeHTML(p.familia||'Fragancia seleccionada');
 const rating=Number(p.rating);
 const ratingHTML=Number.isFinite(rating)&&rating>0?`<span class="product-rating" aria-label="Calificación ${rating.toFixed(1)} de 5">★ <b>${rating.toFixed(1)}</b></span>`:'';
 return `<article class="product-card" tabindex="0" role="button" aria-label="Ver detalles de ${name}" data-id="${escapeHTML(p.id)}" style="animation-delay:${Math.min(index%8,7)*35}ms"><div class="product-image"><img src="${img}" alt="${name} — ${brand}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=90'"><span class="product-tag">${cat}</span>${ratingHTML}<span class="product-view">DESCUBRIR FRAGANCIA <span>↗︎</span></span></div><div class="product-meta"><div class="product-brand">${brand}</div><h3 class="product-name" title="${name}">${name}</h3><div class="product-sub"><span class="product-gender">${gender}</span><span class="product-family">${family}</span></div></div></article>`;
}
function render(){const all=visibleProducts();const shown=all.slice(0,state.limit);productGrid.innerHTML=shown.map(cardHTML).join('');$('#resultCount').textContent=all.length.toLocaleString('es-CR');$('#pageStatus').textContent=all.length?`Mostrando ${shown.length} de ${all.length} fragancias`:'Sin resultados';$('#emptyState').hidden=all.length!==0;$('#loadMore').hidden=shown.length>=all.length;productGrid.hidden=all.length===0;}
function persistCart(){try{localStorage.setItem('rrParfumCart',JSON.stringify(state.cart));}catch(error){console.error('No se pudo guardar el carrito en este navegador.',error);}}
function loadCart(){try{const stored=JSON.parse(localStorage.getItem('rrParfumCart')||'[]');if(!Array.isArray(stored))throw new Error('El contenido guardado no es una lista.');state.cart=[...new Set(stored.map(String))];}catch(error){state.cart=[];console.warn('No se pudo recuperar el carrito guardado; se iniciará uno vacío.',error);}state.cart=state.cart.filter(id=>state.products.some(product=>String(product.id)===id));persistCart();renderCart();}
function renderCart(){
 const items=state.cart.map(id=>state.products.find(product=>String(product.id)===id)).filter(Boolean);
 $('#cartCount').textContent=String(items.length);$('#floatingCart').setAttribute('aria-label',`Abrir carrito, ${items.length} ${items.length===1?'producto':'productos'}`);
 $('#cartItems').innerHTML=items.length?items.map(product=>`<article class="cart-item"><img class="cart-item-image" src="${escapeHTML(productImage(product))}" alt="${escapeHTML(product.nombre||'Fragancia')}" loading="lazy" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=300&q=80'"><div class="cart-item-info"><b>${escapeHTML(product.nombre||'Fragancia')}</b><span>${escapeHTML(product.marca||'RR Parfum')}${product.version?` · ${escapeHTML(product.version)}`:''}</span><button class="cart-details-button" type="button" data-details-id="${escapeHTML(product.id)}">Ver detalles del perfume ↗</button></div><button class="cart-remove" type="button" data-remove-id="${escapeHTML(product.id)}" aria-label="Eliminar ${escapeHTML(product.nombre||'fragancia')} del carrito">Eliminar</button></article>`).join(''):'<p class="cart-empty">Tu carrito está vacío. Agregá perfumes desde sus fichas.</p>';
 $('#startCheckout').disabled=!items.length;
 $('#checkoutProducts').textContent=items.length?`Tu pedido incluye ${items.length} ${items.length===1?'perfume':'perfumes'}.`:'No hay perfumes en el carrito.';
}
function openCart(){if($('#productModal').classList.contains('open'))closeModal();renderCart();$('#cartModal').classList.add('open');$('#cartModal').setAttribute('aria-hidden','false');document.body.style.overflow='hidden';$('#cartClose').focus();}
function closeCart(){ $('#cartModal').classList.remove('open');$('#cartModal').setAttribute('aria-hidden','true');document.body.style.overflow='';}
function openCheckout(){if(!state.cart.length)return;closeCart();$('#checkoutStatus').textContent='';$('#checkoutModal').classList.add('open');$('#checkoutModal').setAttribute('aria-hidden','false');document.body.style.overflow='hidden';updateDeliveryOptions();$('#checkoutModal').querySelector('[name="nombre"]').focus();}
function closeCheckout(){ $('#checkoutModal').classList.remove('open');$('#checkoutModal').setAttribute('aria-hidden','true');document.body.style.overflow='';}
function addActiveProductToCart(){const product=state.activeProduct;if(!product)return;const id=String(product.id);if(!state.cart.includes(id)){state.cart.push(id);persistCart();}state.returnToCart=false;closeModal();openCart();}
function setDeliverySection(section,visible){section.hidden=!visible;section.querySelectorAll('input,textarea').forEach(input=>{if(!['radio','hidden','search'].includes(input.type))input.required=visible;});}
function loadLeaflet(){
 if(window.L)return Promise.resolve(window.L);
 if(state.leafletPromise)return state.leafletPromise;
 state.leafletPromise=new Promise((resolve,reject)=>{
  const stylesheet=document.createElement('link');stylesheet.rel='stylesheet';stylesheet.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';document.head.append(stylesheet);
  const script=document.createElement('script');script.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';script.onload=()=>window.L?resolve(window.L):reject(new Error('Leaflet no está disponible.'));script.onerror=()=>reject(new Error('No se pudo cargar el mapa. Verificá tu conexión a internet.'));document.head.append(script);
 });
 return state.leafletPromise;
}
function setDeliveryPin(latitude,longitude){
 const position=[Number(latitude),Number(longitude)];if(!position.every(Number.isFinite))return;
 $('#deliveryLatitude').value=String(position[0]);$('#deliveryLongitude').value=String(position[1]);
 if(state.deliveryMarker)state.deliveryMarker.setLatLng(position);else state.deliveryMarker=window.L.marker(position,{draggable:true}).addTo(state.deliveryMap).on('dragend',event=>{const point=event.target.getLatLng();setDeliveryPin(point.lat,point.lng);});
 state.gamValidation='pending';const token=++state.gamValidationToken;clearTimeout(state.gamValidationTimer);
 setMapStatus('Verificando si la ubicación está dentro del GAM…');
 state.gamValidationTimer=setTimeout(()=>verifyGamLocation(position[0],position[1],token),500);
}
const GAM_CANTONS=new Set(['san jose','escazu','desamparados','aserri','mora','goicoechea','santa ana','alajuelita','vazquez de coronado','tibas','moravia','montes de oca','curridabat','alajuela','grecia','atenas','cartago','paraiso','la union','alvarado','oreamuno','el guarco','barva','santo domingo','santa barbara','san rafael','san isidro','belen','flores','san pablo']);
function normalizedCanton(value){return normalize(value).replace(/^(canton|cant[oó]n|municipio|municipality)\\s+(de|del)\\s+/,'').replace(/^(canton|cant[oó]n|municipio|municipality)\\s+/,'').trim();}
async function verifyGamLocation(latitude,longitude,token){
 try{
  const delay=Math.max(0,1100-(Date.now()-state.lastGeocodeRequest));if(delay)await new Promise(resolve=>setTimeout(resolve,delay));
  if(token!==state.gamValidationToken)return;
  state.lastGeocodeRequest=Date.now();
  const params=new URLSearchParams({format:'jsonv2',lat:String(latitude),lon:String(longitude),zoom:'10',addressdetails:'1'});
  const response=await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`);
  if(!response.ok)throw new Error('El servicio de verificación de ubicación no respondió.');
  const result=await response.json();if(token!==state.gamValidationToken)return;
  if(result.error||!result.address)throw new Error('No se pudo identificar el cantón de esta ubicación.');
  if(result.address.country_code!=='cr'){state.gamValidation='outside';setMapStatus('La ubicación está fuera de Costa Rica. Para esta dirección, seleccioná envío por Correos de Costa Rica.','error');return;}
  const address=result.address;const cantonValue=address.county||address.municipality||address.city_district;
  if(!cantonValue)throw new Error('No se pudo identificar el cantón de esta ubicación.');
  const canton=normalizedCanton(cantonValue);const inside=GAM_CANTONS.has(canton);
  state.gamValidation=inside?'inside':'outside';
  if(inside)setMapStatus(`Ubicación verificada en ${cantonValue}; está dentro de los cantones reconocidos del GAM.`,'success');
  else setMapStatus('Esta ubicación no está dentro de los cantones reconocidos del GAM. Para esta dirección, seleccioná envío por Correos de Costa Rica.','error');
 }catch(error){
  if(token!==state.gamValidationToken)return;
  state.gamValidation='unverified';setMapStatus(`No se pudo verificar si la ubicación está dentro del GAM. ${error.message} Probá otro punto o elegí Correos de Costa Rica.`,'error');console.error(error);
 }
}
async function initializeDeliveryMap(){
 setMapStatus('Cargando mapa…');
 try{const L=await loadLeaflet();if(!state.deliveryMap){state.deliveryMap=L.map('deliveryMap').setView([9.9,-84.1],8);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap'}).addTo(state.deliveryMap);state.deliveryMap.on('click',event=>setDeliveryPin(event.latlng.lat,event.latlng.lng));}setTimeout(()=>state.deliveryMap.invalidateSize(),100);setMapStatus('Buscá una dirección o toca el mapa para marcar el punto.');}
 catch(error){setMapStatus(error.message,'error');console.error(error);}
}
async function searchDeliveryAddress(){
 const query=$('#mapSearchInput').value.trim();if(!query){setMapStatus('Escribí una dirección para buscar.');return;}
 setMapStatus('Buscando dirección…');$('#mapResults').replaceChildren();
 try{const delay=Math.max(0,1000-(Date.now()-state.lastGeocodeRequest));if(delay)await new Promise(resolve=>setTimeout(resolve,delay));state.lastGeocodeRequest=Date.now();const url=`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=cr&q=${encodeURIComponent(query)}`;const response=await fetch(url);if(!response.ok)throw new Error('El buscador de direcciones no respondió. Intentá de nuevo.');const results=await response.json();if(!results.length){setMapStatus('No encontramos esa dirección. Probá con otra búsqueda o seleccioná el punto en el mapa.');return;}
  results.forEach(result=>{const button=document.createElement('button');button.type='button';button.className='map-result';button.textContent=result.display_name;button.addEventListener('click',()=>{const latitude=Number(result.lat),longitude=Number(result.lon);$('#gamAddress').value=result.display_name;setDeliveryPin(latitude,longitude);state.deliveryMap.setView([latitude,longitude],16);$('#mapResults').replaceChildren();});$('#mapResults').append(button);});setMapStatus('Elegí una dirección de los resultados para marcarla en el mapa.');
 }catch(error){setMapStatus(error.message,'error');console.error(error);}
}
function updateDeliveryOptions(){
 const gamSelected=$('input[name="envioGAM"]:checked').value==='si';const correosSelected=$('input[name="envioCorreos"]:checked').value==='si';
 setDeliverySection($('#gamDeliveryFields'),gamSelected);setDeliverySection($('#correosFields'),correosSelected);
 if(gamSelected)initializeDeliveryMap();
}
function handleDeliverySelection(event){
 const option=event.target;if(!option.matches('input[type="radio"][value="si"]'))return;
 const otherName=option.name==='envioGAM'?'envioCorreos':'envioGAM';
 if($(`input[name="${otherName}"]:checked`).value!=='si')return;
 event.preventDefault();
 const otherMethod=otherName==='envioGAM'?'entrega en el GAM (Uber Flash o entrega personal)':'Correos de Costa Rica';
 const selectedMethod=option.name==='envioGAM'?'entrega en el GAM (Uber Flash o entrega personal)':'Correos de Costa Rica';
 const alert=$('#deliveryAlert');alert.textContent=`Ya seleccionaste ${otherMethod}. Para elegir ${selectedMethod}, primero seleccioná «No, pedido normal» en esa opción.`;alert.hidden=false;
}
function sanitizeNumericCustomerField(event){
 const input=event.target;if(!['cedula','telefono'].includes(input.name))return;
 const digits=input.value.replace(/\D/g,'');
 if(input.value!==digits)input.value=digits;
}
function submitOrder(event){
 event.preventDefault();const form=event.currentTarget;const data=new FormData(form);const gamSelected=data.get('envioGAM')==='si',correosSelected=data.get('envioCorreos')==='si';
 if(gamSelected&&correosSelected){$('#checkoutStatus').textContent='Elegí un solo tipo de envío: Uber Flash/entrega personal o Correos de Costa Rica.';return;}
 if(!form.reportValidity())return;
 const customer={nombre:String(data.get('nombre')||'').trim(),cedula:String(data.get('cedula')||'').trim(),correo:String(data.get('correo')||'').trim(),telefono:String(data.get('telefono')||'').trim()};
 if(Object.values(customer).some(value=>!value)){$('#checkoutStatus').textContent='Completá todos los datos del cliente para continuar.';return;}
 if(gamSelected&&(!data.get('direccionGAM')||!data.get('latitud')||!data.get('longitud'))){$('#checkoutStatus').textContent='Completá la dirección y seleccioná un punto en el mapa.';return;}
 if(gamSelected&&state.gamValidation!=='inside'){$('#checkoutStatus').textContent=state.gamValidation==='outside'?'Esta ubicación está fuera del GAM. El envío para esta dirección debe realizarse por Correos de Costa Rica.':'Esperá a que se verifique la ubicación del mapa. Si no se puede verificar, elegí Correos de Costa Rica.';return;}
 const items=state.cart.map(id=>state.products.find(product=>String(product.id)===id)).filter(Boolean);if(!items.length){$('#checkoutStatus').textContent='Agregá al menos un perfume antes de realizar el pedido.';return;}
 const lines=items.map(product=>`- ${product.nombre||'Fragancia'}${product.marca?` — ${product.marca}`:''}${product.version?` (${product.version})`:''}`);
 const delivery=gamSelected?['Entrega solicitada en el GAM (Uber Flash o entrega personal; método a coordinar)',`Dirección: ${data.get('direccionGAM')}`,`Ubicación en mapa: https://www.openstreetmap.org/?mlat=${data.get('latitud')}&mlon=${data.get('longitud')}#map=17/${data.get('latitud')}/${data.get('longitud')}`]:correosSelected?['Envío: Correos de Costa Rica',`Provincia: ${data.get('provincia')}`,`Cantón: ${data.get('canton')}`,`Distrito: ${data.get('distrito')}`,`Código postal: ${data.get('codigoPostal')}`,`Otras señas: ${data.get('senas')}`]:['Entrega: Pedido normal (sin envío especial)'];
 const message=['Hola, RR Parfum. Quisiera realizar el siguiente pedido:','',`Nombre completo: ${customer.nombre}`,`Cédula: ${customer.cedula}`,`Correo electrónico: ${customer.correo}`,`Teléfono: ${customer.telefono}`,'',...delivery,'','Perfumes:',...lines].join('\n');
 const link=document.createElement('a');link.href=whatsappUrl(message);link.target='_blank';link.rel='noopener noreferrer';document.body.append(link);link.click();link.remove();$('#checkoutStatus').textContent='WhatsApp se abrió con tu pedido listo. Enviá el mensaje para confirmar la solicitud.';
}
function productValues(value){const values=Array.isArray(value)?value:typeof value==='string'?value.split(','):[];return values.filter(item=>typeof item==='string').map(item=>item.trim()).filter(Boolean);}
function setModalImage(index){state.activeImageIndex=(index+state.activeImages.length)%state.activeImages.length;$('#modalImage').src=state.activeImages[state.activeImageIndex];$('#modalImage').alt=`${state.activeProduct.nombre||'Fragancia'} — imagen ${state.activeImageIndex+1}`;document.querySelectorAll('#modalImageDots button').forEach((dot,dotIndex)=>{const active=dotIndex===state.activeImageIndex;dot.classList.toggle('active',active);dot.setAttribute('aria-pressed',String(active));});}
function openProduct(id){
 const p=state.products.find(x=>String(x.id)===String(id));if(!p)return;state.activeProduct=p;
 state.activeImages=productImages(p);state.activeImageIndex=0;const hasMultipleImages=state.activeImages.length>1;$('#modalImageDots').innerHTML=hasMultipleImages?state.activeImages.map((_,index)=>`<button class="modal-image-dot${index===0?' active':''}" type="button" data-image-index="${index}" aria-label="Ver imagen ${index+1}" aria-pressed="${index===0}"></button>`).join(''):'';$('#modalImageDots').hidden=!hasMultipleImages;$('#modalImagePrev').hidden=!hasMultipleImages;$('#modalImageNext').hidden=!hasMultipleImages;setModalImage(0);
 $('#modalCategory').textContent=categoryLabel(p);$('#modalBrand').textContent=p.marca||'RR PARFUM';$('#modalName').textContent=p.nombre||'Fragancia';$('#modalGender').textContent=[p.genero,p.version||p.concentracion||p.edicion].filter(Boolean).join(' · ');$('#modalDescription').textContent=p.descripcion||`Descubrí ${p.nombre}, una fragancia seleccionada para expresar tu estilo.`;
 const accords=productValues(p.acordesPrincipales||p.acordes);
 $('#modalAccords').innerHTML=accords.length?`<ul class="accord-list">${accords.map((accord,index)=>`<li class="accord-item accord-color-${index%5}"><span>${escapeHTML(accord)}</span></li>`).join('')}</ul>`:'<div class="detail-item"><b>Acordes por consultar</b></div>';
 const facts=[['Género',p.genero],['Marca',p.marca],['Segmento',p.segmento||categoryLabel(p)],['Concentración',p.concentracion||p.concentración],['Familia olfativa',p.familia],['Persistencia',p.persistencia||p.duracion],['Intensidad',p.intensidad?`${p.intensidad}/5`:null],['Proyección',p.proyeccion?`${p.proyeccion}/5`:null]];
 $('#modalFacts').innerHTML=facts.map(([k,v])=>`<div class="detail-item"><small>${escapeHTML(k)}</small><b>${escapeHTML(v||'Por consultar')}</b></div>`).join('');
 const notes=[['Salida',p.notasSalida],['Corazón',p.notasCorazon],['Fondo',p.notasFondo]];
 const hasNotes=notes.some(([,value])=>productValues(value).length);
 $('#modalNotes').innerHTML=notes.map(([label,value])=>`<div><strong>Notas de ${label}:</strong> ${escapeHTML(productValues(value).join(', ')||'Por consultar')}</div>`).join('')+(!hasNotes&&p.resena?`<p><strong>Reseña:</strong> ${escapeHTML(p.resena)}</p>`:'');
 $('#modalWhatsApp').href=whatsappLink(p);$('#productModal').classList.add('open');$('#productModal').setAttribute('aria-hidden','false');document.body.style.overflow='hidden';$('#modalClose').focus();
}
function closeModal(){$('#productModal').classList.remove('open');$('#productModal').setAttribute('aria-hidden','true');document.body.style.overflow='';state.activeProduct=null;state.activeImages=[];state.activeImageIndex=0;if(state.returnToCart){state.returnToCart=false;openCart();}}
function selectCategory(category){state.category=category;state.limit=16;document.querySelectorAll('.chip').forEach(b=>b.classList.toggle('active',b.dataset.category===category));render();}
async function init(){setContactLinks();$('#year').textContent=new Date().getFullYear();try{const res=await fetch(RR_CONFIG.productsUrl);if(!res.ok)throw new Error('No se pudo cargar products.json');const data=await res.json();state.products=Array.isArray(data)?data:[];state.products.forEach(p=>{p.categoria=normalizedCategory(p);});}catch(e){const fallback=window.RR_PRODUCTS;if(Array.isArray(fallback)&&fallback.length){state.products=fallback;state.products.forEach(p=>{p.categoria=normalizedCategory(p);});console.warn('Catálogo cargado desde los datos integrados.');}else{productGrid.innerHTML='<p class="load-error">No se pudo cargar el catálogo. Verificá que products-data.js esté junto a index.html.</p>';$('#resultCount').textContent='—';console.error(e);}}
 loadCart();updateDeliveryOptions();const addButton=document.createElement('button');addButton.className='button button-outline modal-add-cart';addButton.type='button';addButton.textContent='Agregar al carrito';$('#modalWhatsApp').before(addButton);addButton.addEventListener('click',addActiveProductToCart);
 render();setTimeout(()=>$('#preloader').classList.add('done'),1200);
 $('#categoryFilters').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(b)selectCategory(b.dataset.category);});document.querySelectorAll('.collection-card[data-category]').forEach(el=>el.addEventListener('click',()=>selectCategory(el.dataset.category)));
 $('#searchInput').addEventListener('input',e=>{state.search=e.target.value;state.limit=16;$('#clearSearch').style.visibility=state.search?'visible':'hidden';render();});$('#clearSearch').addEventListener('click',()=>{$('#searchInput').value='';state.search='';$('#clearSearch').style.visibility='hidden';render();$('#searchInput').focus();});$('#genderFilter').addEventListener('change',e=>{state.gender=e.target.value;state.limit=16;render();});$('#sortFilter').addEventListener('change',e=>{state.sort=e.target.value;render();});$('#loadMore').addEventListener('click',()=>{state.limit+=16;render();});$('#resetFilters').addEventListener('click',()=>{state.category='Todos';state.gender='Todos';state.search='';state.sort='featured';state.limit=16;$('#searchInput').value='';$('#genderFilter').value='Todos';$('#sortFilter').value='featured';$('#clearSearch').style.visibility='hidden';selectCategory('Todos');});productGrid.addEventListener('click',e=>{const card=e.target.closest('[data-id]');if(card)openProduct(card.dataset.id);});productGrid.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-id]')){e.preventDefault();openProduct(e.target.dataset.id);}});$('#modalImagePrev').addEventListener('click',()=>setModalImage(state.activeImageIndex-1));$('#modalImageNext').addEventListener('click',()=>setModalImage(state.activeImageIndex+1));$('#modalImageDots').addEventListener('click',e=>{const dot=e.target.closest('[data-image-index]');if(dot)setModalImage(Number(dot.dataset.imageIndex));});$('#modalClose').addEventListener('click',closeModal);$('#productModal').addEventListener('click',e=>{if(e.target===$('#productModal'))closeModal();});
 $('#floatingCart').addEventListener('click',openCart);$('#cartClose').addEventListener('click',closeCart);$('#continueShopping').addEventListener('click',closeCart);$('#cartModal').addEventListener('click',e=>{if(e.target===$('#cartModal'))closeCart();});$('#cartItems').addEventListener('click',e=>{const details=e.target.closest('[data-details-id]');if(details){const id=details.dataset.detailsId;closeCart();state.returnToCart=true;openProduct(id);return;}const remove=e.target.closest('[data-remove-id]');if(!remove)return;state.cart=state.cart.filter(id=>id!==String(remove.dataset.removeId));persistCart();renderCart();});$('#startCheckout').addEventListener('click',openCheckout);$('#checkoutClose').addEventListener('click',closeCheckout);$('#checkoutModal').addEventListener('click',e=>{if(e.target===$('#checkoutModal'))closeCheckout();});$('#backToCart').addEventListener('click',()=>{closeCheckout();openCart();});$('#checkoutForm').addEventListener('input',sanitizeNumericCustomerField);$('#checkoutForm').addEventListener('click',handleDeliverySelection);$('#checkoutForm').addEventListener('change',e=>{if(e.target.name==='envioGAM'||e.target.name==='envioCorreos'){updateDeliveryOptions();$('#deliveryAlert').hidden=true;$('#deliveryAlert').textContent='';}});$('#checkoutForm').addEventListener('submit',submitOrder);$('#mapSearchButton').addEventListener('click',searchDeliveryAddress);$('#mapSearchInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();searchDeliveryAddress();}});
 document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if($('#checkoutModal').classList.contains('open'))closeCheckout();else if($('#cartModal').classList.contains('open'))closeCart();else closeModal();});$('#searchToggle').addEventListener('click',()=>{document.querySelector('#catalogo').scrollIntoView({behavior:'smooth'});setTimeout(()=>$('#searchInput').focus(),450);});$('#menuToggle').addEventListener('click',()=>{$('.desktop-nav').classList.toggle('open');});document.querySelectorAll('.desktop-nav a').forEach(a=>a.addEventListener('click',()=>$('.desktop-nav').classList.remove('open')));
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
}
document.addEventListener('DOMContentLoaded',init);
