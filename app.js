/* RR PARFUM — Configurá tus canales de venta antes de publicar. */
const RR_CONFIG = {
  whatsappNumber: "50670470857",
  instagramUrl: "https://www.instagram.com/", // Pegá aquí el perfil oficial de RR Parfum
  productsUrl: "products.json"
};
const state = { products: [], category: 'Todos', gender: 'Todos', search: '', sort: 'featured', limit: 16, activeProduct: null, activeImages: [], activeImageIndex: 0 };
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
function whatsappLink(p){const number=RR_CONFIG.whatsappNumber.replace(/\D/g,'');const msg=p?`Hola, RR Parfum. Quisiera consultar precio y disponibilidad de ${p.nombre}${p.marca?` de ${p.marca}`:''}${p.version?` (${p.version})`:''}.`:'Hola, RR Parfum. Quisiera información sobre sus perfumes y disponibilidad.';return number?`https://wa.me/${number}?text=${encodeURIComponent(msg)}`:`https://wa.me/?text=${encodeURIComponent(msg)}`;}
function setContactLinks(){const wa=whatsappLink();['#contactWhatsApp','#floatingWhatsApp'].forEach(s=>{const el=$(s);if(el)el.href=wa;});const instagramUrl=RR_CONFIG.instagramUrl;['#contactInstagram','#floatingInstagram'].forEach(s=>{const el=$(s);if(el)el.href=instagramUrl;});}
function visibleProducts(){let list=state.products.filter(p=>{const cat=normalizedCategory(p);const categoryOK=state.category==='Todos'||(state.category==='Nicho'?cat==='Nicho':cat===state.category);const genderOK=state.gender==='Todos'||normalize(p.genero)===normalize(state.gender);const haystack=normalize([p.nombre,p.marca,p.categoria,p.genero,p.familia,p.descripcion,p.concentracion,p.version].filter(Boolean).join(' '));return categoryOK&&genderOK&&haystack.includes(normalize(state.search));});if(state.sort==='az')list.sort((a,b)=>a.nombre.localeCompare(b.nombre,'es'));if(state.sort==='za')list.sort((a,b)=>b.nombre.localeCompare(a.nombre,'es'));if(state.sort==='brand')list.sort((a,b)=>(a.marca||'').localeCompare(b.marca||'','es'));if(state.sort==='featured'&&state.category==='Todos'&&state.gender==='Todos')list=interleaveByGender(list);return list;}
function cardHTML(p,index){const name=escapeHTML(p.nombre||'Fragancia');const brand=escapeHTML(p.marca||'RR Parfum');const gender=escapeHTML(p.genero||'Unisex');const cat=escapeHTML(categoryLabel(p));const img=escapeHTML(productImage(p));const version=p.version||p.concentracion||p.edicion||'';const family=escapeHTML(p.familia||'Fragancia seleccionada');const rating=Number(p.rating);const ratingHTML=Number.isFinite(rating)&&rating>0?`<span class="product-rating" aria-label="Calificación ${rating.toFixed(1)} de 5">★ <b>${rating.toFixed(1)}</b></span>`:'';return `<article class="product-card" tabindex="0" role="button" aria-label="Ver detalles de ${name}" data-id="${escapeHTML(p.id)}" style="animation-delay:${Math.min(index%8,7)*35}ms"><div class="product-image"><img src="${img}" alt="${name} — ${brand}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=90'"><span class="product-tag">${cat}</span>${ratingHTML}<span class="product-view">DESCUBRIR FRAGANCIA <span>↗</span></span></div><div class="product-meta"><div class="product-brand">${brand}</div><h3 class="product-name" title="${name}">${name}</h3><div class="product-sub"><span class="product-gender">${gender}</span><span class="product-family">${family}</span></div><div class="product-cta"><span>Consultar disponibilidad</span><span class="cta-arrow">↗</span></div></div></article>`;}
function render(){const all=visibleProducts();const shown=all.slice(0,state.limit);productGrid.innerHTML=shown.map(cardHTML).join('');$('#resultCount').textContent=all.length.toLocaleString('es-CR');$('#pageStatus').textContent=all.length?`Mostrando ${shown.length} de ${all.length} fragancias`:'Sin resultados';$('#emptyState').hidden=all.length!==0;$('#loadMore').hidden=shown.length>=all.length;productGrid.hidden=all.length===0;}
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
function closeModal(){$('#productModal').classList.remove('open');$('#productModal').setAttribute('aria-hidden','true');document.body.style.overflow='';state.activeProduct=null;state.activeImages=[];state.activeImageIndex=0;}
function selectCategory(category){state.category=category;state.limit=16;document.querySelectorAll('.chip').forEach(b=>b.classList.toggle('active',b.dataset.category===category));render();}
async function init(){setContactLinks();$('#year').textContent=new Date().getFullYear();try{const res=await fetch(RR_CONFIG.productsUrl);if(!res.ok)throw new Error('No se pudo cargar products.json');const data=await res.json();state.products=Array.isArray(data)?data:[];state.products.forEach(p=>{p.categoria=normalizedCategory(p);});}catch(e){const fallback=window.RR_PRODUCTS;if(Array.isArray(fallback)&&fallback.length){state.products=fallback;state.products.forEach(p=>{p.categoria=normalizedCategory(p);});console.warn('Catálogo cargado desde los datos integrados.');}else{productGrid.innerHTML='<p class="load-error">No se pudo cargar el catálogo. Verificá que products-data.js esté junto a index.html.</p>';$('#resultCount').textContent='—';console.error(e);}}
 render();setTimeout(()=>$('#preloader').classList.add('done'),1200);
 $('#categoryFilters').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(b)selectCategory(b.dataset.category);});document.querySelectorAll('.collection-card[data-category]').forEach(el=>el.addEventListener('click',()=>selectCategory(el.dataset.category)));
 $('#searchInput').addEventListener('input',e=>{state.search=e.target.value;state.limit=16;$('#clearSearch').style.visibility=state.search?'visible':'hidden';render();});$('#clearSearch').addEventListener('click',()=>{$('#searchInput').value='';state.search='';$('#clearSearch').style.visibility='hidden';render();$('#searchInput').focus();});$('#genderFilter').addEventListener('change',e=>{state.gender=e.target.value;state.limit=16;render();});$('#sortFilter').addEventListener('change',e=>{state.sort=e.target.value;render();});$('#loadMore').addEventListener('click',()=>{state.limit+=16;render();});$('#resetFilters').addEventListener('click',()=>{state.category='Todos';state.gender='Todos';state.search='';state.sort='featured';state.limit=16;$('#searchInput').value='';$('#genderFilter').value='Todos';$('#sortFilter').value='featured';$('#clearSearch').style.visibility='hidden';selectCategory('Todos');});productGrid.addEventListener('click',e=>{const card=e.target.closest('[data-id]');if(card)openProduct(card.dataset.id);});productGrid.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-id]')){e.preventDefault();openProduct(e.target.dataset.id);}});$('#modalImagePrev').addEventListener('click',()=>setModalImage(state.activeImageIndex-1));$('#modalImageNext').addEventListener('click',()=>setModalImage(state.activeImageIndex+1));$('#modalImageDots').addEventListener('click',e=>{const dot=e.target.closest('[data-image-index]');if(dot)setModalImage(Number(dot.dataset.imageIndex));});$('#modalClose').addEventListener('click',closeModal);$('#productModal').addEventListener('click',e=>{if(e.target===$('#productModal'))closeModal();});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});$('#searchToggle').addEventListener('click',()=>{document.querySelector('#catalogo').scrollIntoView({behavior:'smooth'});setTimeout(()=>$('#searchInput').focus(),450);});$('#menuToggle').addEventListener('click',()=>{$('.desktop-nav').classList.toggle('open');});document.querySelectorAll('.desktop-nav a').forEach(a=>a.addEventListener('click',()=>$('.desktop-nav').classList.remove('open')));
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
}
document.addEventListener('DOMContentLoaded',init);
